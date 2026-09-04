"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import {
  Plus, Trash2, ChevronUp, ChevronDown, GripVertical,
  User, Link as LinkIcon, Stethoscope, MapPin, Share2, Settings,
} from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { IconPicker, IconPreview } from "@/components/admin/icon-picker"
import {
  getFooterTreatments, createFooterTreatment, updateFooterTreatment, deleteFooterTreatment, moveFooterTreatment,
  getFooterLocations, createFooterLocation, updateFooterLocation, deleteFooterLocation, moveFooterLocation,
  getFooterSettings, updateFooterSettings,
  getSocialLinksAdmin, createSocialLinkAdmin, updateSocialLinkAdmin, deleteSocialLinkAdmin, moveSocialLinkAdmin,
  getNavigationItems,
} from "../settings/actions"

/* ─── Types ─── */

interface Treatment { id: string; name: string; url: string | null; sortOrder: number; isVisible: boolean }
interface Location { id: string; title: string; hospitalName: string | null; address: string | null; visitingDays: string | null; visitingHours: string | null; appointmentPhone: string | null; mapsUrl: string | null; mapsEmbedUrl: string | null; icon: string | null; ctaLabel: string | null; isPrimary: boolean; sortOrder: number; isVisible: boolean }
interface FooterSettings { id: string; profileEnabled: boolean; profileImage: string | null; profileName: string | null; profileTitle: string | null; profileBio: string | null; useMainProfile: boolean; navigationEnabled: boolean; treatmentsEnabled: boolean; locationsEnabled: boolean; socialLinksEnabled: boolean; copyrightText: string | null; brandText: string; chamberSectionEyebrow: string | null; chamberSectionHeading: string | null; chamberSectionSupport: string | null }
interface SocialLink { id: string; platform: string; label: string; url: string; icon: string | null; iconKey: string | null; hoverColor: string | null; isVisible: boolean; sortOrder: number }
interface NavItem { id: string; label: string; destination: string; isVisible: boolean; sortOrder: number }
interface Profile { fullName?: string; displayName?: string; profileImage?: string | null; professionalTitle?: string; shortBio?: string | null }
interface BrandSettings { siteName?: string }

type Tab = "profile" | "navigation" | "treatments" | "locations" | "social" | "settings"

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  { key: "navigation", label: "Navigation", icon: <LinkIcon className="h-4 w-4" /> },
  { key: "treatments", label: "Treatments", icon: <Stethoscope className="h-4 w-4" /> },
  { key: "locations", label: "Locations", icon: <MapPin className="h-4 w-4" /> },
  { key: "social", label: "Social Links", icon: <Share2 className="h-4 w-4" /> },
  { key: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
]

/* ─── Component ─── */

export function FooterAdmin({
  initialTreatments, initialLocations, initialSettings, initialSocialLinks, profile, brandSettings,
}: {
  initialTreatments: Treatment[]; initialLocations: Location[]; initialSettings: FooterSettings | null;
  initialSocialLinks: SocialLink[]; profile: Profile | null; brandSettings: BrandSettings | null;
}) {
  const [tab, setTab] = useState<Tab>("profile")
  const [settings, setSettings] = useState<FooterSettings>(initialSettings ?? {
    id: "", profileEnabled: true, profileImage: null, profileName: null, profileTitle: null, profileBio: null,
    useMainProfile: true, navigationEnabled: true, treatmentsEnabled: true, locationsEnabled: true,
    socialLinksEnabled: true, copyrightText: null, brandText: "Aptic", chamberSectionEyebrow: null, chamberSectionHeading: null, chamberSectionSupport: null,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Footer Management</h1>
        <p className="text-sm text-muted-foreground">Manage all footer content from here.</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-border/30 pb-px">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
              tab === t.key ? "bg-surface border border-border/30 border-b-transparent -mb-px text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "profile" && <ProfileTab settings={settings} setSettings={setSettings} profile={profile} />}
      {tab === "navigation" && <NavigationTab />}
      {tab === "treatments" && <TreatmentsTab items={initialTreatments} />}
      {tab === "locations" && <LocationsTab items={initialLocations} />}
      {tab === "social" && <SocialTab items={initialSocialLinks} />}
      {tab === "settings" && <SettingsTab settings={settings} setSettings={setSettings} brandName={brandSettings?.siteName} />}
    </div>
  )
}

/* ─── Profile Tab ─── */

function ProfileTab({ settings, setSettings, profile }: { settings: FooterSettings; setSettings: (s: FooterSettings) => void; profile: Profile | null }) {
  const [saving, setSaving] = useState(false)

  const save = async (patch: Partial<FooterSettings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    setSaving(true)
    try {
      await updateFooterSettings(patch)
      toast.success("Saved")
    } catch { toast.error("Failed to save") }
    setSaving(false)
  }

  const pName = settings.useMainProfile ? (profile?.displayName || profile?.fullName || "") : (settings.profileName || "")
  const pTitle = settings.useMainProfile ? (profile?.professionalTitle || "") : (settings.profileTitle || "")
  const pBio = settings.useMainProfile ? (profile?.shortBio || "") : (settings.profileBio || "")
  const pImage = settings.useMainProfile ? (profile?.profileImage || null) : settings.profileImage

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={settings.profileEnabled}
            onChange={(e) => save({ profileEnabled: e.target.checked })} className="rounded" />
          Show profile section in footer
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={settings.useMainProfile}
            onChange={(e) => save({ useMainProfile: e.target.checked })} className="rounded" />
          Use main profile information
        </label>

        {!settings.useMainProfile && (
          <>
            <div><Label>Footer Image</Label>
              <MediaPicker value={pImage || ""} onChange={(url) => save({ profileImage: url })} label="Profile Image" purpose="PROFILE" filterPurpose="PROFILE" />
            </div>
            <div><Label>Name</Label><Input value={settings.profileName || ""} onChange={(e) => setSettings({ ...settings, profileName: e.target.value })} onBlur={() => save({ profileName: settings.profileName })} /></div>
            <div><Label>Title</Label><Input value={settings.profileTitle || ""} onChange={(e) => setSettings({ ...settings, profileTitle: e.target.value })} onBlur={() => save({ profileTitle: settings.profileTitle })} /></div>
            <div><Label>Bio</Label><Input value={settings.profileBio || ""} onChange={(e) => setSettings({ ...settings, profileBio: e.target.value })} onBlur={() => save({ profileBio: settings.profileBio })} /></div>
          </>
        )}

        {settings.useMainProfile && (
          <div className="rounded-md bg-muted/30 border border-border/30 p-3 text-sm text-muted-foreground space-y-1">
            <p><strong>Name:</strong> {pName || "—"}</p>
            <p><strong>Title:</strong> {pTitle || "—"}</p>
            <p><strong>Bio:</strong> {pBio ? (pBio.length > 100 ? pBio.slice(0, 100) + "…" : pBio) : "—"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Navigation Tab ─── */

function NavigationTab() {
  const [items, setItems] = useState<NavItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    if (loaded) return
    try {
      const data = await getNavigationItems()
      setItems(data.map((n: { id: string; label: string; destination: string; isVisible: boolean; sortOrder: number }) => ({ id: n.id, label: n.label, destination: n.destination, isVisible: n.isVisible, sortOrder: n.sortOrder })))
      setLoaded(true)
    } catch { toast.error("Failed to load") }
  }

  React.useEffect(() => { load() }, [])

  const handleUpdate = async (id: string, data: Partial<NavItem>) => {
    setItems(items.map((i) => i.id === id ? { ...i, ...data } : i))
    try {
      const { updateNavigationItem } = await import("../settings/actions")
      await updateNavigationItem(id, data)
    } catch { toast.error("Failed to update") }
  }

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <p className="text-sm text-muted-foreground">These links appear in the footer navigation column. Edit visibility and order below.</p>
        <div className="space-y-2">
          {sorted.map((item, idx) => (
            <div key={item.id} className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border ${item.isVisible ? "bg-surface/50 border-border/50" : "bg-muted/30 border-border/30 opacity-60"}`}>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                  const sorted2 = [...items].sort((a, b) => a.sortOrder - b.sortOrder)
                  const i = sorted2.findIndex((x) => x.id === item.id)
                  if (i > 0) { const t = item.sortOrder; handleUpdate(item.id, { sortOrder: sorted2[i - 1].sortOrder }); handleUpdate(sorted2[i - 1].id, { sortOrder: t }) }
                }} disabled={idx === 0}><ChevronUp className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                  const sorted2 = [...items].sort((a, b) => a.sortOrder - b.sortOrder)
                  const i = sorted2.findIndex((x) => x.id === item.id)
                  if (i < sorted2.length - 1) { const t = item.sortOrder; handleUpdate(item.id, { sortOrder: sorted2[i + 1].sortOrder }); handleUpdate(sorted2[i + 1].id, { sortOrder: t }) }
                }} disabled={idx === sorted.length - 1}><ChevronDown className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
                <Input value={item.label} onChange={(e) => handleUpdate(item.id, { label: e.target.value })} className="h-8 text-sm max-w-[160px]" />
                <Input value={item.destination} onChange={(e) => handleUpdate(item.id, { destination: e.target.value })} className="h-8 text-sm font-mono max-w-[200px]" />
              </div>
              <button onClick={() => handleUpdate(item.id, { isVisible: !item.isVisible })} className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${item.isVisible ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>{item.isVisible ? "ON" : "OFF"}</button>
            </div>
          ))}
          {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No navigation items found.</p>}
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Treatments Tab ─── */

function TreatmentsTab({ items: initial }: { items: Treatment[] }) {
  const [items, setItems] = useState<Treatment[]>(initial)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newName) { toast.error("Name required"); return }
    setSaving(true)
    try {
      const created = await createFooterTreatment({ name: newName, url: newUrl || undefined })
      setItems([...items, created])
      setNewName(""); setNewUrl(""); setShowNew(false)
      toast.success("Treatment added")
    } catch { toast.error("Failed to create") }
    setSaving(false)
  }

  const handleUpdate = async (id: string, data: Partial<Treatment>) => {
    setItems(items.map((i) => i.id === id ? { ...i, ...data } : i))
    try { await updateFooterTreatment(id, data) } catch { toast.error("Failed to update") }
  }

  const handleDelete = async (id: string) => {
    try { await deleteFooterTreatment(id); setItems(items.filter((i) => i.id !== id)); toast.success("Deleted") }
    catch { toast.error("Failed to delete") }
    setDeleteTarget(null)
  }

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage treatments/services shown in the footer.</p>
        <Button onClick={() => setShowNew(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      {showNew && (
        <Card><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Diabetes Management" /></div>
            <div><Label>URL (optional)</Label><Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="/services/diabetes" /></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={saving}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </CardContent></Card>
      )}

      <div className="space-y-2">
        {sorted.map((item, idx) => (
          <div key={item.id} className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border ${item.isVisible ? "bg-surface/50 border-border/50" : "bg-muted/30 border-border/30 opacity-60"}`}>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                const i = sorted.findIndex((x) => x.id === item.id)
                if (i > 0) { const t = item.sortOrder; handleUpdate(item.id, { sortOrder: sorted[i - 1].sortOrder }); handleUpdate(sorted[i - 1].id, { sortOrder: t }) }
              }} disabled={idx === 0}><ChevronUp className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                const i = sorted.findIndex((x) => x.id === item.id)
                if (i < sorted.length - 1) { const t = item.sortOrder; handleUpdate(item.id, { sortOrder: sorted[i + 1].sortOrder }); handleUpdate(sorted[i + 1].id, { sortOrder: t }) }
              }} disabled={idx === sorted.length - 1}><ChevronDown className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
              <Input value={item.name} onChange={(e) => handleUpdate(item.id, { name: e.target.value })} className="h-8 text-sm max-w-[200px]" />
              <Input value={item.url || ""} onChange={(e) => handleUpdate(item.id, { url: e.target.value || null })} className="h-8 text-sm font-mono max-w-[200px]" placeholder="/services/..." />
            </div>
            <button onClick={() => handleUpdate(item.id, { isVisible: !item.isVisible })} className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${item.isVisible ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>{item.isVisible ? "ON" : "OFF"}</button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleteTarget(item.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No treatments yet.</p>}
      </div>

      <ConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }} title="Delete Treatment" description="Remove this treatment from the footer?" confirmLabel="Delete" variant="destructive" onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget) }} />
    </div>
  )
}

/* ─── Locations Tab ─── */

function LocationsTab({ items: initial }: { items: Location[] }) {
  const [items, setItems] = useState<Location[]>(initial)
  const [showNew, setShowNew] = useState(false)
  const [newItem, setNewItem] = useState({ title: "", hospitalName: "", address: "", visitingDays: "", visitingHours: "", appointmentPhone: "", mapsUrl: "", mapsEmbedUrl: "", ctaLabel: "" })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newItem.title) { toast.error("Title required"); return }
    setSaving(true)
    try {
      const created = await createFooterLocation(newItem)
      setItems([...items, created])
      setNewItem({ title: "", hospitalName: "", address: "", visitingDays: "", visitingHours: "", appointmentPhone: "", mapsUrl: "", mapsEmbedUrl: "", ctaLabel: "" })
      setShowNew(false)
      toast.success("Location added")
    } catch { toast.error("Failed to create") }
    setSaving(false)
  }

  const handleUpdate = async (id: string, data: Partial<Location>) => {
    setItems(items.map((i) => i.id === id ? { ...i, ...data } : i))
    try { await updateFooterLocation(id, data) } catch { toast.error("Failed to update") }
  }

  const handleDelete = async (id: string) => {
    try { await deleteFooterLocation(id); setItems(items.filter((i) => i.id !== id)); toast.success("Deleted") }
    catch { toast.error("Failed to delete") }
    setDeleteTarget(null)
  }

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage practice locations / chambers. Used on Contact page, Homepage, and Footer.</p>
        <Button onClick={() => setShowNew(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Location</Button>
      </div>

      {showNew && (
        <Card><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Location Title</Label><Input value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} placeholder="e.g. DHANMONDI" /></div>
            <div><Label>Hospital / Clinic</Label><Input value={newItem.hospitalName} onChange={(e) => setNewItem({ ...newItem, hospitalName: e.target.value })} placeholder="Hospital name" /></div>
          </div>
          <div><Label>Address</Label><Input value={newItem.address} onChange={(e) => setNewItem({ ...newItem, address: e.target.value })} placeholder="Full address" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Visiting Days</Label><Input value={newItem.visitingDays} onChange={(e) => setNewItem({ ...newItem, visitingDays: e.target.value })} placeholder="e.g. Sat - Tue" /></div>
            <div><Label>Visiting Hours</Label><Input value={newItem.visitingHours} onChange={(e) => setNewItem({ ...newItem, visitingHours: e.target.value })} placeholder="e.g. 10AM - 2PM" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Appointment Phone</Label><Input value={newItem.appointmentPhone} onChange={(e) => setNewItem({ ...newItem, appointmentPhone: e.target.value })} placeholder="+880..." /></div>
            <div><Label>Google Maps URL</Label><Input value={newItem.mapsUrl} onChange={(e) => setNewItem({ ...newItem, mapsUrl: e.target.value })} placeholder="https://maps..." /></div>
          </div>
          <div><Label>Maps Embed URL (optional, auto-generated if empty)</Label><Input value={newItem.mapsEmbedUrl} onChange={(e) => setNewItem({ ...newItem, mapsEmbedUrl: e.target.value })} placeholder="https://www.google.com/maps/embed?..." /></div>
          <div><Label>CTA Label (optional)</Label><Input value={newItem.ctaLabel} onChange={(e) => setNewItem({ ...newItem, ctaLabel: e.target.value })} placeholder="e.g. View on Map, Get Directions" /></div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={saving}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </CardContent></Card>
      )}

      <div className="space-y-3">
        {sorted.map((item, idx) => (
          <Card key={item.id}>
            <CardContent className={`pt-4 pb-4 space-y-3 ${!item.isVisible ? "opacity-60" : ""}`}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => {
                    const i = sorted.findIndex((x) => x.id === item.id)
                    if (i > 0) { const t = item.sortOrder; handleUpdate(item.id, { sortOrder: sorted[i - 1].sortOrder }); handleUpdate(sorted[i - 1].id, { sortOrder: t }) }
                  }} disabled={idx === 0}><ChevronUp className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => {
                    const i = sorted.findIndex((x) => x.id === item.id)
                    if (i < sorted.length - 1) { const t = item.sortOrder; handleUpdate(item.id, { sortOrder: sorted[i + 1].sortOrder }); handleUpdate(sorted[i + 1].id, { sortOrder: t }) }
                  }} disabled={idx === sorted.length - 1}><ChevronDown className="h-3 w-3" /></Button>
                </div>
                <Input value={item.title} onChange={(e) => handleUpdate(item.id, { title: e.target.value })} className="h-8 text-sm font-bold max-w-[200px]" />
                <button onClick={() => handleUpdate(item.id, { isPrimary: !item.isPrimary })} className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${item.isPrimary ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>{item.isPrimary ? "PRIMARY" : "secondary"}</button>
                <button onClick={() => handleUpdate(item.id, { isVisible: !item.isVisible })} className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${item.isVisible ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>{item.isVisible ? "ON" : "OFF"}</button>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setEditingId(editingId === item.id ? null : item.id)}>{editingId === item.id ? "Collapse" : "Edit"}</Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleteTarget(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              {editingId === item.id && (
                <div className="grid grid-cols-2 gap-3 pl-8">
                  <div><Label>Hospital / Clinic</Label><Input value={item.hospitalName || ""} onChange={(e) => handleUpdate(item.id, { hospitalName: e.target.value || null })} /></div>
                  <div><Label>Address</Label><Input value={item.address || ""} onChange={(e) => handleUpdate(item.id, { address: e.target.value || null })} /></div>
                  <div><Label>Visiting Days</Label><Input value={item.visitingDays || ""} onChange={(e) => handleUpdate(item.id, { visitingDays: e.target.value || null })} /></div>
                  <div><Label>Visiting Hours</Label><Input value={item.visitingHours || ""} onChange={(e) => handleUpdate(item.id, { visitingHours: e.target.value || null })} /></div>
                  <div><Label>Appointment Phone</Label><Input value={item.appointmentPhone || ""} onChange={(e) => handleUpdate(item.id, { appointmentPhone: e.target.value || null })} /></div>
                  <div><Label>Google Maps URL</Label><Input value={item.mapsUrl || ""} onChange={(e) => handleUpdate(item.id, { mapsUrl: e.target.value || null })} /></div>
                  <div><Label>Maps Embed URL (optional)</Label><Input value={item.mapsEmbedUrl || ""} onChange={(e) => handleUpdate(item.id, { mapsEmbedUrl: e.target.value || null })} placeholder="Auto-generated from Maps URL if empty" /></div>
                  <div><Label>CTA Label</Label><Input value={item.ctaLabel || ""} onChange={(e) => handleUpdate(item.id, { ctaLabel: e.target.value || null })} placeholder="e.g. View on Map, Get Directions" /></div>
                </div>
              )}
              {editingId !== item.id && (
                <div className="pl-8 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                  {item.hospitalName && <span>{item.hospitalName}</span>}
                  {item.address && <span>{item.address}</span>}
                  {item.visitingDays && <span>{item.visitingDays}</span>}
                  {item.visitingHours && <span>{item.visitingHours}</span>}
                  {item.appointmentPhone && <span>{item.appointmentPhone}</span>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No locations yet.</p>}
      </div>

      <ConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }} title="Delete Location" description="Remove this location from the footer?" confirmLabel="Delete" variant="destructive" onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget) }} />
    </div>
  )
}

/* ─── Social Links Tab ─── */

function SocialTab({ items: initial }: { items: SocialLink[] }) {
  const [items, setItems] = useState<SocialLink[]>(initial)
  const [showNew, setShowNew] = useState(false)
  const [newPlatform, setNewPlatform] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newIconKey, setNewIconKey] = useState<string | null>(null)
  const [newHoverColor, setNewHoverColor] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newPlatform || !newUrl) { toast.error("Platform and URL required"); return }
    setSaving(true)
    try {
      const created = await createSocialLinkAdmin({
        platform: newPlatform,
        label: newPlatform,
        url: newUrl,
        iconKey: newIconKey || undefined,
        hoverColor: newHoverColor || undefined,
      })
      setItems([...items, created])
      setNewPlatform(""); setNewUrl(""); setNewIconKey(null); setNewHoverColor(""); setShowNew(false)
      toast.success("Social link added")
    } catch (err) {
      console.error("Failed to create social link:", err)
      toast.error("Failed to create social link")
    }
    setSaving(false)
  }

  const handleUpdate = async (id: string, data: Partial<SocialLink>) => {
    setItems(items.map((i) => i.id === id ? { ...i, ...data } : i))
    try { await updateSocialLinkAdmin(id, data) } catch { toast.error("Failed to update") }
  }

  const handleDelete = async (id: string) => {
    try { await deleteSocialLinkAdmin(id); setItems(items.filter((i) => i.id !== id)); toast.success("Deleted") }
    catch { toast.error("Failed to delete") }
    setDeleteTarget(null)
  }

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage social media links shown in the footer.</p>
        <Button onClick={() => setShowNew(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      {showNew && (
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Platform</Label>
              <select
                value={newPlatform}
                onChange={(e) => {
                  const p = e.target.value
                  setNewPlatform(p)
                  if (p && !newIconKey) {
                    const key = p.toLowerCase().replace(/\s+/g, "").replace("x/twitter", "twitter")
                    setNewIconKey(key)
                  }
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select platform...</option>
                {["LinkedIn", "Facebook", "Instagram", "YouTube", "X / Twitter", "ResearchGate", "ORCID", "GitHub", "Email", "WhatsApp", "Website", "Other"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div><Label>URL</Label><Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." /></div>
          </div>
          <IconPicker selected={newIconKey} onSelect={setNewIconKey} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Hover Color (optional)</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={newHoverColor || "#0A66C2"}
                  onChange={(e) => setNewHoverColor(e.target.value)}
                  className="h-9 w-9 rounded border border-input cursor-pointer"
                />
                <Input
                  value={newHoverColor}
                  onChange={(e) => setNewHoverColor(e.target.value)}
                  placeholder="Default from icon"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex items-end">
              {newIconKey && <IconPreview iconKey={newIconKey} hoverColor={newHoverColor || undefined} />}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleCreate} disabled={saving} className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium px-2.5 h-7 hover:bg-primary/80 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => { setShowNew(false); setNewPlatform(""); setNewUrl(""); setNewIconKey(null); setNewHoverColor("") }} className="inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium px-2.5 h-7 hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((item, idx) => (
          <div key={item.id} className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border ${item.isVisible ? "bg-surface/50 border-border/50" : "bg-muted/30 border-border/30 opacity-60"}`}>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                const i = sorted.findIndex((x) => x.id === item.id)
                if (i > 0) { const t = item.sortOrder; handleUpdate(item.id, { sortOrder: sorted[i - 1].sortOrder }); handleUpdate(sorted[i - 1].id, { sortOrder: t }) }
              }} disabled={idx === 0}><ChevronUp className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                const i = sorted.findIndex((x) => x.id === item.id)
                if (i < sorted.length - 1) { const t = item.sortOrder; handleUpdate(item.id, { sortOrder: sorted[i + 1].sortOrder }); handleUpdate(sorted[i + 1].id, { sortOrder: t }) }
              }} disabled={idx === sorted.length - 1}><ChevronDown className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
              {editingId === item.id ? (
                <div className="w-full space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={item.platform} onChange={(e) => handleUpdate(item.id, { platform: e.target.value })} className="h-8 text-sm" placeholder="Platform" />
                    <Input value={item.url} onChange={(e) => handleUpdate(item.id, { url: e.target.value })} className="h-8 text-sm font-mono" placeholder="URL" />
                  </div>
                  <IconPicker selected={item.iconKey || null} onSelect={(k) => handleUpdate(item.id, { iconKey: k })} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Hover Color</Label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={item.hoverColor || "#0A66C2"} onChange={(e) => handleUpdate(item.id, { hoverColor: e.target.value })} className="h-8 w-8 rounded border border-input cursor-pointer" />
                        <Input value={item.hoverColor || ""} onChange={(e) => handleUpdate(item.id, { hoverColor: e.target.value || null })} placeholder="Default" className="h-8 text-sm" />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <IconPreview iconKey={item.iconKey} hoverColor={item.hoverColor} />
                    </div>
                  </div>
                  <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium px-2.5 h-7 hover:bg-muted w-fit">Done</button>
                </div>
              ) : (
                <>
                  <IconPreview iconKey={item.iconKey} hoverColor={item.hoverColor} />
                  <Input value={item.platform} onChange={(e) => handleUpdate(item.id, { platform: e.target.value })} className="h-8 text-sm max-w-[120px]" />
                  <Input value={item.url} onChange={(e) => handleUpdate(item.id, { url: e.target.value })} className="h-8 text-sm font-mono max-w-[300px]" />
                  <button type="button" onClick={() => setEditingId(item.id)} className="inline-flex items-center justify-center rounded-lg hover:bg-muted text-xs font-medium px-2 h-8 text-muted-foreground hover:text-foreground">Edit</button>
                </>
              )}
            </div>
            <button onClick={() => handleUpdate(item.id, { isVisible: !item.isVisible })} className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${item.isVisible ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>{item.isVisible ? "ON" : "OFF"}</button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleteTarget(item.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No social links yet.</p>}
      </div>

      <ConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }} title="Delete Social Link" description="Remove this social link from the footer?" confirmLabel="Delete" variant="destructive" onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget) }} />
    </div>
  )
}

/* ─── Settings Tab ─── */

function SettingsTab({ settings, setSettings, brandName }: { settings: FooterSettings; setSettings: (s: FooterSettings) => void; brandName?: string }) {
  const [saving, setSaving] = useState(false)

  const save = async (patch: Partial<FooterSettings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    setSaving(true)
    try {
      await updateFooterSettings(patch)
      toast.success("Settings saved")
    } catch { toast.error("Failed to save") }
    setSaving(false)
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-sm font-semibold">Section Visibility</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {([
            ["profileEnabled", "Profile Section"],
            ["navigationEnabled", "Navigation Section"],
            ["treatmentsEnabled", "Treatments Section"],
            ["locationsEnabled", "Locations Section"],
            ["socialLinksEnabled", "Social Links Section"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings[key]} onChange={(e) => save({ [key]: e.target.checked })} className="rounded" />
              {label}
            </label>
          ))}
        </div>

        <hr className="border-border/30" />
        <h3 className="text-sm font-semibold">Chamber Section Heading</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label>Eyebrow</Label><Input value={settings.chamberSectionEyebrow || ""} onChange={(e) => setSettings({ ...settings, chamberSectionEyebrow: e.target.value || null })} onBlur={() => save({ chamberSectionEyebrow: settings.chamberSectionEyebrow })} placeholder="e.g. Locations" /></div>
          <div><Label>Heading</Label><Input value={settings.chamberSectionHeading || ""} onChange={(e) => setSettings({ ...settings, chamberSectionHeading: e.target.value || null })} onBlur={() => save({ chamberSectionHeading: settings.chamberSectionHeading })} placeholder="e.g. Chambers & Appointments" /></div>
        </div>
        <div><Label>Supporting Text</Label><Input value={settings.chamberSectionSupport || ""} onChange={(e) => setSettings({ ...settings, chamberSectionSupport: e.target.value || null })} onBlur={() => save({ chamberSectionSupport: settings.chamberSectionSupport })} placeholder="Optional supporting text below heading" /></div>

        <hr className="border-border/30" />
        <h3 className="text-sm font-semibold">Footer Branding</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label>Copyright Text</Label><Input value={settings.copyrightText || ""} onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value || null })} onBlur={() => save({ copyrightText: settings.copyrightText })} placeholder={`© ${new Date().getFullYear()} ${brandName || "Aptic"}. All rights reserved.`} /></div>
          <div><Label>Brand Text</Label><Input value={settings.brandText} onChange={(e) => setSettings({ ...settings, brandText: e.target.value })} onBlur={() => save({ brandText: settings.brandText })} placeholder="Aptic" /></div>
        </div>
      </CardContent>
    </Card>
  )
}
