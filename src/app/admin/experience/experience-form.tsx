"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createExperience, updateExperience, deleteExperience } from "./actions/experience-actions"
import { Experience } from "@prisma/client"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { SectionVisualEditor, VISUAL_SECTIONS } from "@/components/admin/shared/section-visual-editor"
import type { SectionVisualRow } from "@/components/admin/shared/section-visual-editor"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const experienceSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  organization: z.string().min(1, "Organization is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  achievements: z.string().optional(),
  organizationUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
})

type ExperienceFormValues = z.infer<typeof experienceSchema>

export function AdminExperiencePage({ initialData, sectionVisual }: { initialData: Experience[]; sectionVisual?: SectionVisualRow | null }) {
  const [data, setData] = useState(initialData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema) as Resolver<ExperienceFormValues>,
    defaultValues: {
      isCurrent: false,
      isVisible: true,
      isFeatured: false,
      sortOrder: 0,
    },
  })

  const onOpenDialog = (item?: Experience) => {
    if (item) {
      setEditingId(item.id)
      reset({
        ...item,
        startDate: item.startDate ? new Date(item.startDate).toISOString().split("T")[0] : "",
        endDate: item.endDate ? new Date(item.endDate).toISOString().split("T")[0] : "",
      } as ExperienceFormValues)
    } else {
      setEditingId(null)
      reset({
        jobTitle: "",
        organization: "",
        isVisible: true,
        isFeatured: false,
        sortOrder: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: ExperienceFormValues) => {
    try {
      if (editingId) {
        await updateExperience(editingId, values)
        toast.success("Experience updated")
      } else {
        await createExperience(values)
        toast.success("Experience created")
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
      await deleteExperience(id)
      toast.success("Experience deleted")
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Experience</h1>
          <p className="text-muted-foreground">Manage your professional history and career milestones.</p>
        </div>
        <Button onClick={() => onOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Experience
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.jobTitle}</TableCell>
                <TableCell>{item.organization}</TableCell>
                <TableCell>
                  {new Date(item.startDate).getFullYear()} - {item.endDate ? new Date(item.endDate).getFullYear() : "Present"}
                </TableCell>
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
                  No experience records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Experience" : "Add Experience"}</DialogTitle>
            <DialogDescription>Enter the details of your professional role.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" {...register("jobTitle")} />
                {errors.jobTitle && <p className="text-xs text-red-500">{errors.jobTitle.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input id="organization" {...register("organization")} />
                {errors.organization && <p className="text-xs text-red-500">{errors.organization.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input id="endDate" type="date" {...register("endDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizationUrl">Organization URL</Label>
                <Input id="organizationUrl" {...register("organizationUrl")} />
                {errors.organizationUrl && <p className="text-xs text-red-500">{errors.organizationUrl.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Textarea id="responsibilities" {...register("responsibilities")} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="achievements">Key Achievements</Label>
              <Textarea id="achievements" {...register("achievements")} rows={3} />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="space-y-0.5">
                <Label>Publicly Visible</Label>
                <p className="text-xs text-muted-foreground">Show this record on the public website.</p>
              </div>
              <Switch
                checked={useWatch({ name: "isVisible", control })}
                onCheckedChange={(checked) => setValue("isVisible", checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="space-y-0.5">
                <Label>Current Position</Label>
                <p className="text-xs text-muted-foreground">Mark as your current role.</p>
              </div>
              <Switch
                checked={useWatch({ name: "isCurrent", control })}
                onCheckedChange={(checked) => setValue("isCurrent", checked)}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save Experience</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Experience"
        description="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget) }}
      />

      {sectionVisual && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Home Preview</h3>
          <p className="text-xs text-muted-foreground">Editorial image shown in the Professional Journey section on the homepage.</p>
          <SectionVisualEditor
            row={sectionVisual}
            meta={VISUAL_SECTIONS.find((s) => s.sectionId === "EXPERIENCE_HIGHLIGHTS")!}
          />
        </div>
      )}
    </div>
  )
}
