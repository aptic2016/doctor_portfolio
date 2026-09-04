"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "./actions/gallery-actions"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Switch } from "@/components/ui/switch"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const gallerySchema = z.object({
  mediaAssetId: z.string().min(1, "Image is required"),
  caption: z.string().optional(),
  category: z.string().optional(),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  captureDate: z.string().optional(),
  location: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
})

type GalleryFormValues = z.infer<typeof gallerySchema>

interface GalleryItemWithAsset {
  id: string
  caption: string | null
  category: string | null
  isVisible: boolean
  isFeatured: boolean
  captureDate: Date | null
  location: string | null
  sortOrder: number
  mediaAsset: {
    id: string
    secureUrl: string
    altText: string | null
    publicId: string
  } | null
}

export function GalleryAdmin({ initialData }: { initialData: GalleryItemWithAsset[] }) {
  const [data, setData] = useState<GalleryItemWithAsset[]>(initialData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("")
  const [selectedAssetId, setSelectedAssetId] = useState<string>("")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema) as Resolver<GalleryFormValues>,
    defaultValues: {
      isVisible: true,
      isFeatured: false,
      sortOrder: 0,
    },
  })

  const onOpenDialog = (item?: GalleryItemWithAsset) => {
    if (item) {
      setEditingId(item.id)
      setSelectedImageUrl(item.mediaAsset?.secureUrl ?? "")
      setSelectedAssetId(item.mediaAsset?.id ?? "")
      reset({
        mediaAssetId: item.mediaAsset?.id ?? "",
        caption: item.caption || "",
        category: item.category || "",
        isVisible: item.isVisible,
        isFeatured: item.isFeatured,
        captureDate: item.captureDate
          ? item.captureDate.toISOString().split("T")[0]
          : "",
        location: item.location || "",
        sortOrder: item.sortOrder,
      })
    } else {
      setEditingId(null)
      setSelectedImageUrl("")
      setSelectedAssetId("")
      reset({
        mediaAssetId: "",
        caption: "",
        category: "",
        isVisible: true,
        isFeatured: false,
        captureDate: "",
        location: "",
        sortOrder: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: GalleryFormValues) => {
    try {
      const payload = { ...values, mediaAssetId: selectedAssetId }
      if (editingId) {
        await updateGalleryItem(editingId, payload)
        toast.success("Gallery item updated")
        setData(
          data.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  caption: payload.caption ?? null,
                  category: payload.category ?? null,
                  isVisible: payload.isVisible ?? item.isVisible,
                  isFeatured: payload.isFeatured ?? item.isFeatured,
                  sortOrder: Number(payload.sortOrder) || item.sortOrder,
                  captureDate: item.captureDate,
                  location: payload.location ?? null,
                  mediaAsset: item.mediaAsset,
                }
              : item
          )
        )
      } else {
        await createGalleryItem(payload)
        toast.success("Gallery item created")
        window.location.reload()
      }
      setIsDialogOpen(false)
    } catch {
      toast.error("An error occurred")
    }
  }

  const onDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteGalleryItem(id)
      toast.success("Item deleted")
      setData(data.filter((item) => item.id !== id))
    } catch {
      toast.error("Failed to delete")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const categories = [...new Set(data.map((item) => item.category).filter(Boolean))]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gallery Management</h1>
          <p className="text-muted-foreground">
            Curate the best moments of your professional life.
          </p>
        </div>
        <Button onClick={() => onOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Image
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Preview</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={item.mediaAsset?.secureUrl ?? ""}
                        alt={item.mediaAsset?.altText || ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.caption || "No caption"}
                  </TableCell>
                  <TableCell>
                    {item.category ? (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.captureDate
                      ? new Date(item.captureDate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {item.isVisible ? (
                      <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                        <Eye className="h-3 w-3" /> Public
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                        <EyeOff className="h-3 w-3" /> Private
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.isFeatured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onOpenDialog(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => setDeleteTarget(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-16 text-muted-foreground"
                  >
                    No gallery items yet. Add your first image.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Gallery Item" : "Add Gallery Item"}
            </DialogTitle>
            <DialogDescription>
              Select an image and add details for your gallery.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Gallery Image *</Label>
              <MediaPicker
                value={selectedImageUrl}
                onChange={(url, asset) => {
                  setSelectedImageUrl(url)
                  if (asset) {
                    setSelectedAssetId(asset.id)
                    setValue("mediaAssetId", asset.id, { shouldValidate: true })
                  }
                }}
              />
              {errors.mediaAssetId && (
                <p className="text-xs text-red-500">{errors.mediaAssetId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                {...register("caption")}
                placeholder="Describe the moment..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...register("category")}
                  placeholder="e.g. Conferences, Awards"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat!} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="captureDate">Capture Date</Label>
                <Input id="captureDate" type="date" {...register("captureDate")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                {...register("sortOrder")}
                className="w-24"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label>Publicly Visible</Label>
                <p className="text-xs text-muted-foreground">
                  Show this in the public gallery.
                </p>
              </div>
              <Switch
                checked={useWatch({ name: "isVisible", control })}
                onCheckedChange={(checked) => setValue("isVisible", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label>Featured Item</Label>
                <p className="text-xs text-muted-foreground">
                  Highlight this image in the gallery.
                </p>
              </div>
              <Switch
                checked={useWatch({ name: "isFeatured", control })}
                onCheckedChange={(checked) => setValue("isFeatured", checked)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Update" : "Create"} Gallery Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Gallery Item"
        description="Are you sure you want to delete this gallery item? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget) }}
      />
    </div>
  )
}
