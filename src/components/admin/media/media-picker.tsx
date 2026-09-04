"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImageIcon, Search, X, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface MediaAsset {
  id: string
  publicId: string
  secureUrl: string
  originalFilename?: string | null
  displayName?: string | null
  altText?: string | null
  width?: number | null
  height?: number | null
  format?: string | null
  purpose?: string | null
}

interface MediaPickerProps {
  value?: string
  onChange: (url: string, asset?: MediaAsset) => void
  label?: string
  purpose?: string
  filterPurpose?: string
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_EXTENSIONS = ".jpg,.jpeg,.png,.webp"

type UploadStep = "idle" | "uploading" | "done" | "error"

export function MediaPicker({ value, onChange, label, purpose = "GENERAL", filterPurpose }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library")
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadAltText, setUploadAltText] = useState("")
  const [uploadFolder, setUploadFolder] = useState("portfolio")
  const [uploadStep, setUploadStep] = useState<UploadStep>("idle")
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/media/assets")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setAssets(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to fetch media assets")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    let active = true
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/media/assets")
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        if (active) setAssets(Array.isArray(data) ? data : [])
      } catch {
        if (active) toast.error("Failed to fetch media assets")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [isOpen])

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.altText?.toLowerCase().includes(search.toLowerCase()) ||
      a.publicId.toLowerCase().includes(search.toLowerCase()) ||
      a.originalFilename?.toLowerCase().includes(search.toLowerCase()) ||
      a.displayName?.toLowerCase().includes(search.toLowerCase())
    const matchesPurpose = !filterPurpose || a.purpose === filterPurpose || a.purpose === "GENERAL"
    return matchesSearch && matchesPurpose
  })

  const handleSelect = (asset: MediaAsset) => {
    onChange(asset.secureUrl, asset)
    setIsOpen(false)
    setSearch("")
  }

  const handleRemove = () => {
    onChange("")
    setSearch("")
  }

  const resetUpload = () => {
    setUploadFile(null)
    setUploadPreview(null)
    setUploadAltText("")
    setUploadStep("idle")
    setUploadError(null)
  }

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Allowed: JPEG, PNG, WebP")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Image must be under ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`)
      return
    }

    setUploadFile(file)
    setUploadError(null)
    const reader = new FileReader()
    reader.onloadend = () => setUploadPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!uploadFile) return

    setUploadStep("uploading")
    try {
      const folder = uploadFolder || "portfolio"

      // Upload via server-side API (no client-side env vars needed)
      const formData = new FormData()
      formData.append("file", uploadFile)
      formData.append("altText", uploadAltText)
      formData.append("folder", folder)
      formData.append("purpose", purpose)

      const uploadRes = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      })
      const result = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(result.error || "Upload failed")

      const registeredAsset = result

      // Done - refresh list and auto-select
      setUploadStep("done")
      toast.success("Image uploaded successfully")
      
      // Refresh assets list
      await fetchAssets()
      
      // Auto-select the newly uploaded asset
      onChange(registeredAsset.secureUrl, registeredAsset)
      
      setTimeout(() => {
        resetUpload()
        setActiveTab("library")
        setIsOpen(false)
        setSearch("")
      }, 600)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setUploadError(message)
      setUploadStep("error")
      toast.error(message)
    }
  }

  const isUploading = uploadStep !== "idle" && uploadStep !== "done" && uploadStep !== "error"

  const getDisplayName = (asset: MediaAsset) => {
    return asset.displayName || asset.originalFilename || asset.altText || asset.publicId.split("/").pop() || "Untitled"
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Input
            readOnly
            value={value || ""}
            placeholder="No image selected"
            className="pr-10"
          />
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            setSearch("")
            resetUpload()
            setActiveTab("library")
          }
        }}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
              <ImageIcon className="h-4 w-4 mr-2" /> Select
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Media</DialogTitle>
              <DialogDescription>
                Choose from your media library or upload a new image.
              </DialogDescription>
            </DialogHeader>

            {/* Tabs */}
            <div className="flex gap-1 border-b">
              <button
                onClick={() => setActiveTab("library")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "library"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Media Library
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "upload"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Upload New
              </button>
            </div>

            {/* Library Tab */}
            {activeTab === "library" && (
              <div className="flex flex-col flex-grow min-h-0">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or alt text..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex-grow overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {isLoading ? (
                    Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                    ))
                  ) : (
                    filteredAssets.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => handleSelect(asset)}
                        className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all"
                      >
                        <img
                          src={asset.secureUrl}
                          alt={asset.altText || ""}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 text-white text-[10px] truncate">
                          {getDisplayName(asset)}
                        </div>
                      </button>
                    ))
                  )}
                  {filteredAssets.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 text-center text-muted-foreground">
                      No media assets found. Try uploading one.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === "upload" && (
              <div className="flex-grow overflow-y-auto space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Image File</Label>
                  <div className="relative">
                    <input
                      type="file"
                      accept={ALLOWED_EXTENSIONS}
                      onChange={handleUploadFileChange}
                      className="hidden"
                      id="media-picker-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-40 border-dashed"
                      onClick={() => document.getElementById("media-picker-upload")?.click()}
                      disabled={isUploading}
                    >
                      {uploadPreview ? (
                        <div className="relative w-full h-full">
                          <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain" />
                          {!isUploading && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                resetUpload()
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Upload className="h-10 w-10" />
                          <span className="text-sm">Click to select image</span>
                          <span className="text-xs">JPEG, PNG, WebP up to 8MB</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Alt Text</Label>
                  <Input
                    placeholder="Describe the image for accessibility"
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Folder</Label>
                  <Input
                    placeholder="portfolio"
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                {uploadStep !== "idle" && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    uploadStep === "done" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                    uploadStep === "error" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                    "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  }`}>
                    {uploadStep === "done" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : uploadStep === "error" ? (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    )}
                    <span>{uploadStep === "error" && uploadError ? uploadError :
                      uploadStep === "uploading" ? "Uploading to Cloudinary..." :
                      uploadStep === "done" ? "Upload complete!" : ""
                    }</span>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                  ) : uploadStep === "done" ? (
                    <><CheckCircle2 className="h-4 w-4 mr-2" /> Done</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" /> Upload to Library</>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {value && (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
          <img
            src={value}
            alt="Selected"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  )
}
