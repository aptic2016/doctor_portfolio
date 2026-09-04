"use client"

import React, { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Save, Monitor, Smartphone, RotateCcw, GripVertical, Plus, Trash2, Copy, User, Scissors, Loader2, Check, Square, CheckSquare, BadgeCheck } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { updateHeroOverlayAdmin, createHeroOverlayAdmin, deleteHeroOverlayAdmin, duplicateHeroOverlayAdmin, bulkDeleteHeroOverlaysAdmin } from "../settings/actions"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { HeroOverlayPocket, HeroPortraitStage } from "@/components/shared/hero-visual"

interface HeroOverlay {
  id: string
  key: string
  label: string
  valueType: string
  customValue: string | null
  valueSource: string | null
  isVisible: boolean
  desktopVisible: boolean
  mobileVisible: boolean
  desktopX: number
  desktopY: number
  mobileX: number
  mobileY: number
  width: string
  alignment: string
  opacity: number
  styleVariant: string
  sortOrder: number
}

interface BrandSettings {
  portraitScale?: string
  portraitX?: string
  portraitY?: string
  portraitMaxHeight?: string
  portraitFit?: string
  heroBackground?: string
  heroOverlayStyle?: string
  heroMobileLayout?: string
  heroMobilePortraitHeight?: string
  heroBadgeText?: string
  heroShowBadge?: boolean
  profileImage?: string | null
}

const PRESETS: Record<string, { x: number; y: number }> = {
  "Top Left": { x: 5, y: 5 },
  "Top Right": { x: 75, y: 5 },
  "Center Left": { x: 5, y: 45 },
  "Center Right": { x: 75, y: 45 },
  "Bottom Left": { x: 5, y: 85 },
  "Bottom Right": { x: 75, y: 85 },
}

const STYLE_VARIANTS = ["glass", "minimal", "outline", "solid"]
const BG_STYLES = ["minimal", "grid", "soft-glow", "clinical-digital"]
const MOBILE_HEIGHTS = ["compact", "balanced", "immersive"]
const MOBILE_LAYOUTS = ["portrait-first", "identity-first"]
const FIT_MODES = ["contain", "cover"]
const VALUE_SOURCES = [
  { value: "currentDesignation", label: "Current Designation" },
  { value: "currentOrganization", label: "Current Organization" },
  { value: "location", label: "Location" },
  { value: "qualificationCount", label: "Qualification Count" },
  { value: "certificationCount", label: "Certification Count" },
  { value: "publicationCount", label: "Publication Count" },
  { value: "experienceCount", label: "Experience Count" },
  { value: "educationCount", label: "Education Count" },
]

export function HeroEditorPage({ initialOverlays, initialBrand }: { initialOverlays: HeroOverlay[]; initialBrand: BrandSettings | null }) {
  const [overlays, setOverlays] = useState<HeroOverlay[]>(initialOverlays)
  const [brand, setBrand] = useState<BrandSettings>(initialBrand || {})
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRemovingBackground, setIsRemovingBackground] = useState(false)
  const [cutoutPreview, setCutoutPreview] = useState<{ original: string; cutout: string; cutoutId: string } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)

  const activeOverlay = overlays.find((o) => o.id === selectedId)

  const getX = (o: HeroOverlay) => preview === "desktop" ? o.desktopX : o.mobileX
  const getY = (o: HeroOverlay) => preview === "desktop" ? o.desktopY : o.mobileY
  const isVisible = (o: HeroOverlay) => preview === "desktop" ? o.desktopVisible : o.mobileVisible

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const overlay = overlays.find((o) => o.id === id)
    if (!overlay) return
    setDragging(id)
    setSelectedId(id)
    const xKey = preview === "desktop" ? "desktopX" : "mobileX"
    const yKey = preview === "desktop" ? "desktopY" : "mobileY"
    dragStartRef.current = { startX: e.clientX, startY: e.clientY, origX: overlay[xKey], origY: overlay[yKey] }

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragStartRef.current || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const dx = ((ev.clientX - dragStartRef.current.startX) / rect.width) * 100
      const dy = ((ev.clientY - dragStartRef.current.startY) / rect.height) * 100
      const newX = Math.round((dragStartRef.current.origX + dx) * 10) / 10
      const newY = Math.round((dragStartRef.current.origY + dy) * 10) / 10
      setOverlays((prev) => prev.map((o) => o.id === id ? { ...o, [xKey]: newX, [yKey]: newY } : o))
    }

    const handleMouseUp = () => {
      setDragging(null)
      dragStartRef.current = null
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }, [overlays, preview])

  const handleTouchStart = useCallback((e: React.TouchEvent, id: string) => {
    e.stopPropagation()
    const touch = e.touches[0]
    const overlay = overlays.find((o) => o.id === id)
    if (!overlay) return
    setDragging(id)
    setSelectedId(id)
    const xKey = preview === "desktop" ? "desktopX" : "mobileX"
    const yKey = preview === "desktop" ? "desktopY" : "mobileY"
    dragStartRef.current = { startX: touch.clientX, startY: touch.clientY, origX: overlay[xKey], origY: overlay[yKey] }

    const handleTouchMove = (ev: TouchEvent) => {
      if (!dragStartRef.current || !canvasRef.current) return
      const t = ev.touches[0]
      const rect = canvasRef.current.getBoundingClientRect()
      const dx = ((t.clientX - dragStartRef.current.startX) / rect.width) * 100
      const dy = ((t.clientY - dragStartRef.current.startY) / rect.height) * 100
      const newX = Math.round((dragStartRef.current.origX + dx) * 10) / 10
      const newY = Math.round((dragStartRef.current.origY + dy) * 10) / 10
      setOverlays((prev) => prev.map((o) => o.id === id ? { ...o, [xKey]: newX, [yKey]: newY } : o))
    }

    const handleTouchEnd = () => {
      setDragging(null)
      dragStartRef.current = null
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }

    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    window.addEventListener("touchend", handleTouchEnd)
  }, [overlays, preview])

  const updateOverlay = (id: string, field: string, value: unknown) => {
    setOverlays((prev) => prev.map((o) => o.id === id ? { ...o, [field]: value } : o))
  }

  const applyPreset = (id: string, preset: string) => {
    const p = PRESETS[preset]
    if (!p) return
    const xKey = preview === "desktop" ? "desktopX" : "mobileX"
    const yKey = preview === "desktop" ? "desktopY" : "mobileY"
    setOverlays((prev) => prev.map((o) => o.id === id ? { ...o, [xKey]: p.x, [yKey]: p.y } : o))
  }

  const addOverlay = async () => {
    try {
      const newOverlay = await createHeroOverlayAdmin({
        key: `overlay-${Date.now()}`,
        label: "New Overlay",
        valueType: "MANUAL",
        customValue: "Value",
        isVisible: true,
        desktopVisible: true,
        mobileVisible: true,
        desktopX: 50,
        desktopY: 50,
        mobileX: 50,
        mobileY: 50,
        width: "160px",
        alignment: "left",
        opacity: 1,
        styleVariant: "glass",
      })
      setOverlays((prev) => [...prev, newOverlay])
      setSelectedId(newOverlay.id)
      toast.success("Overlay added")
    } catch {
      toast.error("Failed to add overlay")
    }
  }

  const deleteOverlay = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteHeroOverlayAdmin(id)
      setOverlays((prev) => prev.filter((o) => o.id !== id))
      if (selectedId === id) setSelectedId(null)
      toast.success("Overlay deleted")
    } catch {
      toast.error("Failed to delete overlay")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const bulkDeleteOverlays = async () => {
    setIsDeleting(true)
    try {
      const ids = Array.from(selectedIds)
      await bulkDeleteHeroOverlaysAdmin(ids)
      setOverlays((prev) => prev.filter((o) => !selectedIds.has(o.id)))
      setSelectedIds(new Set())
      setSelectedId(null)
      toast.success(`${ids.length} overlay${ids.length > 1 ? "s" : ""} deleted successfully`)
    } catch {
      toast.error("Failed to delete overlays")
    } finally {
      setIsDeleting(false)
      setBulkDeleteTarget(false)
    }
  }

  const duplicateOverlay = async (id: string) => {
    try {
      const dup = await duplicateHeroOverlayAdmin(id)
      setOverlays((prev) => [...prev, dup])
      setSelectedId(dup.id)
      toast.success("Overlay duplicated")
    } catch {
      toast.error("Failed to duplicate overlay")
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === overlays.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(overlays.map((o) => o.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const results = await Promise.allSettled([
        ...overlays.map((o) => updateHeroOverlayAdmin(o.id, {
          label: o.label,
          valueType: o.valueType,
          customValue: o.customValue,
          valueSource: o.valueSource,
          isVisible: o.isVisible,
          desktopVisible: o.desktopVisible,
          mobileVisible: o.mobileVisible,
          desktopX: o.desktopX,
          desktopY: o.desktopY,
          mobileX: o.mobileX,
          mobileY: o.mobileY,
          width: o.width,
          alignment: o.alignment,
          opacity: o.opacity,
          styleVariant: o.styleVariant,
          sortOrder: o.sortOrder,
        })),
        fetch("/api/admin/brand-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileImage: brand.profileImage,
            portraitScale: brand.portraitScale,
            portraitX: brand.portraitX,
            portraitY: brand.portraitY,
            portraitMaxHeight: brand.portraitMaxHeight,
            portraitFit: brand.portraitFit,
            heroBackground: brand.heroBackground,
            heroOverlayStyle: brand.heroOverlayStyle,
            heroMobileLayout: brand.heroMobileLayout,
            heroMobilePortraitHeight: brand.heroMobilePortraitHeight,
            heroBadgeText: (brand.heroBadgeText ?? "").trim(),
            heroShowBadge: brand.heroShowBadge ?? true,
          }),
        }),
      ])
      const failed = results.filter((r) => r.status === "rejected")
      if (failed.length > 0) {
        toast.error("Some changes failed to save. Reloading...")
        window.location.reload()
      } else {
        toast.success("Hero layout saved")
      }
    } catch { toast.error("Failed to save") }
    setIsSaving(false)
  }

  const resetLayout = () => {
    setOverlays(initialOverlays)
    setBrand(initialBrand || {})
    toast.info("Layout reset to saved state")
  }

  const handleRemoveBackground = async () => {
    if (!brand.profileImage) {
      toast.error("No portrait selected")
      return
    }

    setIsRemovingBackground(true)
    try {
      const response = await fetch("/api/media/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaUrl: brand.profileImage }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Background removal failed")
      }

      const data = await response.json()
      setCutoutPreview({
        original: brand.profileImage,
        cutout: data.cutout.secureUrl,
        cutoutId: data.cutout.id,
      })
      toast.success("Background removed successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove background")
    } finally {
      setIsRemovingBackground(false)
    }
  }

  const handleUseCutout = () => {
    if (cutoutPreview) {
      setBrand({ ...brand, profileImage: cutoutPreview.cutout })
      setCutoutPreview(null)
      toast.success("Cutout applied as hero portrait")
    }
  }

  const handleKeepOriginal = () => {
    setCutoutPreview(null)
  }

  const isMobile = preview === "mobile"
  const canvasWidth = isMobile ? 375 : 380
  const canvasHeight = isMobile ? 500 : 500

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hero Visual Editor</h1>
          <p className="text-sm text-muted-foreground">Drag cards around the portrait to position them. Desktop and mobile positions are independent.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addOverlay}><Plus className="h-4 w-4 mr-1" /> Add Overlay</Button>
          <Button variant="outline" size="sm" onClick={resetLayout}><RotateCcw className="h-4 w-4 mr-1" /> Reset</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}><Save className="h-4 w-4 mr-1" /> {isSaving ? "Saving..." : "Save"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2 space-y-4">
          {/* Preview Toggle */}
          <div className="flex items-center gap-2">
            <Button variant={preview === "desktop" ? "default" : "outline"} size="sm" onClick={() => setPreview("desktop")}><Monitor className="h-4 w-4 mr-1" /> Desktop</Button>
            <Button variant={preview === "mobile" ? "default" : "outline"} size="sm" onClick={() => setPreview("mobile")}><Smartphone className="h-4 w-4 mr-1" /> Mobile</Button>
            <span className="text-xs text-muted-foreground ml-2">{canvasWidth}px &times; {canvasHeight}px</span>
          </div>

          {/* Canvas - Uses SAME dimensions as public hero */}
          <div className="border rounded-xl bg-muted/20 p-4 overflow-hidden">
            <div
              ref={canvasRef}
              className="relative mx-auto overflow-visible rounded-lg border bg-background"
              style={{ width: canvasWidth, height: canvasHeight, maxWidth: "100%" }}
            >
              {/* Background */}
              <div className="absolute inset-0 medical-grid opacity-20" />
              <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/[0.05] rounded-full blur-[80px]" />

              {/* Portrait - Uses SAME component as public */}
              <div
                className="absolute inset-0 flex items-end justify-center"
                style={{
                  transform: `translate(${brand.portraitX || 0}%, ${brand.portraitY || 0}%) scale(${brand.portraitScale || 1})`,
                }}
              >
                {brand.profileImage ? (
                  <Image
                    src={brand.profileImage}
                    alt="Portrait"
                    fill
                    className={`object-${brand.portraitFit || "contain"} object-bottom`}
                    sizes={`${canvasWidth}px`}
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground/30 pb-8">
                    <span className="text-xs">No Portrait</span>
                  </div>
                )}
              </div>

              {/* Overlays - Uses SAME positioning as public (left/top with translate -50%, -50%) */}
              {overlays.map((o) => {
                const x = getX(o)
                const y = getY(o)
                const vis = isVisible(o)
                if (!vis || !o.isVisible) return null

                const styleMap: Record<string, string> = {
                  glass: "glass-surface shadow-lg",
                  minimal: "bg-background/80 border border-border/50 shadow-sm",
                  outline: "bg-transparent border-2 border-primary/30",
                  solid: "bg-primary/10 border border-primary/20 shadow-sm",
                }

                return (
                  <div
                    key={o.id}
                    className={`absolute cursor-move select-none transition-shadow ${styleMap[o.styleVariant] || styleMap.glass} ${dragging === o.id ? "ring-2 ring-primary z-20" : "z-10"} ${selectedId === o.id ? "ring-1 ring-primary/50" : ""}`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: o.width || "160px",
                      opacity: o.opacity,
                      transform: "translate(-50%, -50%)",
                    }}
                    onMouseDown={(e) => handleMouseDown(e, o.id)}
                    onTouchStart={(e) => handleTouchStart(e, o.id)}
                    onClick={() => setSelectedId(o.id)}
                  >
                    <div className="px-3 py-2 rounded-lg">
                      <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-primary/60 flex items-center gap-1">
                        <GripVertical className="h-2.5 w-2.5" />
                        {o.label}
                      </div>
                      <div className="text-xs font-semibold text-foreground mt-0.5">
                        {o.valueType === "MANUAL" ? o.customValue : o.valueSource || "\u2014"}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          {/* Status Badge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                Status Badge
              </CardTitle>
              <CardDescription>The small status chip above the name on the public Hero</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px]" htmlFor="hero-status-badge-text">Status Badge Text</Label>
                <Input
                  id="hero-status-badge-text"
                  value={brand.heroBadgeText ?? ""}
                  onChange={(e) => setBrand({ ...brand, heroBadgeText: e.target.value })}
                  placeholder="Currently Practicing"
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label className="text-[10px]">Show Status Badge</Label>
                  <p className="text-[10px] text-muted-foreground">Off removes the badge from the public Hero entirely.</p>
                </div>
                <Switch
                  checked={brand.heroShowBadge ?? true}
                  onCheckedChange={(checked) => setBrand({ ...brand, heroShowBadge: checked })}
                  aria-label="Show status badge"
                />
              </div>

              {/* Live preview — same chip markup as the public Hero */}
              <div className="space-y-1 pt-1 border-t border-border/50">
                <Label className="text-[10px] text-muted-foreground">Preview</Label>
                {(brand.heroShowBadge ?? true) && (brand.heroBadgeText ?? "").trim() ? (
                  <div data-hero-status-badge-preview="" className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {(brand.heroBadgeText ?? "").trim()}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    {(brand.heroShowBadge ?? true)
                      ? "No badge — the text is empty."
                      : "Badge is hidden on the public Hero."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Doctor Portrait */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Doctor Portrait
              </CardTitle>
              <CardDescription>Select or upload the doctor&apos;s portrait photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {brand.profileImage ? (
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src={brand.profileImage}
                      alt="Portrait preview"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  
                  {/* Background Removal Section */}
                  {!cutoutPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleRemoveBackground}
                      disabled={isRemovingBackground}
                    >
                      {isRemovingBackground ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Removing background...
                        </>
                      ) : (
                        <>
                          <Scissors className="h-4 w-4 mr-1" />
                          Remove Background
                        </>
                      )}
                    </Button>
                  )}

                  {/* Cutout Preview */}
                  {cutoutPreview && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Original</Label>
                          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-muted">
                            <Image
                              src={cutoutPreview.original}
                              alt="Original"
                              fill
                              className="object-cover"
                              sizes="100px"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Cutout</Label>
                          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjhmOGY4Ii8+PHJlY3Qgd2lkdGg9IjUiIGhlaWdodD0iNSIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==')]">
                            <Image
                              src={cutoutPreview.cutout}
                              alt="Cutout"
                              fill
                              className="object-contain"
                              sizes="100px"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={handleUseCutout}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Use Cutout
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={handleKeepOriginal}
                        >
                          Keep Original
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <MediaPicker
                      value={brand.profileImage}
                      onChange={(url) => {
                        setBrand({ ...brand, profileImage: url })
                        setCutoutPreview(null)
                      }}
                      label=""
                      purpose="HERO"
                      filterPurpose="HERO"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => {
                      setBrand({ ...brand, profileImage: null })
                      setCutoutPreview(null)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove Portrait
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground">
                    <User className="h-12 w-12 mb-2 opacity-30" />
                    <p className="text-sm font-medium">No portrait selected</p>
                    <p className="text-xs mt-1">Add a doctor photo to display in the hero section</p>
                  </div>
                  <MediaPicker
                    value=""
                    onChange={(url) => setBrand({ ...brand, profileImage: url })}
                    label=""
                    purpose="HERO"
                    filterPurpose="HERO"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Overlay Controls */}
          {activeOverlay ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{activeOverlay.label}</CardTitle>
                <CardDescription>Configure this overlay card</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">Label</Label>
                  <Input value={activeOverlay.label} onChange={(e) => updateOverlay(activeOverlay.id, "label", e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Value Source</Label>
                  <select value={activeOverlay.valueSource || ""} onChange={(e) => updateOverlay(activeOverlay.id, "valueSource", e.target.value || null)} className="w-full h-8 text-xs rounded-md border bg-background px-2">
                    <option value="">None (Manual)</option>
                    {VALUE_SOURCES.map((vs) => (
                      <option key={vs.value} value={vs.value}>{vs.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Custom Value</Label>
                  <Input value={activeOverlay.customValue || ""} onChange={(e) => updateOverlay(activeOverlay.id, "customValue", e.target.value || null)} className="h-8 text-xs" placeholder="Override value" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Width</Label>
                    <Input value={activeOverlay.width} onChange={(e) => updateOverlay(activeOverlay.id, "width", e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Opacity</Label>
                    <Input type="number" min="0" max="1" step="0.1" value={activeOverlay.opacity} onChange={(e) => updateOverlay(activeOverlay.id, "opacity", parseFloat(e.target.value) || 1)} className="h-8 text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Style</Label>
                  <div className="flex gap-1 flex-wrap">
                    {STYLE_VARIANTS.map((s) => (
                      <button key={s} onClick={() => updateOverlay(activeOverlay.id, "styleVariant", s)} className={`px-3 py-2 text-xs rounded border capitalize min-h-[44px] ${activeOverlay.styleVariant === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Position Preset</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {Object.keys(PRESETS).map((p) => (
                      <button key={p} onClick={() => applyPreset(activeOverlay.id, p)} className="px-2 py-2 text-xs rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors min-h-[44px]">{p}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Position ({preview})</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-muted-foreground">X%</span>
                      <Input type="number" min="-30" max="130" step="0.5" value={preview === "desktop" ? activeOverlay.desktopX : activeOverlay.mobileX} onChange={(e) => updateOverlay(activeOverlay.id, preview === "desktop" ? "desktopX" : "mobileX", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground">Y%</span>
                      <Input type="number" min="-20" max="120" step="0.5" value={preview === "desktop" ? activeOverlay.desktopY : activeOverlay.mobileY} onChange={(e) => updateOverlay(activeOverlay.id, preview === "desktop" ? "desktopY" : "mobileY", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 text-[10px]">
                    <input type="checkbox" checked={activeOverlay.isVisible} onChange={(e) => updateOverlay(activeOverlay.id, "isVisible", e.target.checked)} className="rounded" /> Visible
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px]">
                    <input type="checkbox" checked={activeOverlay.desktopVisible} onChange={(e) => updateOverlay(activeOverlay.id, "desktopVisible", e.target.checked)} className="rounded" /> Desktop
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px]">
                    <input type="checkbox" checked={activeOverlay.mobileVisible} onChange={(e) => updateOverlay(activeOverlay.id, "mobileVisible", e.target.checked)} className="rounded" /> Mobile
                  </label>
                </div>
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button variant="outline" size="sm" className="min-h-[44px] text-xs" onClick={() => duplicateOverlay(activeOverlay.id)}><Copy className="h-3.5 w-3.5 mr-1" /> Duplicate</Button>
                   <Button variant="outline" size="sm" className="min-h-[44px] text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => setDeleteTarget(activeOverlay.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                Click an overlay card on the canvas to edit its position and settings.
              </CardContent>
            </Card>
          )}

          {/* Portrait Position Controls */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Portrait Position</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">Scale</Label>
                  <Input type="number" min="0.5" max="2" step="0.05" value={brand.portraitScale || "1"} onChange={(e) => setBrand({ ...brand, portraitScale: e.target.value })} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Fit Mode</Label>
                  <select value={brand.portraitFit || "contain"} onChange={(e) => setBrand({ ...brand, portraitFit: e.target.value })} className="w-full h-8 text-xs rounded-md border bg-background px-2">
                    {FIT_MODES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">X Offset %</Label>
                  <Input type="number" min="-50" max="50" step="1" value={brand.portraitX || "0"} onChange={(e) => setBrand({ ...brand, portraitX: e.target.value })} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Y Offset %</Label>
                  <Input type="number" min="-50" max="50" step="1" value={brand.portraitY || "0"} onChange={(e) => setBrand({ ...brand, portraitY: e.target.value })} className="h-8 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Mobile Portrait Height</Label>
                <div className="flex gap-1">
                  {MOBILE_HEIGHTS.map((h) => (
                    <button key={h} onClick={() => setBrand({ ...brand, heroMobilePortraitHeight: h })} className={`flex-1 px-3 py-2 text-xs rounded border capitalize min-h-[44px] ${brand.heroMobilePortraitHeight === h ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{h}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Mobile Layout</Label>
                <div className="flex gap-1">
                  {MOBILE_LAYOUTS.map((l) => (
                    <button key={l} onClick={() => setBrand({ ...brand, heroMobileLayout: l })} className={`flex-1 px-3 py-2 text-xs rounded border capitalize min-h-[44px] ${brand.heroMobileLayout === l ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{l.replace("-", " ")}</button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hero Background */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Background</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px]">Hero Background</Label>
                <div className="flex gap-1 flex-wrap">
                  {BG_STYLES.map((b) => (
                    <button key={b} onClick={() => setBrand({ ...brand, heroBackground: b })} className={`px-3 py-2 text-xs rounded border capitalize min-h-[44px] ${brand.heroBackground === b ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{b}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Overlay Style</Label>
                <div className="flex gap-1 flex-wrap">
                  {STYLE_VARIANTS.map((s) => (
                    <button key={s} onClick={() => setBrand({ ...brand, heroOverlayStyle: s })} className={`px-3 py-2 text-xs rounded border capitalize min-h-[44px] ${brand.heroOverlayStyle === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{s}</button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overlay List with Multi-Select */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">All Overlays</CardTitle>
                {overlays.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {selectedIds.size === 0 ? (
                      <button
                        onClick={toggleSelectAll}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 rounded hover:bg-muted"
                      >
                        Select All
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={toggleSelectAll}
                          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 rounded hover:bg-muted"
                        >
                          {selectedIds.size === overlays.length ? "Clear All" : "Select All"}
                        </button>
                        <span className="text-[10px] text-primary font-medium">{selectedIds.size} selected</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-6 px-2 text-[10px] gap-1"
                          onClick={() => setBulkDeleteTarget(true)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete ({selectedIds.size})
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {overlays.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No overlays yet. Click Add Overlay above.</p>
              )}
              {overlays.map((o) => (
                <div
                  key={o.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer group ${selectedId === o.id ? "bg-primary/10 text-primary" : selectedIds.has(o.id) ? "bg-primary/5 text-primary" : "hover:bg-muted text-muted-foreground"}`}
                  onClick={() => setSelectedId(o.id)}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSelect(o.id)
                      }}
                      className="p-0.5"
                    >
                      {selectedIds.has(o.id) ? (
                        <CheckSquare className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-muted-foreground/30" />
                      )}
                    </button>
                    {o.isVisible ? <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />}
                    {o.label}
                  </div>
                  <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); duplicateOverlay(o.id) }} className="p-1.5 rounded hover:bg-background/50" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(o.id) }} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Overlay"
        description="Are you sure you want to delete this overlay? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) deleteOverlay(deleteTarget) }}
      />

      <ConfirmDialog
        open={bulkDeleteTarget}
        onOpenChange={(open) => { if (!open) setBulkDeleteTarget(false) }}
        title={`Delete ${selectedIds.size} Overlay${selectedIds.size > 1 ? "s" : ""}?`}
        description="This will remove the selected overlays from the Hero layout."
        confirmLabel={`Delete ${selectedIds.size} Overlay${selectedIds.size > 1 ? "s" : ""}`}
        variant="destructive"
        loading={isDeleting}
        onConfirm={bulkDeleteOverlays}
      />
    </div>
  )
}
