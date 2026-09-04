"use client"

import React, { useState, useCallback, useRef, useEffect, useMemo, useLayoutEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Eye, EyeOff, Trash2, Copy, Monitor, Smartphone,
  Save, RotateCcw, Plus, Undo2, Redo2, ArrowUp, ArrowDown, Lock, Unlock,
  ZoomIn, ZoomOut, Grid3X3, Layers, Image, Type, Paintbrush,
  LayoutTemplate, GripVertical, X,
  Info, ArrowUpCircle, ArrowDownCircle, PanelLeft, PanelRight,
} from "lucide-react"
import { saveAllSpotlight } from "../settings/actions"
import { MediaPicker } from "@/components/admin/media/media-picker"
import {
  SPOTLIGHT_LOCAL_ID_PREFIX,
  SPOTLIGHT_STAGE,
  resolveSpotlightGeometry,
  type SpotlightImage,
  type SpotlightSetting,
} from "@/components/shared/spotlight/stage"
import { SpotlightStage } from "@/components/shared/spotlight/spotlight-stage"

const MAX_PHOTOS = 20

/** Photos added in the editor stay local (never in the DB) until Save. */
function makeLocalId() {
  const rand = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return `${SPOTLIGHT_LOCAL_ID_PREFIX}${rand}`
}

/* ─── WORKSPACE SIZE HOOK (ResizeObserver) ─── */
function useWorkspaceSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ w: 1200, h: 600 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ w: width, h: height })
    })
    obs.observe(el)
    const { width, height } = el.getBoundingClientRect()
    if (width > 0 && height > 0) setSize({ w: width, h: height })
    return () => obs.disconnect()
  }, [ref])
  return size
}

/* ─── DEFAULT LAYOUTS ─── */
const DESKTOP_DEFAULT = [
  { xPercent: 1, yPercent: 2, widthPercent: 47, heightPercent: 46, rotation: -1.5, zIndex: 1 },
  { xPercent: 52, yPercent: 2, widthPercent: 47, heightPercent: 46, rotation: 1, zIndex: 2 },
  { xPercent: 1, yPercent: 52, widthPercent: 47, heightPercent: 46, rotation: 1, zIndex: 3 },
  { xPercent: 52, yPercent: 52, widthPercent: 47, heightPercent: 46, rotation: -1, zIndex: 4 },
]

/* Mobile: 2×2 grid. Canvas height is set to 140% for 4 photos. */
const MOBILE_DEFAULT = [
  { mobileXPercent: 2, mobileYPercent: 2, mobileWidthPercent: 47, mobileHeightPercent: 46, mobileRotation: -1, zIndex: 1 },
  { mobileXPercent: 51, mobileYPercent: 2, mobileWidthPercent: 47, mobileHeightPercent: 46, mobileRotation: 1, zIndex: 2 },
  { mobileXPercent: 2, mobileYPercent: 52, mobileWidthPercent: 47, mobileHeightPercent: 46, mobileRotation: 1, zIndex: 3 },
  { mobileXPercent: 51, mobileYPercent: 52, mobileWidthPercent: 47, mobileHeightPercent: 46, mobileRotation: -1, zIndex: 4 },
]

function getDefaultLayout(i: number, isMobile: boolean) {
  const d = isMobile ? MOBILE_DEFAULT : DESKTOP_DEFAULT
  const base = d[i % d.length]
  if (isMobile) {
    return { ...base, xPercent: 0, yPercent: 0, widthPercent: 45, heightPercent: 63, rotation: 0 }
  }
  return { ...base, mobileXPercent: null, mobileYPercent: null, mobileWidthPercent: null, mobileHeightPercent: null, mobileRotation: null }
}

const PRESETS: Record<string, { name: string; desc: string; positions: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number; rotation: number; zIndex: number }[] }> = {
  editorial: {
    name: "Editorial", desc: "Classic magazine layout",
    positions: [
      { xPercent: 0, yPercent: 0, widthPercent: 48, heightPercent: 65, rotation: -2.5, zIndex: 1 },
      { xPercent: 50, yPercent: 4, widthPercent: 46, heightPercent: 60, rotation: 1.8, zIndex: 2 },
      { xPercent: 2, yPercent: 52, widthPercent: 44, heightPercent: 58, rotation: -1.2, zIndex: 3 },
      { xPercent: 50, yPercent: 56, widthPercent: 48, heightPercent: 62, rotation: 2.2, zIndex: 4 },
    ],
  },
  "clean-grid": {
    name: "Clean Grid", desc: "Even 2x2 alignment",
    positions: [
      { xPercent: 0, yPercent: 0, widthPercent: 46, heightPercent: 46, rotation: 0, zIndex: 1 },
      { xPercent: 50, yPercent: 0, widthPercent: 46, heightPercent: 46, rotation: 0, zIndex: 2 },
      { xPercent: 0, yPercent: 50, widthPercent: 46, heightPercent: 46, rotation: 0, zIndex: 3 },
      { xPercent: 50, yPercent: 50, widthPercent: 46, heightPercent: 46, rotation: 0, zIndex: 4 },
    ],
  },
  layered: {
    name: "Layered", desc: "Overlapping premium feel",
    positions: [
      { xPercent: 0, yPercent: 0, widthPercent: 52, heightPercent: 70, rotation: 0, zIndex: 1 },
      { xPercent: 46, yPercent: 3, widthPercent: 48, heightPercent: 65, rotation: 2.5, zIndex: 2 },
      { xPercent: 4, yPercent: 45, widthPercent: 46, heightPercent: 60, rotation: -1.8, zIndex: 3 },
      { xPercent: 48, yPercent: 50, widthPercent: 50, heightPercent: 68, rotation: 1.2, zIndex: 4 },
    ],
  },
  mosaic: {
    name: "Mosaic", desc: "Asymmetric hero grid",
    positions: [
      { xPercent: 0, yPercent: 0, widthPercent: 55, heightPercent: 70, rotation: 0, zIndex: 1 },
      { xPercent: 58, yPercent: 0, widthPercent: 38, heightPercent: 55, rotation: 1, zIndex: 2 },
      { xPercent: 0, yPercent: 55, widthPercent: 40, heightPercent: 50, rotation: -1.5, zIndex: 3 },
      { xPercent: 43, yPercent: 52, widthPercent: 53, heightPercent: 65, rotation: 0.5, zIndex: 4 },
    ],
  },
  minimal: {
    name: "Minimal", desc: "Clean with space",
    positions: [
      { xPercent: 5, yPercent: 5, widthPercent: 40, heightPercent: 55, rotation: 0, zIndex: 1 },
      { xPercent: 52, yPercent: 8, widthPercent: 38, heightPercent: 50, rotation: 0, zIndex: 2 },
      { xPercent: 8, yPercent: 52, widthPercent: 36, heightPercent: 48, rotation: 0, zIndex: 3 },
      { xPercent: 50, yPercent: 55, widthPercent: 40, heightPercent: 55, rotation: 0, zIndex: 4 },
    ],
  },
}

const FRAME_PRESETS = [
  { value: "editorial", label: "Editorial" },
  { value: "clean", label: "Clean" },
  { value: "polaroid", label: "Polaroid" },
  { value: "glass", label: "Glass" },
  { value: "none", label: "None" },
]

const SHADOW_PRESETS = [
  { value: "none", label: "None" },
  { value: "soft", label: "Soft" },
  { value: "medium", label: "Medium" },
  { value: "editorial", label: "Editorial" },
]

const GRADIENT_PRESETS = [
  { value: "from-[#0f2847] via-[#153561] to-[#0d2240]", label: "Clinical Blue" },
  { value: "from-[#0a1628] via-[#12233d] to-[#0a1628]", label: "Deep Navy" },
  { value: "from-[#0c2d48] via-[#145374] to-[#0c2d48]", label: "Soft Cyan" },
  { value: "from-[#060e1a] via-[#0f1d32] to-[#060e1a]", label: "Midnight" },
]

/* ─── HISTORY (Undo/Redo) ─── */
type HistoryState = { setting: SpotlightSetting; images: SpotlightImage[] }

function useHistory(initial: HistoryState) {
  const [past, setPast] = useState<HistoryState[]>([])
  const [present, setPresent] = useState<HistoryState>(initial)
  const [future, setFuture] = useState<HistoryState[]>([])

  const push = useCallback((next: HistoryState) => {
    setPast((p) => [...p.slice(-50), present])
    setPresent(next)
    setFuture([])
  }, [present])

  const undo = useCallback(() => {
    if (past.length === 0) return
    const prev = past[past.length - 1]
    setPast((p) => p.slice(0, -1))
    setFuture((f) => [present, ...f])
    setPresent(prev)
  }, [past, present])

  const redo = useCallback(() => {
    if (future.length === 0) return
    const next = future[0]
    setFuture((f) => f.slice(1))
    setPast((p) => [...p, present])
    setPresent(next)
  }, [future, present])

  /**
   * Rewrite every entry (past, present, future) without creating a history step.
   * Used after a save to swap editor-local photo ids for the persisted ones, so
   * undoing across a save cannot resurrect a stale local id.
   */
  const rebase = useCallback((fn: (state: HistoryState) => HistoryState) => {
    setPast((p) => p.map(fn))
    setPresent((p) => fn(p))
    setFuture((f) => f.map(fn))
  }, [])

  const canUndo = past.length > 0
  const canRedo = future.length > 0
  return { present, push, undo, redo, rebase, canUndo, canRedo }
}

/* ─── MAIN COMPONENT ─── */
export function SpotlightAdmin({
  initialSetting,
  initialImages,
}: {
  initialSetting: SpotlightSetting | null
  initialImages: SpotlightImage[]
}) {
  const defaultSetting: SpotlightSetting = {
    eyebrow: "Professional Spotlight", heading: "Trusted Clinical Care Built on Experience and Compassion",
    supportingText: "", primaryCtaLabel: "Schedule an Appointment", primaryCtaDestination: "/contact",
    primaryCtaVisible: true, secondaryCtaLabel: "View Profile", secondaryCtaDestination: "/about",
    secondaryCtaVisible: false, backgroundImage: null, backgroundOverlayStrength: 0.82,
    collageStyle: "freeform", frameStyle: "editorial", collageHeight: "auto",
  }

  const { present, push, undo, redo, rebase, canUndo, canRedo } = useHistory({
    setting: initialSetting ?? defaultSetting,
    images: initialImages,
  })

  /** Last persisted composition — what Reset reverts to. */
  const [baseline, setBaseline] = useState<HistoryState>({
    setting: initialSetting ?? defaultSetting,
    images: initialImages,
  })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop")
  const [editMode, setEditMode] = useState<"edit" | "preview">("edit")
  const [zoomMode, setZoomMode] = useState<"fit" | number>("fit")
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(false)
  const [leftTab, setLeftTab] = useState<"content" | "photos" | "background" | "presets" | "layers">("photos")
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [inspectorDrawerOpen, setInspectorDrawerOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const containerSize = useWorkspaceSize(containerRef)
  const workspaceSize = useWorkspaceSize(workspaceRef)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ type: string; imgId: string; startX: number; startY: number; startVal: number; startVal2?: number; startVal3?: number; startVal4?: number; handle?: string } | null>(null)

  const setting = present.setting
  const images = present.images

  /* ─── RESPONSIVE LAYOUT DECISIONS (based on CONTAINER, not workspace, to avoid feedback loop) ─── */
  const isNarrow = containerSize.w < 768
  const showLeftPanel = !leftCollapsed && !isNarrow
  const showDockedInspector = containerSize.w >= 960
  const showInspectorDrawer = !showDockedInspector && inspectorDrawerOpen

  const selectPhoto = useCallback((id: string) => {
    setSelectedId(id)
    if (!showDockedInspector) setInspectorDrawerOpen(true)
  }, [showDockedInspector])

  const updateSetting = useCallback((patch: Partial<SpotlightSetting>) => {
    push({ setting: { ...setting, ...patch }, images })
    setHasUnsaved(true)
  }, [setting, images, push])

  const updateImage = useCallback((id: string, patch: Partial<SpotlightImage>) => {
    push({ setting, images: images.map((i) => i.id === id ? { ...i, ...patch } : i) })
    setHasUnsaved(true)
  }, [setting, images, push])

  const batchUpdateImages = useCallback((updater: (imgs: SpotlightImage[]) => SpotlightImage[]) => {
    push({ setting, images: updater(images) })
    setHasUnsaved(true)
  }, [setting, images, push])

  const selectedImage = images.find((i) => i.id === selectedId)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await saveAllSpotlight({ ...setting, collageStyle: "freeform" }, images)
      const persistedId = new Map(result.images.map((m) => [m.localId, m.id]))
      const applyIds = (state: HistoryState): HistoryState => ({
        setting: { ...state.setting, collageStyle: "freeform" },
        images: state.images.map((img, index) => ({
          ...img,
          id: persistedId.get(img.id) ?? img.id,
          sortOrder: index,
        })),
      })
      rebase(applyIds)
      setSelectedId((id) => (id ? persistedId.get(id) ?? id : null))
      setBaseline(applyIds({ setting, images }))
      setHasUnsaved(false)
      toast.success("Spotlight saved successfully")
    } catch {
      toast.error("Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (!confirm("Revert all unsaved changes?")) return
    push(baseline)
    setHasUnsaved(false)
    setSelectedId(null)
    toast.info("Reverted to saved state")
  }

  /* Add / delete / duplicate are LOCAL editor operations. Nothing touches the
     database until Save, which is what makes Undo/Redo real. */
  const handleAddPhoto = () => {
    if (images.length >= MAX_PHOTOS) return toast.error(`Maximum ${MAX_PHOTOS} photos`)
    const z = images.length > 0 ? Math.max(...images.map((i) => i.zIndex)) + 1 : 1
    const newImg: SpotlightImage = {
      id: makeLocalId(),
      mediaUrl: null,
      altText: `Photo ${images.length + 1}`,
      caption: null,
      isVisible: true,
      isLocked: false,
      sortOrder: images.length,
      rotation: 0,
      sizeVariant: "normal",
      frameWidth: "auto",
      frameHeight: "auto",
      offsetX: "0",
      offsetY: "0",
      xPercent: 10 + (images.length % 3) * 30,
      yPercent: 10 + Math.floor(images.length / 3) * 30,
      widthPercent: 40,
      heightPercent: 56,
      zIndex: z,
      framePreset: "editorial",
      shadowPreset: "soft",
      mobileXPercent: null,
      mobileYPercent: null,
      mobileWidthPercent: null,
      mobileHeightPercent: null,
      mobileRotation: null,
    }
    push({ setting, images: [...images, newImg] })
    setHasUnsaved(true)
    setLeftTab("photos")
    setSelectedId(newImg.id)
  }

  const handleDeletePhoto = useCallback((id: string) => {
    push({ setting, images: images.filter((i) => i.id !== id) })
    if (selectedId === id) setSelectedId(null)
    setHasUnsaved(true)
  }, [setting, images, selectedId, push])

  const handleDuplicatePhoto = useCallback((id: string) => {
    if (images.length >= MAX_PHOTOS) return toast.error(`Maximum ${MAX_PHOTOS} photos`)
    const src = images.find((i) => i.id === id)
    if (!src) return
    const copy: SpotlightImage = {
      ...src,
      id: makeLocalId(),
      altText: src.altText ? `${src.altText} (copy)` : "Copy",
      isVisible: true,
      sortOrder: images.length,
      zIndex: Math.max(...images.map((i) => i.zIndex)) + 1,
      xPercent: src.xPercent + 5,
      yPercent: src.yPercent + 5,
      mobileXPercent: src.mobileXPercent != null ? src.mobileXPercent + 5 : null,
      mobileYPercent: src.mobileYPercent != null ? src.mobileYPercent + 5 : null,
    }
    push({ setting, images: [...images, copy] })
    setSelectedId(copy.id)
    setHasUnsaved(true)
  }, [setting, images, push])

  /**
   * Presets are geometry STARTERS only — they seed coordinates for the viewport
   * being edited. The render mode itself is always the saved free-form geometry,
   * so a preset is never a rendering mode and `collageStyle` is left alone.
   */
  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey]
    if (!preset) return
    const isMobile = viewport === "mobile"
    const newImages = images.map((img, i) => {
      const p = preset.positions[i % preset.positions.length]
      if (isMobile) {
        return {
          ...img,
          mobileXPercent: p.xPercent,
          mobileYPercent: p.yPercent,
          mobileWidthPercent: p.widthPercent,
          mobileHeightPercent: p.heightPercent,
          mobileRotation: p.rotation,
          zIndex: p.zIndex,
        }
      }
      return { ...img, ...p }
    })
    push({ setting, images: newImages })
    setActivePreset(presetKey)
    setHasUnsaved(true)
    toast.success(`Applied "${preset.name}" preset to ${isMobile ? "Mobile" : "Desktop"}`)
  }

  const handleResetLayout = () => {
    const isMobile = viewport === "mobile"
    const mode = isMobile ? "Mobile" : "Desktop"
    if (!confirm(`Reset ${mode} Layout?\n\nThis will reset photo positions, sizes, rotation and layers to the default collage layout. Your photos and content will not be deleted.`)) return
    push({
      setting, images: images.map((img, i) => ({
        ...img,
        ...getDefaultLayout(i, isMobile),
      }))
    })
    setHasUnsaved(true)
  }

  /** Editor geometry comes from the SAME resolver the public page uses. */
  const getPos = useCallback((img: SpotlightImage) => {
    const g = resolveSpotlightGeometry(img, viewport)
    return { x: g.x, y: g.y, w: g.w, h: g.h, r: g.rotation }
  }, [viewport])

  const setPos = useCallback((id: string, x: number, y: number, w: number, h?: number, r?: number) => {
    const clampXY = (v: number) => Math.round(Math.max(-20, Math.min(100, v)) * 10) / 10
    const clampSize = (v: number) => Math.round(Math.max(5, Math.min(90, v)) * 10) / 10
    if (viewport === "mobile") {
      batchUpdateImages((imgs) => imgs.map((i) => i.id === id ? {
        ...i,
        mobileXPercent: clampXY(x), mobileYPercent: clampXY(y),
        mobileWidthPercent: clampSize(w),
        mobileHeightPercent: h !== undefined ? clampSize(h) : (i.mobileHeightPercent ?? i.heightPercent),
        mobileRotation: r !== undefined ? Math.round(r * 2) / 2 : (i.mobileRotation ?? i.rotation),
      } : i))
    } else {
      batchUpdateImages((imgs) => imgs.map((i) => i.id === id ? {
        ...i,
        xPercent: clampXY(x), yPercent: clampXY(y),
        widthPercent: clampSize(w),
        heightPercent: h !== undefined ? clampSize(h) : i.heightPercent,
        ...(r !== undefined ? { rotation: Math.round(r * 2) / 2 } : {}),
      } : i))
    }
  }, [viewport, batchUpdateImages])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current || !canvasRef.current) return
      e.preventDefault()
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      // rect is already in screen space (it includes the zoom transform), so the
      // delta must NOT be scaled a second time.
      const dxPct = ((e.clientX - dragRef.current.startX) / rect.width) * 100
      const dyPct = ((e.clientY - dragRef.current.startY) / rect.height) * 100
      const d = dragRef.current

      if (d.type === "move") {
        setPos(d.imgId, d.startVal + dxPct, (d.startVal2 ?? 0) + dyPct, d.startVal3 ?? 45, d.startVal4 ?? 63, undefined)
      } else if (d.type === "resize") {
        const handle = d.handle || ""
        let newX = d.startVal2 ?? 0
        let newY = d.startVal3 ?? 0
        let newW = d.startVal ?? 45
        let newH = d.startVal4 ?? 63
        const shiftKey = e.shiftKey

        if (handle === "right") {
          newW = Math.max(5, d.startVal + dxPct)
        } else if (handle === "left") {
          newW = Math.max(5, d.startVal - dxPct)
          newX = d.startVal2! + (d.startVal - newW)
        } else if (handle === "bottom") {
          newH = Math.max(5, (d.startVal4 ?? 63) + dyPct)
        } else if (handle === "top") {
          newH = Math.max(5, (d.startVal4 ?? 63) - dyPct)
          newY = d.startVal3! + ((d.startVal4 ?? 63) - newH)
        } else if (handle === "br") {
          if (shiftKey) {
            const s = Math.max(0.01, 1 + dxPct / (d.startVal ?? 45))
            newW = Math.max(5, d.startVal * s)
            newH = Math.max(5, (d.startVal4 ?? 63) * s)
          } else {
            newW = Math.max(5, d.startVal + dxPct)
            newH = Math.max(5, (d.startVal4 ?? 63) + dyPct)
          }
        } else if (handle === "bl") {
          if (shiftKey) {
            const s = Math.max(0.01, 1 + dxPct / (d.startVal ?? 45))
            newW = Math.max(5, d.startVal * s)
            newH = Math.max(5, (d.startVal4 ?? 63) * s)
            newX = d.startVal2! + (d.startVal - newW)
          } else {
            newW = Math.max(5, d.startVal - dxPct)
            newH = Math.max(5, (d.startVal4 ?? 63) + dyPct)
            newX = d.startVal2! + (d.startVal - newW)
          }
        } else if (handle === "tr") {
          if (shiftKey) {
            const s = Math.max(0.01, 1 - dyPct / (d.startVal4 ?? 63))
            newW = Math.max(5, d.startVal * s)
            newH = Math.max(5, (d.startVal4 ?? 63) * s)
          } else {
            newW = Math.max(5, d.startVal + dxPct)
            newH = Math.max(5, (d.startVal4 ?? 63) - dyPct)
          }
          newY = d.startVal3! + ((d.startVal4 ?? 63) - newH)
        } else if (handle === "tl") {
          if (shiftKey) {
            const s = Math.max(0.01, 1 - dxPct / (d.startVal ?? 45))
            newW = Math.max(5, d.startVal * s)
            newH = Math.max(5, (d.startVal4 ?? 63) * s)
          } else {
            newW = Math.max(5, d.startVal - dxPct)
            newH = Math.max(5, (d.startVal4 ?? 63) - dyPct)
          }
          newX = d.startVal2! + (d.startVal - newW)
          newY = d.startVal3! + ((d.startVal4 ?? 63) - newH)
        }
        setPos(d.imgId, newX, newY, newW, newH, undefined)
      } else if (d.type === "rotate") {
        const img = images.find((i) => i.id === d.imgId)
        if (!img) return
        const pos = getPos(img)
        const cx = rect.left + (pos.x / 100) * rect.width + (pos.w / 100) * rect.width / 2
        const cy = rect.top + (pos.y / 100) * rect.height + (pos.h / 100) * rect.height / 2
        let angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90
        if (Math.abs(angle) < 3) angle = 0
        else if (Math.abs(angle - 90) < 3) angle = 90
        else if (Math.abs(angle + 90) < 3) angle = -90
        else if (Math.abs(Math.abs(angle) - 180) < 3) angle = angle > 0 ? 180 : -180
        setPos(d.imgId, pos.x, pos.y, pos.w, pos.h, Math.round(angle * 2) / 2)
      }
    }
    const handlePointerUp = () => { dragRef.current = null; document.body.style.userSelect = ""; document.body.style.cursor = "" }
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    return () => { window.removeEventListener("pointermove", handlePointerMove); window.removeEventListener("pointerup", handlePointerUp) }
  }, [images, viewport, setPos, getPos])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA" || (e.target as HTMLElement)?.tagName === "SELECT") return
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) { e.preventDefault(); redo(); return }
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); return }
      if (e.key === "d" && (e.ctrlKey || e.metaKey) && selectedId) { e.preventDefault(); handleDuplicatePhoto(selectedId); return }
      if (e.key === "Escape") { setSelectedId(null); setInspectorDrawerOpen(false); return }
      if (!selectedId) return
      const step = e.shiftKey ? 2 : 0.5
      const img = images.find((i) => i.id === selectedId)
      if (!img) return
      const pos = getPos(img)
      if (e.key === "ArrowLeft") { e.preventDefault(); setPos(selectedId, pos.x - step, pos.y, pos.w, pos.h, pos.r) }
      if (e.key === "ArrowRight") { e.preventDefault(); setPos(selectedId, pos.x + step, pos.y, pos.w, pos.h, pos.r) }
      if (e.key === "ArrowUp") { e.preventDefault(); setPos(selectedId, pos.x, pos.y - step, pos.w, pos.h, pos.r) }
      if (e.key === "ArrowDown") { e.preventDefault(); setPos(selectedId, pos.x, pos.y + step, pos.w, pos.h, pos.r) }
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); handleDeletePhoto(selectedId) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectedId, images, viewport, undo, redo, setPos, getPos, handleDeletePhoto, handleDuplicatePhoto])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) { e.preventDefault(); e.returnValue = "" }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [hasUnsaved])

  const sortedForLayers = useMemo(() => [...images].sort((a, b) => b.zIndex - a.zIndex), [images])

  /* ─── CANVAS DESIGN DIMENSIONS ───
     Fixed per viewport, from the shared stage. A stage that grew with its content
     would change the denominator of every saved percentage, so one photo moving
     would drag all the others — and the public page could not reproduce it
     without measuring in JS. */
  const stage = SPOTLIGHT_STAGE[viewport]
  const canvasDesignW = stage.width
  const canvasDesignH = stage.height

  /* ─── WORKSPACE AVAILABLE SIZE ─── */
  const availableW = workspaceSize.w
  const availableH = workspaceSize.h

  /* ─── FIT SCALE ─── */
  const fitScale = useMemo(() => {
    if (availableW <= 0 || availableH <= 0 || canvasDesignW <= 0 || canvasDesignH <= 0) return 1
    return Math.min(availableW / canvasDesignW, availableH / canvasDesignH)
  }, [availableW, availableH, canvasDesignW, canvasDesignH])

  /* ─── EFFECTIVE SCALE ─── */
  const effectiveScale = zoomMode === "fit" ? fitScale : zoomMode / 100

  const canvasStyle = useMemo(() => ({
    transform: `scale(${effectiveScale})`,
    transformOrigin: "top left" as const,
    width: `${canvasDesignW}px`,
    height: `${canvasDesignH}px`,
  }), [effectiveScale, canvasDesignW, canvasDesignH])

  const canvasWrapStyle = useMemo(() => ({
    width: `${canvasDesignW * effectiveScale}px`,
    height: `${canvasDesignH * effectiveScale}px`,
    flexShrink: 0 as const,
  }), [canvasDesignW, canvasDesignH, effectiveScale])

  return (
    <div ref={containerRef} className="h-[calc(100vh-4rem)] -m-4 lg:-m-6 flex flex-col bg-muted/30 overflow-hidden min-w-0">
      {/* ─── TOP TOOLBAR ─── */}
      <div className="h-12 bg-card border-b border-border/50 flex items-center justify-between px-2 md:px-4 shrink-0 z-50 overflow-hidden">
        <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
          <a href="/admin/home" className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">&larr; Back</a>
          <div className="w-px h-5 bg-border/50 shrink-0 hidden sm:block" />
          <div className="flex rounded-md border border-border/50 overflow-hidden shrink-0">
            <button onClick={() => setViewport("desktop")} title="Desktop stage" aria-label="Desktop stage" className={`px-2 py-1 text-[11px] font-medium transition-colors flex items-center gap-1 ${viewport === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><Monitor className="h-4 w-4" /></button>
            <button onClick={() => setViewport("mobile")} title="Mobile stage" aria-label="Mobile stage" className={`px-2 py-1 text-[11px] font-medium transition-colors flex items-center gap-1 ${viewport === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><Smartphone className="h-4 w-4" /></button>
          </div>
          <div className="w-px h-5 bg-border/50 shrink-0 hidden sm:block" />
          <button onClick={undo} disabled={!canUndo} className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors shrink-0 hidden sm:block" title="Undo (Ctrl+Z)"><Undo2 className="h-4 w-4" /></button>
          <button onClick={redo} disabled={!canRedo} className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors shrink-0 hidden sm:block" title="Redo (Ctrl+Shift+Z)"><Redo2 className="h-4 w-4" /></button>
          <div className="w-px h-5 bg-border/50 shrink-0 hidden md:block" />
          <div className="hidden md:flex items-center">
            <button onClick={() => setZoomMode((z) => z === "fit" ? Math.max(25, Math.round(fitScale * 100) - 25) : Math.max(25, z - 25))} className="p-1.5 rounded hover:bg-muted transition-colors" title="Zoom Out"><ZoomOut className="h-4 w-4" /></button>
            <span className="text-[11px] font-medium text-muted-foreground w-14 text-center">{zoomMode === "fit" ? "Fit" : `${zoomMode}%`}</span>
            <button onClick={() => setZoomMode((z) => z === "fit" ? Math.min(200, Math.round(fitScale * 100) + 25) : Math.min(200, z + 25))} className="p-1.5 rounded hover:bg-muted transition-colors" title="Zoom In"><ZoomIn className="h-4 w-4" /></button>
            <button onClick={() => setZoomMode("fit")} className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${zoomMode === "fit" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`} title="Fit to workspace">Fit</button>
          </div>
          <div className="w-px h-5 bg-border/50 shrink-0 hidden lg:block" />
          <button onClick={() => setLeftCollapsed(!leftCollapsed)} className={`p-1.5 rounded transition-colors shrink-0 hidden lg:block ${leftCollapsed ? "bg-primary/10 text-primary" : "hover:bg-muted"}`} title="Toggle Left Panel"><PanelLeft className="h-4 w-4" /></button>
          <button onClick={() => { if (showDockedInspector) return; setInspectorDrawerOpen(!inspectorDrawerOpen) }} className={`p-1.5 rounded transition-colors shrink-0 hidden sm:block ${!showDockedInspector && inspectorDrawerOpen ? "bg-primary/10 text-primary" : "hover:bg-muted"}`} title="Toggle Inspector"><PanelRight className="h-4 w-4" /></button>
          <div className="w-px h-5 bg-border/50 shrink-0 hidden md:block" />
          <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded transition-colors shrink-0 hidden sm:block ${showGrid ? "bg-primary/10 text-primary" : "hover:bg-muted"}`} title="Toggle Grid"><Grid3X3 className="h-4 w-4" /></button>
          <div className="hidden md:flex rounded-md border border-border/50 overflow-hidden shrink-0">
            <button onClick={() => setEditMode("edit")} className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${editMode === "edit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Edit</button>
            <button onClick={() => setEditMode("preview")} className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${editMode === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Preview</button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          <button onClick={() => setShowShortcuts(true)} className="p-1.5 rounded hover:bg-muted transition-colors hidden sm:block" title="Keyboard Shortcuts"><Info className="h-4 w-4" /></button>
          {hasUnsaved && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/20 hidden md:inline">Unsaved</span>}
          <button onClick={handleReset} className="px-2 md:px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border/50 rounded-md transition-colors hidden sm:block"><RotateCcw className="h-4 w-4 inline mr-1" />Reset</button>
          <button onClick={handleSave} disabled={!hasUnsaved || isSaving} className={`px-2 md:px-4 py-1.5 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${hasUnsaved && !isSaving ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" : "bg-muted text-muted-foreground cursor-not-allowed"}`}><Save className="h-4 w-4 inline sm:mr-1" /><span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span></button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 min-w-0">
        {/* ─── LEFT PANEL ─── */}
        {showLeftPanel && (
          <div className="bg-card border-r border-border/50 flex flex-col shrink-0 overflow-hidden min-w-0" style={{ width: "clamp(220px, 15vw, 280px)" }}>
            <div className="flex border-b border-border/30">
              {([
                { key: "content" as const, icon: Type, label: "Content" },
                { key: "photos" as const, icon: Image, label: "Photos" },
                { key: "background" as const, icon: Paintbrush, label: "BG" },
                { key: "presets" as const, icon: LayoutTemplate, label: "Presets" },
                { key: "layers" as const, icon: Layers, label: "Layers" },
              ]).map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setLeftTab(key)} className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-[9px] font-medium transition-colors ${leftTab === key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}><Icon className="h-4 w-4" />{label}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {leftTab === "content" && (
                <div className="space-y-3">
                  <div><Label className="text-[10px] text-muted-foreground">Eyebrow</Label><Input value={setting.eyebrow} onChange={(e) => updateSetting({ eyebrow: e.target.value })} className="h-7 text-xs mt-1" /></div>
                  <div><Label className="text-[10px] text-muted-foreground">Heading</Label><Input value={setting.heading} onChange={(e) => updateSetting({ heading: e.target.value })} className="h-7 text-xs mt-1" /></div>
                  <div><Label className="text-[10px] text-muted-foreground">Description</Label><Input value={setting.supportingText} onChange={(e) => updateSetting({ supportingText: e.target.value })} className="h-7 text-xs mt-1" /></div>
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    <Label className="text-[10px] font-semibold">Primary CTA</Label>
                    <Input value={setting.primaryCtaLabel} onChange={(e) => updateSetting({ primaryCtaLabel: e.target.value })} placeholder="Label" className="h-7 text-xs" />
                    <Input value={setting.primaryCtaDestination} onChange={(e) => updateSetting({ primaryCtaDestination: e.target.value })} placeholder="/contact" className="h-7 text-xs" />
                    <button onClick={() => updateSetting({ primaryCtaVisible: !setting.primaryCtaVisible })} className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${setting.primaryCtaVisible ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>{setting.primaryCtaVisible ? "VISIBLE" : "HIDDEN"}</button>
                  </div>
                </div>
              )}

              {leftTab === "photos" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Photos ({images.length})</span>
                  </div>
                  {images.length === 0 ? (
                    <div className="text-center py-8">
                      <Image className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-xs text-muted-foreground mb-2">No collage photos yet</p>
                      <button onClick={handleAddPhoto} className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"><Plus className="h-4 w-4 inline mr-1" />Add your first photo</button>
                    </div>
                  ) : (
                    images.map((img, idx) => (
                      <div key={img.id}
                        className={`rounded-lg border p-2 transition-all cursor-pointer flex items-center gap-2 ${selectedId === img.id ? "bg-primary/10 border-primary/40 shadow-[inset_3px_0_0_0_theme(colors.primary)]" : "bg-card border-border/50 hover:border-border hover:bg-muted/50"}`}
                        onClick={() => selectPhoto(img.id)}
                      >
                        <div className="w-8 h-8 rounded border border-border/30 bg-muted/20 overflow-hidden shrink-0">
                          {img.mediaUrl ? <img src={img.mediaUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[7px]">Empty</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-medium truncate block">{img.altText || `Photo ${idx + 1}`}</span>
                          <span className="text-[8px] text-muted-foreground">z{img.zIndex}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); updateImage(img.id, { isVisible: !img.isVisible }) }} className="p-1 rounded-md hover:bg-green-500/10 transition-colors" title={img.isVisible ? "Visible" : "Hidden"}>
                            {img.isVisible ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground/50" />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); updateImage(img.id, { isLocked: !img.isLocked }) }} className="p-1 rounded-md hover:bg-amber-500/10 transition-colors" title={img.isLocked ? "Locked" : "Unlocked"}>
                            {img.isLocked ? <Lock className="h-4 w-4 text-amber-500" /> : <Unlock className="h-4 w-4 text-muted-foreground/50" />}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  {images.length > 0 && images.length < MAX_PHOTOS && (
                    <button onClick={handleAddPhoto} className="w-full py-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-[10px] font-semibold text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors"><Plus className="h-4 w-4 inline mr-1" />Add Photo</button>
                  )}
                </div>
              )}

              {leftTab === "background" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Gradient Preset</Label>
                    <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                      {GRADIENT_PRESETS.map((g) => (
                        <button key={g.value} onClick={() => updateSetting({ backgroundImage: null })}
                          className={`h-8 rounded-md bg-gradient-to-br ${g.value} text-[9px] text-white/80 font-medium border-2 transition-colors ${!setting.backgroundImage ? "border-primary" : "border-transparent hover:border-primary/50"}`}>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/30">
                    <Label className="text-[10px] text-muted-foreground">Background Image</Label>
                    <div className="mt-1.5">
                      <MediaPicker value={setting.backgroundImage || ""} onChange={(url) => updateSetting({ backgroundImage: url || null })} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Overlay ({Math.round(setting.backgroundOverlayStrength * 100)}%)</Label>
                    <input type="range" min="0" max="1" step="0.01" value={setting.backgroundOverlayStrength} onChange={(e) => updateSetting({ backgroundOverlayStrength: parseFloat(e.target.value) })} className="w-full mt-1" />
                  </div>
                </div>
              )}

              {leftTab === "presets" && (
                <div className="space-y-2">
                  {Object.entries(PRESETS).map(([key, preset]) => (
                    <button key={key} onClick={() => handleApplyPreset(key)} className={`w-full text-left rounded-lg border p-3 transition-all ${activePreset === key ? "border-primary bg-primary/5" : "border-border/50 hover:border-border bg-card"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{preset.name}</span>
                        {activePreset === key && <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">APPLIED</span>}
                      </div>
                      <p className="text-[9px] text-muted-foreground">{preset.desc}</p>
                      <div className="relative mt-2 h-12 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                        {preset.positions.slice(0, 4).map((p, i) => (
                          <div key={i} className="absolute bg-primary/20 border border-primary/30 rounded-sm" style={{ left: `${p.xPercent}%`, top: `${p.yPercent}%`, width: `${p.widthPercent}%`, height: `${p.widthPercent * 0.7}%`, transform: `rotate(${p.rotation}deg)`, zIndex: p.zIndex }} />
                        ))}
                      </div>
                    </button>
                  ))}
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    <p className="text-[9px] text-muted-foreground">Presets are starting layouts for the <strong>{viewport === "mobile" ? "Mobile" : "Desktop"}</strong> stage. After applying one you can still move every photo freely — what gets published is always your saved geometry.</p>
                    <button onClick={handleResetLayout} className="w-full py-2 rounded-lg border border-border/50 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"><RotateCcw className="h-4 w-4 inline mr-1" />Reset Layout</button>
                  </div>
                </div>
              )}

              {leftTab === "layers" && (
                <div className="space-y-1">
                  {sortedForLayers.map((img) => (
                    <div key={img.id} onClick={() => selectPhoto(img.id)}
                      className={`rounded-lg border p-2 flex items-center gap-2 cursor-pointer transition-all ${selectedId === img.id ? "bg-primary/10 border-primary/40 shadow-[inset_3px_0_0_0_theme(colors.primary)]" : "bg-card border-border/50 hover:border-border hover:bg-muted/50"}`}>
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                      <div className="w-6 h-6 rounded border border-border/30 bg-muted/20 overflow-hidden shrink-0">
                        {img.mediaUrl ? <img src={img.mediaUrl} alt="" className="w-full h-full object-cover" /> : null}
                      </div>
                      <span className="text-[10px] font-medium flex-1 truncate">{img.altText || "Photo"}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); updateImage(img.id, { isVisible: !img.isVisible }) }} className="p-1 rounded-md hover:bg-green-500/10 transition-colors">
                          {img.isVisible ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground/50" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); updateImage(img.id, { isLocked: !img.isLocked }) }} className="p-1 rounded-md hover:bg-amber-500/10 transition-colors">
                          {img.isLocked ? <Lock className="h-4 w-4 text-amber-500" /> : <Unlock className="h-4 w-4 text-muted-foreground/50" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); batchUpdateImages((imgs) => imgs.map((i) => i.id === img.id ? { ...i, zIndex: Math.max(...imgs.map((x) => x.zIndex)) + 1 } : i)) }} className="p-1 rounded-md hover:bg-muted transition-colors" title="Bring Front"><ArrowUpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                        <button onClick={(e) => { e.stopPropagation(); batchUpdateImages((imgs) => imgs.map((i) => i.id === img.id ? { ...i, zIndex: Math.min(...imgs.map((x) => x.zIndex)) - 1 } : i)) }} className="p-1 rounded-md hover:bg-muted transition-colors" title="Send Back"><ArrowDownCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                      </div>
                    </div>
                  ))}
                  {images.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No layers yet</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── MAIN CANVAS ─── */}
        <div
          ref={workspaceRef}
          className={`flex-1 min-w-0 relative flex p-4 md:p-8 ${zoomMode === "fit" ? "overflow-hidden" : "overflow-auto"}`}
          onClick={() => { if (editMode === "edit") setSelectedId(null) }}
        >
          <div style={canvasWrapStyle} className="m-auto">
            <div style={canvasStyle}>
              <SpotlightStage
                setting={setting}
                images={images}
                viewport={viewport}
                sizing="fixed"
                stageRef={canvasRef}
                className="rounded-xl shadow-2xl"
                renderPhoto={({ img, geo, style, frame }) => {
                  const pos = { x: geo.x, y: geo.y, w: geo.w, h: geo.h, r: geo.rotation }
                  const isSelected = selectedId === img.id && editMode === "edit"
                  return (
                    <div
                      data-spotlight-photo={img.id}
                      className={editMode === "edit" && !img.isLocked ? "cursor-grab active:cursor-grabbing" : ""}
                      style={{ ...style, zIndex: img.zIndex + (isSelected ? 100 : 0) }}
                      onClick={(e) => { e.stopPropagation(); if (editMode === "edit") selectPhoto(img.id) }}
                      onPointerDown={(e) => {
                        if (editMode !== "edit" || img.isLocked) return
                        e.stopPropagation()
                        e.preventDefault()
                        selectPhoto(img.id)
                        document.body.style.userSelect = "none"
                        document.body.style.cursor = "grabbing"
                        dragRef.current = { type: "move", imgId: img.id, startX: e.clientX, startY: e.clientY, startVal: pos.x, startVal2: pos.y, startVal3: pos.w, startVal4: pos.h }
                      }}
                    >
                      <div className="relative w-full h-full">
                        {frame}
                        {isSelected && (
                          <>
                            <div className="absolute inset-[-1px] border-2 border-primary/80 pointer-events-none" />
                            {/* 8 Resize handles */}
                            {([
                              { pos: "top-0 left-0 -translate-x-1/2 -translate-y-1/2", handle: "tl", cursor: "nwse-resize" },
                              { pos: "top-0 right-0 translate-x-1/2 -translate-y-1/2", handle: "tr", cursor: "nesw-resize" },
                              { pos: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2", handle: "bl", cursor: "nesw-resize" },
                              { pos: "bottom-0 right-0 translate-x-1/2 translate-y-1/2", handle: "br", cursor: "nwse-resize" },
                            ]).map(({ pos: pos2, handle, cursor }) => (
                              <div key={handle}
                                className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full shadow-md z-50"
                                style={{ cursor, ...parsePosition(pos2) }}
                                onPointerDown={(e) => {
                                  e.stopPropagation(); e.preventDefault()
                                  document.body.style.userSelect = "none"; document.body.style.cursor = cursor
                                  dragRef.current = { type: "resize", imgId: img.id, handle, startX: e.clientX, startY: e.clientY, startVal: pos.w, startVal2: pos.x, startVal3: pos.y, startVal4: pos.h }
                                }}
                              />
                            ))}
                            {/* Edge handles - Left/Right (vertical pill) */}
                            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-5 bg-white border-2 border-primary rounded-full shadow-md z-50"
                              style={{ cursor: "ew-resize" }}
                              onPointerDown={(e) => {
                                e.stopPropagation(); e.preventDefault()
                                document.body.style.userSelect = "none"; document.body.style.cursor = "ew-resize"
                                dragRef.current = { type: "resize", imgId: img.id, handle: "left", startX: e.clientX, startY: e.clientY, startVal: pos.w, startVal2: pos.x, startVal3: pos.y, startVal4: pos.h }
                              }}
                            />
                            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-5 bg-white border-2 border-primary rounded-full shadow-md z-50"
                              style={{ cursor: "ew-resize" }}
                              onPointerDown={(e) => {
                                e.stopPropagation(); e.preventDefault()
                                document.body.style.userSelect = "none"; document.body.style.cursor = "ew-resize"
                                dragRef.current = { type: "resize", imgId: img.id, handle: "right", startX: e.clientX, startY: e.clientY, startVal: pos.w, startVal2: pos.x, startVal3: pos.y, startVal4: pos.h }
                              }}
                            />
                            {/* Edge handles - Top/Bottom (horizontal pill) */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-2 bg-white border-2 border-primary rounded-full shadow-md z-50"
                              style={{ cursor: "ns-resize" }}
                              onPointerDown={(e) => {
                                e.stopPropagation(); e.preventDefault()
                                document.body.style.userSelect = "none"; document.body.style.cursor = "ns-resize"
                                dragRef.current = { type: "resize", imgId: img.id, handle: "top", startX: e.clientX, startY: e.clientY, startVal: pos.w, startVal2: pos.x, startVal3: pos.y, startVal4: pos.h }
                              }}
                            />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-5 h-2 bg-white border-2 border-primary rounded-full shadow-md z-50"
                              style={{ cursor: "ns-resize" }}
                              onPointerDown={(e) => {
                                e.stopPropagation(); e.preventDefault()
                                document.body.style.userSelect = "none"; document.body.style.cursor = "ns-resize"
                                dragRef.current = { type: "resize", imgId: img.id, handle: "bottom", startX: e.clientX, startY: e.clientY, startVal: pos.w, startVal2: pos.x, startVal3: pos.y, startVal4: pos.h }
                              }}
                            />
                            {/* Rotation handle */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50" style={{ marginTop: "-28px" }}
                              onPointerDown={(e) => {
                                e.stopPropagation(); e.preventDefault()
                                document.body.style.userSelect = "none"; document.body.style.cursor = "grab"
                                dragRef.current = { type: "rotate", imgId: img.id, startX: e.clientX, startY: e.clientY, startVal: pos.r }
                              }}
                            >
                              <div className="w-5 h-5 bg-white rounded-full border-2 border-primary shadow-md flex items-center justify-center cursor-grab hover:bg-primary/10 transition-colors">
                                <RotateCcw className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-3 bg-primary/50" />
                            </div>
                            {/* Floating toolbar — SOLID opaque background */}
                            <div className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 bg-background border border-border rounded-xl px-2 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)]" style={{ bottom: "-44px" }}>
                              <button onClick={(e) => { e.stopPropagation(); handleDuplicatePhoto(img.id) }} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Duplicate (Ctrl+D)"><Copy className="h-4 w-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); batchUpdateImages((imgs) => imgs.map((i) => i.id === img.id ? { ...i, zIndex: Math.max(...imgs.map((x) => x.zIndex)) + 1 } : i)) }} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Bring Forward"><ArrowUp className="h-4 w-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); batchUpdateImages((imgs) => imgs.map((i) => i.id === img.id ? { ...i, zIndex: Math.min(...imgs.map((x) => x.zIndex)) - 1 } : i)) }} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Send Backward"><ArrowDown className="h-4 w-4" /></button>
                              <div className="w-px h-4 bg-border mx-0.5" />
                              <button onClick={(e) => { e.stopPropagation(); updateImage(img.id, { isLocked: !img.isLocked }) }} className={`p-1.5 rounded-lg transition-colors ${img.isLocked ? "bg-amber-500/15 text-amber-600" : "hover:bg-muted"}`} title={img.isLocked ? "Unlock" : "Lock"}>{img.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}</button>
                              <button onClick={(e) => { e.stopPropagation(); updateImage(img.id, { isVisible: false }) }} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Hide"><EyeOff className="h-4 w-4" /></button>
                              <div className="w-px h-4 bg-border mx-0.5" />
                              <button onClick={(e) => { e.stopPropagation(); handleDeletePhoto(img.id) }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                }}
              >
                {/* Grid overlay */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none z-50" style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                    backgroundSize: "50px 50px",
                  }} />
                )}

                {images.filter((i) => i.isVisible && i.mediaUrl).length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 pointer-events-none">
                    <Image className="h-12 w-12 mb-3" />
                    <p className="text-sm">No photos in collage</p>
                    <p className="text-xs mt-1">Click &quot;Add Photo&quot; in the left panel</p>
                  </div>
                )}
              </SpotlightStage>
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL — DOCKED INSPECTOR (>= 960px) ─── */}
        {showDockedInspector && (
          <div className="bg-card border-l border-border/50 flex flex-col shrink-0 overflow-hidden min-w-0" style={{ width: "clamp(280px, 20vw, 360px)" }}>
            <InspectorContent
              selectedImage={selectedImage}
              setting={setting}
              getPos={getPos}
              setPos={setPos}
              updateImage={updateImage}
              updateSetting={updateSetting}
              batchUpdateImages={batchUpdateImages}
              handleDuplicatePhoto={handleDuplicatePhoto}
              handleDeletePhoto={handleDeletePhoto}
            />
          </div>
        )}
      </div>

      {/* ─── INSPECTOR DRAWER OVERLAY (< 960px) ─── */}
      {showInspectorDrawer && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setInspectorDrawerOpen(false)} />
          <div className="fixed right-0 top-12 bottom-0 w-[320px] max-w-[90vw] bg-card border-l border-border/50 flex flex-col z-50 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30">
              <span className="text-[11px] font-semibold">{selectedImage ? "Photo Inspector" : "Section Settings"}</span>
              <button onClick={() => setInspectorDrawerOpen(false)} className="p-1 rounded hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <InspectorContent
              selectedImage={selectedImage}
              setting={setting}
              getPos={getPos}
              setPos={setPos}
              updateImage={updateImage}
              updateSetting={updateSetting}
              batchUpdateImages={batchUpdateImages}
              handleDuplicatePhoto={handleDuplicatePhoto}
              handleDeletePhoto={handleDeletePhoto}
            />
          </div>
        </>
      )}

      {/* ─── ONBOARDING ─── */}
      {showOnboarding && images.length === 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border/50 rounded-xl px-5 py-3 shadow-xl flex items-center gap-4 z-50">
          <Info className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-xs font-semibold">Welcome to Spotlight Editor</p>
            <p className="text-[10px] text-muted-foreground">Click a photo to select. Drag to move. Use corner handles to resize.</p>
          </div>
          <button onClick={() => setShowOnboarding(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* ─── KEYBOARD SHORTCUTS MODAL ─── */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setShowShortcuts(false)}>
          <div className="bg-card rounded-xl border border-border/50 p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-2 text-xs">
              {[
                ["Ctrl+Z", "Undo"],
                ["Ctrl+Shift+Z", "Redo"],
                ["Ctrl+D", "Duplicate"],
                ["Delete / Backspace", "Delete selected"],
                ["Arrow keys", "Nudge 0.5%"],
                ["Shift+Arrow", "Nudge 2%"],
                ["Escape", "Deselect"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{desc}</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded font-mono">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── INSPECTOR CONTENT (shared by docked + drawer) ─── */
function InspectorContent({
  selectedImage,
  setting,
  getPos,
  setPos,
  updateImage,
  updateSetting,
  batchUpdateImages,
  handleDuplicatePhoto,
  handleDeletePhoto,
}: {
  selectedImage: SpotlightImage | undefined
  setting: SpotlightSetting
  getPos: (img: SpotlightImage) => { x: number; y: number; w: number; h: number; r: number }
  setPos: (id: string, x: number, y: number, w: number, h?: number, r?: number) => void
  updateImage: (id: string, patch: Partial<SpotlightImage>) => void
  updateSetting: (patch: Partial<SpotlightSetting>) => void
  batchUpdateImages: (updater: (imgs: SpotlightImage[]) => SpotlightImage[]) => void
  handleDuplicatePhoto: (id: string) => void
  handleDeletePhoto: (id: string) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {selectedImage ? (
        <>
          {/* Replace Image — thumbnail + picker */}
          <div>
            <Label className="text-[10px] text-muted-foreground">Replace Image</Label>
            <div className="mt-1.5 flex items-center gap-3">
              {selectedImage.mediaUrl ? (
                <div className="w-14 h-14 rounded-lg border border-border/50 bg-muted/20 overflow-hidden shrink-0">
                  <img src={selectedImage.mediaUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg border border-dashed border-border/50 bg-muted/10 flex items-center justify-center shrink-0">
                  <Image className="h-5 w-5 text-muted-foreground/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <MediaPicker value={selectedImage.mediaUrl || ""} onChange={(url) => updateImage(selectedImage.id, { mediaUrl: url || null })} />
              </div>
            </div>
          </div>
          <div><Label className="text-[10px] text-muted-foreground">Alt Text</Label><Input value={selectedImage.altText || ""} onChange={(e) => updateImage(selectedImage.id, { altText: e.target.value })} className="h-7 text-xs mt-1" /></div>
          <div><Label className="text-[10px] text-muted-foreground">Caption</Label><Input value={selectedImage.caption || ""} onChange={(e) => updateImage(selectedImage.id, { caption: e.target.value })} className="h-7 text-xs mt-1" /></div>
          <div className="pt-2 border-t border-border/30 space-y-2">
            <Label className="text-[10px] font-semibold">Position</Label>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-[9px] text-muted-foreground">X ({Math.round(getPos(selectedImage).x)}%)</Label><input type="range" min="-20" max="90" step="0.5" value={getPos(selectedImage).x} onChange={(e) => { const p = getPos(selectedImage); setPos(selectedImage.id, parseFloat(e.target.value), p.y, p.w, p.h, p.r) }} className="w-full mt-0.5" /></div>
              <div><Label className="text-[9px] text-muted-foreground">Y ({Math.round(getPos(selectedImage).y)}%)</Label><input type="range" min="-20" max="90" step="0.5" value={getPos(selectedImage).y} onChange={(e) => { const p = getPos(selectedImage); setPos(selectedImage.id, p.x, parseFloat(e.target.value), p.w, p.h, p.r) }} className="w-full mt-0.5" /></div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold">Size & Rotation</Label>
            <div><Label className="text-[9px] text-muted-foreground">Width ({Math.round(getPos(selectedImage).w)}%)</Label><input type="range" min="5" max="90" step="1" value={getPos(selectedImage).w} onChange={(e) => { const p = getPos(selectedImage); setPos(selectedImage.id, p.x, p.y, parseFloat(e.target.value), p.h, p.r) }} className="w-full mt-0.5" /></div>
            <div><Label className="text-[9px] text-muted-foreground">Height ({Math.round(getPos(selectedImage).h)}%)</Label><input type="range" min="5" max="90" step="1" value={getPos(selectedImage).h} onChange={(e) => { const p = getPos(selectedImage); setPos(selectedImage.id, p.x, p.y, p.w, parseFloat(e.target.value), p.r) }} className="w-full mt-0.5" /></div>
            <div><Label className="text-[9px] text-muted-foreground">Rotation ({Math.round(getPos(selectedImage).r)}°)</Label><input type="range" min="-180" max="180" step="0.5" value={getPos(selectedImage).r} onChange={(e) => { const p = getPos(selectedImage); setPos(selectedImage.id, p.x, p.y, p.w, p.h, parseFloat(e.target.value)) }} className="w-full mt-0.5" /></div>
          </div>
          <div className="pt-2 border-t border-border/30 space-y-2">
            <Label className="text-[10px] font-semibold">Frame</Label>
            <div className="flex flex-wrap gap-1">
              {FRAME_PRESETS.map((f) => (
                <button key={f.value} onClick={() => updateImage(selectedImage.id, { framePreset: f.value })} className={`px-2 py-0.5 text-[9px] font-medium rounded border transition-colors ${selectedImage.framePreset === f.value ? "bg-primary/10 text-primary border-primary/30" : "border-border/50 text-muted-foreground hover:bg-muted"}`}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold">Shadow</Label>
            <div className="flex flex-wrap gap-1">
              {SHADOW_PRESETS.map((s) => (
                <button key={s.value} onClick={() => updateImage(selectedImage.id, { shadowPreset: s.value })} className={`px-2 py-0.5 text-[9px] font-medium rounded border transition-colors ${selectedImage.shadowPreset === s.value ? "bg-primary/10 text-primary border-primary/30" : "border-border/50 text-muted-foreground hover:bg-muted"}`}>{s.label}</button>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-border/30 space-y-2">
            <Label className="text-[10px] font-semibold">Actions</Label>
            <div className="flex gap-1.5">
              <button onClick={() => batchUpdateImages((imgs) => imgs.map((i) => i.id === selectedImage.id ? { ...i, zIndex: Math.max(...imgs.map((x) => x.zIndex)) + 1 } : i))} className="flex-1 py-1 text-[9px] font-medium rounded border border-border/50 hover:bg-muted transition-colors"><ArrowUp className="h-4 w-4 inline mr-0.5" />Front</button>
              <button onClick={() => batchUpdateImages((imgs) => imgs.map((i) => i.id === selectedImage.id ? { ...i, zIndex: Math.min(...imgs.map((x) => x.zIndex)) - 1 } : i))} className="flex-1 py-1 text-[9px] font-medium rounded border border-border/50 hover:bg-muted transition-colors"><ArrowDown className="h-4 w-4 inline mr-0.5" />Back</button>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => updateImage(selectedImage.id, { isLocked: !selectedImage.isLocked })} className={`flex-1 py-1 text-[9px] font-medium rounded border transition-colors ${selectedImage.isLocked ? "border-amber-500/30 bg-amber-500/10 text-amber-600" : "border-border/50 hover:bg-muted"}`}>{selectedImage.isLocked ? <Lock className="h-4 w-4 inline mr-0.5" /> : <Unlock className="h-4 w-4 inline mr-0.5" />}{selectedImage.isLocked ? "Locked" : "Lock"}</button>
              <button onClick={() => updateImage(selectedImage.id, { isVisible: !selectedImage.isVisible })} className={`flex-1 py-1 text-[9px] font-medium rounded border transition-colors ${!selectedImage.isVisible ? "border-amber-500/30 bg-amber-500/10 text-amber-600" : "border-border/50 hover:bg-muted"}`}>{selectedImage.isVisible ? <Eye className="h-4 w-4 inline mr-0.5" /> : <EyeOff className="h-4 w-4 inline mr-0.5" />}{selectedImage.isVisible ? "Visible" : "Hidden"}</button>
            </div>
            <button onClick={() => { handleDuplicatePhoto(selectedImage.id) }} className="w-full py-1 text-[9px] font-medium rounded border border-border/50 hover:bg-muted transition-colors"><Copy className="h-4 w-4 inline mr-0.5" />Duplicate</button>
            <button onClick={() => handleDeletePhoto(selectedImage.id)} className="w-full py-1 text-[9px] font-medium rounded border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors"><Trash2 className="h-4 w-4 inline mr-0.5" />Delete</button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold">Frame Style</Label>
            <select value={setting.frameStyle} onChange={(e) => updateSetting({ frameStyle: e.target.value })} className="w-full h-7 rounded border border-input bg-background px-2 text-xs">
              <option value="editorial">Editorial</option>
              <option value="clean">Clean</option>
              <option value="minimal">Minimal</option>
            </select>
            <p className="text-[9px] text-muted-foreground">Fallback frame for photos without their own frame preset.</p>
          </div>
          <p className="text-[9px] text-muted-foreground">Click a photo on the canvas to inspect its properties.</p>
        </>
      )}
    </div>
  )
}

/* ─── SELECTION HANDLE POSITIONING ─── */
function parsePosition(cls: string): React.CSSProperties {
  const s: React.CSSProperties = {}
  if (cls.includes("top-0")) s.top = 0
  if (cls.includes("bottom-0")) s.bottom = 0
  if (cls.includes("left-0")) s.left = 0
  if (cls.includes("right-0")) s.right = 0
  return s
}
