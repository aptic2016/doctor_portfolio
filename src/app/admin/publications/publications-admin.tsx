"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Pencil, Trash2, ExternalLink, Eye, EyeOff, Search } from "lucide-react"
import { toast } from "sonner"
import {
  createPublication,
  updatePublication,
  deletePublication,
} from "./actions/publication-actions"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Switch } from "@/components/ui/switch"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const publicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  authors: z.string().min(1, "Authors are required"),
  journal: z.string().optional(),
  conference: z.string().optional(),
  publisher: z.string().optional(),
  publicationDate: z.string().min(1, "Publication date is required"),
  abstract: z.string().optional(),
  doi: z.string().optional(),
  citation: z.string().optional(),
  externalUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  coverImage: z.string().optional(),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
})

type PublicationFormValues = z.infer<typeof publicationSchema>

interface Publication {
  id: string
  title: string
  slug: string
  authors: string
  journal: string | null
  conference: string | null
  publisher: string | null
  publicationDate: Date
  abstract: string | null
  doi: string | null
  externalUrl: string | null
  isVisible: boolean
  isFeatured: boolean
  isPublished: boolean
  sortOrder: number
}

export function PublicationsAdmin({ initialData }: { initialData: Publication[] }) {
  const [data, setData] = useState<Publication[]>(initialData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema) as Resolver<PublicationFormValues>,
    defaultValues: {
      isVisible: true,
      isFeatured: false,
      isPublished: true,
      sortOrder: 0,
    },
  })

  const onOpenDialog = (item?: Publication) => {
    if (item) {
      setEditingId(item.id)
      reset({
        ...item,
        journal: item.journal ?? undefined,
        conference: item.conference ?? undefined,
        publisher: item.publisher ?? undefined,
        abstract: item.abstract ?? undefined,
        doi: item.doi ?? undefined,
        externalUrl: item.externalUrl ?? undefined,
        publicationDate: new Date(item.publicationDate).toISOString().split("T")[0],
      })
    } else {
      setEditingId(null)
      reset({
        title: "",
        authors: "",
        journal: "",
        conference: "",
        publisher: "",
        publicationDate: "",
        abstract: "",
        doi: "",
        externalUrl: "",
        isVisible: true,
        isFeatured: false,
        isPublished: true,
        sortOrder: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: PublicationFormValues) => {
    try {
      if (editingId) {
        await updatePublication(editingId, values)
        toast.success("Publication updated")
      } else {
        await createPublication(values)
        toast.success("Publication created")
      }
      window.location.reload()
    } catch {
      toast.error("An error occurred")
    }
  }

  const onDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deletePublication(id)
      toast.success("Publication deleted")
      setData(data.filter((item) => item.id !== id))
    } catch {
      toast.error("Failed to delete")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const filteredData = data.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.authors.toLowerCase().includes(search.toLowerCase()) ||
      a.journal?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Publications</h1>
          <p className="text-muted-foreground">Manage your research publications.</p>
        </div>
        <Button onClick={() => onOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Publication
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search publications..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Authors</TableHead>
                <TableHead>Journal/Conference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.doi && (
                        <p className="text-xs text-muted-foreground">DOI: {item.doi}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{item.authors}</TableCell>
                  <TableCell className="text-sm">
                    {item.journal || item.conference || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.publicationDate).toLocaleDateString()}
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.externalUrl && (
                        <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
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
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    No publications found.
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
            <DialogTitle>{editingId ? "Edit Publication" : "Add Publication"}</DialogTitle>
            <DialogDescription>Add or update a research publication.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...register("title")} placeholder="Publication title" />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="authors">Authors *</Label>
              <Input id="authors" {...register("authors")} placeholder="Author 1, Author 2, ..." />
              {errors.authors && <p className="text-xs text-red-500">{errors.authors.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="journal">Journal</Label>
                <Input id="journal" {...register("journal")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conference">Conference</Label>
                <Input id="conference" {...register("conference")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input id="publisher" {...register("publisher")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicationDate">Publication Date *</Label>
                <Input id="publicationDate" type="date" {...register("publicationDate")} />
                {errors.publicationDate && (
                  <p className="text-xs text-red-500">{errors.publicationDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract</Label>
              <Textarea id="abstract" {...register("abstract")} rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doi">DOI</Label>
                <Input id="doi" {...register("doi")} placeholder="10.1234/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="externalUrl">External URL</Label>
                <Input id="externalUrl" {...register("externalUrl")} type="url" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label>Publicly Visible</Label>
                <p className="text-xs text-muted-foreground">Show in public publications list.</p>
              </div>
              <Switch
                checked={useWatch({ name: "isVisible", control })}
                onCheckedChange={(checked) => setValue("isVisible", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label>Featured</Label>
                <p className="text-xs text-muted-foreground">Highlight this publication.</p>
              </div>
              <Switch
                checked={useWatch({ name: "isFeatured", control })}
                onCheckedChange={(checked) => setValue("isFeatured", checked)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Publication"
        description="Are you sure you want to delete this publication? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget) }}
      />
    </div>
  )
}
