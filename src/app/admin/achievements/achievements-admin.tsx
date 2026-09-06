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
import { Plus, Pencil, Trash2, Award, Eye, EyeOff, Search } from "lucide-react"
import { toast } from "sonner"
import {
  createAchievement,
  updateAchievement,
  deleteAchievement,
  type CreateAchievementInput,
  type UpdateAchievementInput,
} from "./actions/achievement-actions"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Switch } from "@/components/ui/switch"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { SectionVisualEditor, VISUAL_SECTIONS } from "@/components/admin/shared/section-visual-editor"
import type { SectionVisualRow } from "@/components/admin/shared/section-visual-editor"

const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  awardingOrganization: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  certificateUrl: z.string().optional(),
  externalUrl: z.string().optional(),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
})

type AchievementFormValues = z.input<typeof achievementSchema>

interface Achievement {
  id: string
  title: string
  awardingOrganization: string | null
  date: Date
  description: string | null
  image: string | null
  certificateUrl: string | null
  externalUrl: string | null
  isVisible: boolean
  isFeatured: boolean
  sortOrder: number
}

export function AchievementsAdmin({ initialData, sectionVisual }: { initialData: Achievement[]; sectionVisual?: SectionVisualRow | null }) {
  const [data, setData] = useState<Achievement[]>(initialData)
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
  } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      isVisible: true,
      isFeatured: false,
      sortOrder: 0,
    },
  })

  const onOpenDialog = (item?: Achievement) => {
    if (item) {
      setEditingId(item.id)
      reset({
        ...item,
        awardingOrganization: item.awardingOrganization ?? undefined,
        description: item.description ?? undefined,
        image: item.image ?? undefined,
        certificateUrl: item.certificateUrl ?? undefined,
        externalUrl: item.externalUrl ?? undefined,
        date: new Date(item.date).toISOString().split("T")[0],
      })
    } else {
      setEditingId(null)
      reset({
        title: "",
        awardingOrganization: "",
        date: "",
        description: "",
        image: "",
        certificateUrl: "",
        externalUrl: "",
        isVisible: true,
        isFeatured: false,
        sortOrder: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: AchievementFormValues) => {
    try {
      if (editingId) {
        await updateAchievement(editingId, values as UpdateAchievementInput)
        toast.success("Achievement updated")
      } else {
        await createAchievement(values as CreateAchievementInput)
        toast.success("Achievement created")
      }
      window.location.reload()
    } catch {
      toast.error("An error occurred")
    }
  }

  const onDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteAchievement(id)
      toast.success("Achievement deleted")
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
      a.awardingOrganization?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground">Manage your awards and achievements.</p>
        </div>
        <Button onClick={() => onOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Achievement
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search achievements..."
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
                <TableHead>Organization</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                        <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.awardingOrganization || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.date).toLocaleDateString()}
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
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    No achievements found.
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
            <DialogTitle>{editingId ? "Edit Achievement" : "Add Achievement"}</DialogTitle>
            <DialogDescription>Add or update an achievement or award.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...register("title")} placeholder="Achievement title" />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="awardingOrganization">Awarding Organization</Label>
                <Input id="awardingOrganization" {...register("awardingOrganization")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} rows={3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certificateUrl">Certificate URL</Label>
                <Input id="certificateUrl" {...register("certificateUrl")} type="url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="externalUrl">External URL</Label>
                <Input id="externalUrl" {...register("externalUrl")} type="url" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label>Publicly Visible</Label>
                <p className="text-xs text-muted-foreground">Show in public achievements list.</p>
              </div>
              <Switch
                checked={useWatch({ name: "isVisible", control })}
                onCheckedChange={(checked) => setValue("isVisible", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label>Featured</Label>
                <p className="text-xs text-muted-foreground">Highlight this achievement.</p>
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
        title="Delete Achievement"
        description="Are you sure you want to delete this achievement? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget) }}
      />

      {sectionVisual && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Home Preview</h3>
          <p className="text-xs text-muted-foreground">Editorial image shown in the Achievements section on the homepage.</p>
          <SectionVisualEditor
            row={sectionVisual}
            meta={VISUAL_SECTIONS.find((s) => s.sectionId === "ACHIEVEMENTS")!}
          />
        </div>
      )}
    </div>
  )
}
