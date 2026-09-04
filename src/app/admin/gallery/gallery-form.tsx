"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from "./actions/gallery-actions"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card } from "@/components/ui/card"
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

interface GalleryItemData {
  id: string
  mediaAssetId: string
  caption?: string | null
  category?: string | null
  isVisible?: boolean
  isFeatured?: boolean
  captureDate?: string | null
  location?: string | null
  sortOrder?: number
  mediaAsset?: { secureUrl: string } | null
}

export function AdminGalleryPage({ initialData }: { initialData: GalleryItemData[] }) {
  const [data, setData] = useState(initialData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
  } = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema) as Resolver<GalleryFormValues>,
    defaultValues: {
      isVisible: true,
      isFeatured: false,
      sortOrder: 0,
    },
  })

  const onOpenDialog = (item?: GalleryItemData) => {
    if (item) {
      setEditingId(item.id)
      reset({
        ...item,
        captureDate: item.captureDate ? new Date(item.captureDate).toISOString().split("T")[0] : "",
      } as GalleryFormValues)
    } else {
      setEditingId(null)
      reset({
        mediaAssetId: "",
        isVisible: true,
        isFeatured: false,
        sortOrder: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: GalleryFormValues) => {
    try {
      if (editingId) {
        await updateGalleryItem(editingId, values)
        toast.success("Gallery item updated")
      } else {
        await createGalleryItem(values)
        toast.success("Gallery item created")
      }
      setIsDialogOpen(false)
      window.location.reload()
    } catch {
      toast.error("An error occurred")
    }
  }

  const onDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteGalleryItem(id)
      toast.success("Item deleted")
      setData(data.filter(item => item.id !== id))
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
          <p className="text-muted-foreground">Curate the best moments of your professional life.</p>
        </div>
        <Button onClick={() => onOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Image
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Preview</TableHead>
              <TableHead>Caption</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="h-10 w-10 rounded bg-slate-100 overflow-hidden">
                    <img src={item.mediaAsset?.secureUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{item.caption || "No caption"}</TableCell>
                <TableCell>{item.category || "General"}</TableCell>
                <TableCell>
                  {item.isVisible ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Public</span>
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">Private</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onOpenDialog(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteTarget(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No gallery items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Gallery Item" : "Add Gallery Item"}</DialogTitle>
            <DialogDescription>Select an image and add a caption for your gallery.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <MediaPicker
                label="Gallery Image"
                value={undefined} // We use the onChange to set mediaAssetId
                onChange={() => {
                  // In a real app, we'd resolve the URL back to an ID or store the ID in the picker
                  // For now, we assume the picker returns a URL and we have to find the ID
                  // Better: Update MediaPicker to return ID. I'll do that now.
                }}
              />
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Input id="caption" {...register("caption")} placeholder="Describe the moment..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register("category")} placeholder="e.g. Conferences, Awards" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="captureDate">Capture Date</Label>
                <Input id="captureDate" type="date" {...register("captureDate")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} placeholder="City, Country" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="space-y-0.5">
                <Label>Publicly Visible</Label>
                <p className="text-xs text-muted-foreground">Show this in the public gallery.</p>
              </div>
              <Switch
                checked={useWatch({ name: "isVisible", control })}
                onCheckedChange={(checked) => setValue("isVisible", checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="space-y-0.5">
                <Label>Featured Item</Label>
                <p className="text-xs text-muted-foreground">Highlight this image in the gallery.</p>
              </div>
              <Switch
                checked={useWatch({ name: "isFeatured", control })}
                onCheckedChange={(checked) => setValue("isFeatured", checked)}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Save Gallery Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Gallery Item"
        description="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget) }}
      />
    </div>
  )
}
