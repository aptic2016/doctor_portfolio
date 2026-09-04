"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, X, ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB
const ALLOWED_EXTENSIONS = ".jpg,.jpeg,.png,.webp"

const uploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File, "File is required"),
  altText: z.string().optional(),
  folder: z.string().optional(),
})

type UploadFormValues = z.infer<typeof uploadSchema>

interface MediaAsset {
  id: string
  publicId: string
  secureUrl: string
  originalFilename?: string | null
  displayName?: string | null
  purpose?: string | null
  altText?: string | null
  width?: number | null
  height?: number | null
  format?: string | null
  folder?: string | null
  createdAt: string
}

interface MediaUploaderProps {
  onUploadSuccess: (asset?: MediaAsset) => void
  trigger?: React.ReactNode
  purpose?: string
}

type UploadStep = "idle" | "uploading" | "done" | "error"

export function MediaUploader({ onUploadSuccess, purpose = "GENERAL" }: MediaUploaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadStep, setUploadStep] = useState<UploadStep>("idle")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
  })

  const watchedFile = useWatch({ name: "file", control })

  const isUploading = uploadStep !== "idle" && uploadStep !== "done" && uploadStep !== "error"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setValue("file", file, { shouldValidate: true })
    setUploadError(null)

    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const resetState = () => {
    reset()
    setPreview(null)
    setUploadStep("idle")
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const onSubmit = async (values: UploadFormValues) => {
    setUploadStep("uploading")
    setUploadError(null)

    try {
      const file = values.file
      const folder = values.folder || "portfolio"

      // Upload via server-side API (no client-side env vars needed)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("altText", values.altText || "")
      formData.append("folder", folder)
      formData.append("purpose", purpose)

      const uploadRes = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      })

      const result = await uploadRes.json()

      if (!uploadRes.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setUploadStep("done")
      toast.success("Image uploaded successfully")
      setTimeout(() => {
        resetState()
        setIsDialogOpen(false)
        onUploadSuccess(result)
      }, 800)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setUploadError(message)
      setUploadStep("error")
      toast.error(message)
    }
  }

  const stepLabels: Record<UploadStep, string> = {
    idle: "Upload Now",
    uploading: "Uploading to Cloudinary...",
    done: "Upload complete!",
    error: "Upload failed",
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open)
      if (!open) resetState()
    }}>
      <DialogTrigger render={<Button />}>
        <Upload className="h-4 w-4 mr-2" /> Upload Asset
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload a new image to your media library. Max 8MB.
          </DialogDescription>
        </DialogHeader>
        {/* eslint-disable-next-line react-hooks/refs -- handleSubmit from react-hook-form is safe */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Image File</Label>
            <div className="relative">
              <Input
                id="file"
                type="file"
                accept={ALLOWED_EXTENSIONS}
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-32 border-dashed"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {preview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    {!isUploading && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreview(null)
                          setValue("file", null as unknown as File)
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">Click to select image</span>
                    <span className="text-xs">JPEG, PNG, WebP up to 8MB</span>
                  </div>
                )}
              </Button>
            </div>
            {errors.file && (
              <p className="text-xs text-red-500">{typeof errors.file.message === "string" ? errors.file.message : "Invalid file"}</p>
            )}
          </div>

          {/* Upload Progress */}
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
              <span>{uploadStep === "error" && uploadError ? uploadError : stepLabels[uploadStep]}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="altText">Alt Text</Label>
            <Input
              id="altText"
              {...register("altText")}
              placeholder="Describe the image for accessibility"
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Input
              id="folder"
              {...register("folder")}
              placeholder="portfolio"
              defaultValue="portfolio"
              disabled={isUploading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                resetState()
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !watchedFile}>
              {isUploading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
              ) : uploadStep === "done" ? (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Done</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" /> Upload Now</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
