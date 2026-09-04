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
import { createEducation, updateEducation, deleteEducation } from "./actions/education-actions"
import { Education } from "@prisma/client"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  department: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  result: z.string().optional(),
  description: z.string().optional(),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
})

type EducationFormValues = z.infer<typeof educationSchema>

export function AdminEducationPage({ initialData }: { initialData: Education[] }) {
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
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema) as Resolver<EducationFormValues>,
    defaultValues: {
      isVisible: true,
      isFeatured: false,
      sortOrder: 0,
    },
  })

  const onOpenDialog = (item?: Education) => {
    if (item) {
      setEditingId(item.id)
      reset({
        ...item,
        startDate: item.startDate ? new Date(item.startDate).toISOString().split("T")[0] : "",
        endDate: item.endDate ? new Date(item.endDate).toISOString().split("T")[0] : "",
      } as EducationFormValues)
    } else {
      setEditingId(null)
      reset({
        degree: "",
        institution: "",
        isVisible: true,
        isFeatured: false,
        sortOrder: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: EducationFormValues) => {
    try {
      if (editingId) {
        await updateEducation(editingId, values)
        toast.success("Education updated")
      } else {
        await createEducation(values)
        toast.success("Education created")
      }
      setIsDialogOpen(false)
      // Refresh data (in a real app, we might use a server action to return the updated list or revalidate)
      window.location.reload()
    } catch {
      toast.error("An error occurred")
    }
  }

  const onDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteEducation(id)
      toast.success("Education deleted")
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Education</h1>
          <p className="text-muted-foreground">Manage your academic qualifications and degrees.</p>
        </div>
        <Button onClick={() => onOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Education
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Degree</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.degree}</TableCell>
                <TableCell>{item.institution}</TableCell>
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
                  No education records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Education" : "Add Education"}</DialogTitle>
            <DialogDescription>Enter the details of your academic qualification.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input id="degree" {...register("degree")} />
                {errors.degree && <p className="text-xs text-red-500">{errors.degree.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input id="institution" {...register("institution")} />
                {errors.institution && <p className="text-xs text-red-500">{errors.institution.message}</p>}
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
                <Label htmlFor="department">Department</Label>
                <Input id="department" {...register("department")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field">Field of Study</Label>
                <Input id="field" {...register("field")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} rows={3} />
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
            <DialogFooter>
              <Button type="submit">Save Education</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Education"
        description="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget) }}
      />
    </div>
  )
}
