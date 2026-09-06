"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { FocalPointPicker } from "@/components/admin/media/focal-point-picker"
import { resolveFocalPosition } from "@/lib/media/focal-point"
import { updateContactSettings } from "./actions"
import { toast } from "sonner"
import { Trash2, MapPin, Plus, ChevronUp, ChevronDown, Pencil, ImageIcon } from "lucide-react"
import {
  createFooterLocation, updateFooterLocation, deleteFooterLocation, moveFooterLocation,
} from "@/app/admin/settings/actions"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface LocationItem { id: string; title: string; hospitalName: string | null; address: string | null; visitingDays: string | null; visitingHours: string | null; appointmentPhone: string | null; mapsUrl: string | null; mapsEmbedUrl: string | null; icon: string | null; ctaLabel: string | null; isPrimary: boolean; sortOrder: number; isVisible: boolean }

type Tab = "image" | "locations"

export function ContactAdmin({
  profileId,
  displayName,
  professionalTitle,
  location,
  contactImageUrl: initialContactImageUrl,
  contactImageAlt: initialContactImageAlt,
  showContactImage: initialShowContactImage,
  contactImagePosition: initialContactImagePosition,
  initialLocations,
}: {
  profileId: string; displayName: string; professionalTitle: string; location: string | null;
  contactImageUrl: string | null; contactImageAlt: string | null; showContactImage: boolean;
  contactImagePosition: string | null; initialLocations: LocationItem[];
}) {
  const [tab, setTab] = useState<Tab>("image")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactImageUrl, setContactImageUrl] = useState(initialContactImageUrl || "")
  const [contactImageAlt, setContactImageAlt] = useState(initialContactImageAlt || "")
  const [showContactImage, setShowContactImage] = useState(initialShowContactImage)
  const [contactImagePosition, setContactImagePosition] = useState(resolveFocalPosition(initialContactImagePosition))
  const [locations, setLocations] = useState<LocationItem[]>(initialLocations)
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSaveImage = async () => {
    setIsSubmitting(true)
    try {
      const result = await updateContactSettings({
        profileId,
        contactImageUrl: contactImageUrl || null,
        contactImageAlt: contactImageAlt || null,
        showContactImage,
        contactImagePosition: contactImagePosition || null,
      })
      if (result.success) toast.success("Contact page updated")
      else toast.error(result.error || "Failed to update")
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveLocation = async (data: Partial<LocationItem>) => {
    try {
      if (editingLocation) {
        await updateFooterLocation(editingLocation.id, data)
        setLocations(locations.map((l) => l.id === editingLocation.id ? { ...l, ...data } : l))
        toast.success("Location updated")
      } else {
        const created = await createFooterLocation(data as { title: string })
        setLocations([...locations, created])
        toast.success("Location created")
      }
      setIsLocationDialogOpen(false)
      setEditingLocation(null)
    } catch {
      toast.error("Failed to save location")
    }
  }

  const handleDeleteLocation = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteFooterLocation(id)
      setLocations(locations.filter((l) => l.id !== id))
      toast.success("Location deleted")
    } catch {
      toast.error("Failed to delete")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleMoveLocation = async (id: string, direction: "up" | "down") => {
    const idx = locations.findIndex((l) => l.id === id)
    const targetIdx = direction === "up" ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= locations.length) return
    await moveFooterLocation(id, direction)
    const updated = [...locations]
    const temp = updated[idx]
    updated[idx] = updated[targetIdx]
    updated[targetIdx] = temp
    setLocations(updated)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contact Page</h1>
          <p className="text-muted-foreground text-sm">Manage the portrait and practice locations for the Contact page.</p>
        </div>
        {tab === "image" && (
          <Button onClick={handleSaveImage} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/30 pb-px">
        {([
          { key: "image" as Tab, label: "Contact Image", icon: <ImageIcon className="h-4 w-4" /> },
          { key: "locations" as Tab, label: `Practice Locations (${locations.length})`, icon: <MapPin className="h-4 w-4" /> },
        ]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
              tab === t.key ? "bg-surface border border-border/30 border-b-transparent -mb-px text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Image Tab */}
      {tab === "image" && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Page Image</CardTitle>
            <CardDescription>Compact identity portrait shown at the top of the Contact page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Image</Label>
                <p className="text-xs text-muted-foreground">Display the portrait on the Contact page.</p>
              </div>
              <Switch checked={showContactImage} onCheckedChange={setShowContactImage} />
            </div>

            <MediaPicker value={contactImageUrl} onChange={(url) => setContactImageUrl(url)} label="Contact Page Portrait" purpose="CONTACT_PAGE" />

            {contactImageUrl && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Alt Text</Label>
                  <Input value={contactImageAlt} onChange={(e) => setContactImageAlt(e.target.value)} placeholder="Describe the image for accessibility" className="text-sm" />
                </div>
                <div className="flex flex-wrap items-start gap-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 rounded-lg border bg-surface/50 p-2">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image src={contactImageUrl} alt="" fill sizes="80px" className="object-cover" style={{ objectPosition: contactImagePosition }} />
                      </div>
                      <div className="min-w-0 max-w-[150px]">
                        <p className="truncate text-xs font-semibold">{displayName}</p>
                        <p className="truncate text-[11px] text-primary">{professionalTitle}</p>
                        {location && <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="size-2.5 shrink-0" /><span className="truncate">{location}</span></p>}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Contact page preview</p>
                  </div>
                  <FocalPointPicker value={contactImagePosition} onChange={setContactImagePosition} label="Contact portrait focal point" />
                </div>
                <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setContactImageUrl(""); setContactImageAlt("") }}>
                  <Trash2 className="h-4 w-4 mr-1" />Remove Image
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Locations Tab */}
      {tab === "locations" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Practice Locations</CardTitle>
              <CardDescription>Manage practice locations shown on the Contact page, Homepage, and Footer.</CardDescription>
            </div>
            <Button size="sm" onClick={() => { setEditingLocation(null); setIsLocationDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-1" /> Add Location
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {locations.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No practice locations yet. Add your first location.</p>
            )}
            {locations.map((loc, idx) => (
              <div key={loc.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === 0} onClick={() => handleMoveLocation(loc.id, "up")}><ChevronUp className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === locations.length - 1} onClick={() => handleMoveLocation(loc.id, "down")}><ChevronDown className="h-3 w-3" /></Button>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{loc.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{loc.hospitalName || loc.address || "No details"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {loc.isPrimary && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Primary</span>}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${loc.isVisible ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>{loc.isVisible ? "Visible" : "Hidden"}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingLocation(loc); setIsLocationDialogOpen(true) }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(loc.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Location Dialog */}
      {isLocationDialogOpen && (
        <LocationDialog
          location={editingLocation}
          onSave={handleSaveLocation}
          onClose={() => { setIsLocationDialogOpen(false); setEditingLocation(null) }}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Location"
        description="Are you sure you want to delete this practice location?"
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) handleDeleteLocation(deleteTarget) }}
      />
    </div>
  )
}

function LocationDialog({ location, onSave, onClose }: { location: LocationItem | null; onSave: (data: Partial<LocationItem>) => void; onClose: () => void }) {
  const [title, setTitle] = useState(location?.title || "")
  const [hospitalName, setHospitalName] = useState(location?.hospitalName || "")
  const [address, setAddress] = useState(location?.address || "")
  const [visitingDays, setVisitingDays] = useState(location?.visitingDays || "")
  const [visitingHours, setVisitingHours] = useState(location?.visitingHours || "")
  const [appointmentPhone, setAppointmentPhone] = useState(location?.appointmentPhone || "")
  const [mapsUrl, setMapsUrl] = useState(location?.mapsUrl || "")
  const [ctaLabel, setCtaLabel] = useState(location?.ctaLabel || "")
  const [isPrimary, setIsPrimary] = useState(location?.isPrimary ?? false)
  const [isVisible, setIsVisible] = useState(location?.isVisible ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ title, hospitalName: hospitalName || null, address: address || null, visitingDays: visitingDays || null, visitingHours: visitingHours || null, appointmentPhone: appointmentPhone || null, mapsUrl: mapsUrl || null, ctaLabel: ctaLabel || null, isPrimary, isVisible })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">{location ? "Edit Location" : "Add Location"}</h3>
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Main Clinic" />
          </div>
          <div className="space-y-2">
            <Label>Hospital Name</Label>
            <Input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="e.g. City Hospital" />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Visiting Days</Label>
              <Input value={visitingDays} onChange={(e) => setVisitingDays(e.target.value)} placeholder="e.g. Sun-Thu" />
            </div>
            <div className="space-y-2">
              <Label>Visiting Hours</Label>
              <Input value={visitingHours} onChange={(e) => setVisitingHours(e.target.value)} placeholder="e.g. 10AM - 6PM" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Appointment Phone</Label>
            <Input value={appointmentPhone} onChange={(e) => setAppointmentPhone(e.target.value)} placeholder="+880 ..." />
          </div>
          <div className="space-y-2">
            <Label>Google Maps URL</Label>
            <Input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
          <div className="space-y-2">
            <Label>CTA Label</Label>
            <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="e.g. Book Appointment" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} className="rounded" /> Primary Location</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="rounded" /> Visible</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{location ? "Update" : "Create"} Location</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
