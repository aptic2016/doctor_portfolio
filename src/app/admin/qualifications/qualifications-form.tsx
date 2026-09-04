"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  createQualification, updateQualification, deleteQualification,
  createCertification, updateCertification, deleteCertification
} from "./actions/qualifications-actions"
import { Qualification, Certification } from "@prisma/client"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const credentialSchema = z.object({
  title: z.string().min(1, "Title is required"),
  institution: z.string().optional(),
  issuingOrganization: z.string().optional(),
  credential: z.string().optional(),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  description: z.string().optional(),
  credentialUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
})

type CredentialFormValues = z.infer<typeof credentialSchema>

export function AdminQualificationsPage({ initialQualifications, initialCertifications }: {
  initialQualifications: Qualification[],
  initialCertifications: Certification[]
}) {
  const [quals] = useState(initialQualifications)
  const [certs] = useState(initialCertifications)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [type, setType] = useState<"qualification" | "certification">("qualification")
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "qualification" | "certification" } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema) as Resolver<CredentialFormValues>,
    defaultValues: {
      isVisible: true,
      isFeatured: false,
      sortOrder: 0,
    },
  })

  const onOpenDialog = (item?: Qualification | Certification, itemType: "qualification" | "certification" = "qualification") => {
    setType(itemType)
    if (item) {
      setEditingId(item.id)
      reset({
        ...item,
        issueDate: item.issueDate ? new Date(item.issueDate).toISOString().split("T")[0] : "",
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "",
      } as CredentialFormValues)
    } else {
      setEditingId(null)
      reset({
        title: "",
        isVisible: true,
        isFeatured: false,
        sortOrder: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: CredentialFormValues) => {
    try {
      if (type === "qualification") {
        if (editingId) {
          await updateQualification(editingId, values)
        } else {
          await createQualification(values)
        }
      } else {
        if (editingId) {
          await updateCertification(editingId, values)
        } else {
          await createCertification(values)
        }
      }
      toast.success(`${type === "qualification" ? "Qualification" : "Certification"} saved`)
      setIsDialogOpen(false)
      window.location.reload()
    } catch {
      toast.error("An error occurred")
    }
  }

  const onDelete = async (id: string, itemType: "qualification" | "certification") => {
    setIsDeleting(true)
    try {
      if (itemType === "qualification") {
        await deleteQualification(id)
      } else {
        await deleteCertification(id)
      }
      toast.success("Record deleted")
      window.location.reload()
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-12">
      {/* Qualifications Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Qualifications</h1>
            <p className="text-muted-foreground">Manage your core professional qualifications.</p>
          </div>
          <Button onClick={() => onOpenDialog(undefined, "qualification")}>
            <Plus className="h-4 w-4 mr-2" /> Add Qualification
          </Button>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quals.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.issuingOrganization || item.institution}</TableCell>
                  <TableCell>{item.issueDate ? new Date(item.issueDate).getFullYear() : "N/A"}</TableCell>
                  <TableCell>
                    {item.isVisible ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Public</span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">Private</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onOpenDialog(item, "qualification")}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteTarget({ id: item.id, type: "qualification" })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Certifications Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Certifications</h1>
            <p className="text-muted-foreground">Manage your professional certifications.</p>
          </div>
          <Button onClick={() => onOpenDialog(undefined, "certification")}>
            <Plus className="h-4 w-4 mr-2" /> Add Certification
          </Button>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certs.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.issuingOrganization || item.institution}</TableCell>
                  <TableCell>{item.issueDate ? new Date(item.issueDate).getFullYear() : "N/A"}</TableCell>
                  <TableCell>
                    {item.isVisible ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Public</span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">Private</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onOpenDialog(item, "certification")}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteTarget({ id: item.id, type: "certification" })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? `Edit ${type === "qualification" ? "Qualification" : "Certification"}` : `Add ${type === "qualification" ? "Qualification" : "Certification"}`}</DialogTitle>
            <DialogDescription>Enter the details of your credential.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input id="institution" {...register("institution")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuingOrganization">Issuing Org</Label>
                <Input id="issuingOrganization" {...register("issuingOrganization")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input id="issueDate" type="date" {...register("issueDate")} />
                {errors.issueDate && <p className="text-xs text-red-500">{errors.issueDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" type="date" {...register("expiryDate")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="credential">Credential ID / Number</Label>
                <Input id="credential" {...register("credential")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="credentialUrl">Verification URL</Label>
                <Input id="credentialUrl" type="url" {...register("credentialUrl")} />
                {errors.credentialUrl && <p className="text-xs text-red-500">{errors.credentialUrl.message}</p>}
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
              <Button type="submit">Save Credential</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title={`Delete ${deleteTarget?.type === "qualification" ? "Qualification" : "Certification"}`}
        description="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget.id, deleteTarget.type) }}
      />
    </div>
  )
}
