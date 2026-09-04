"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical, ExternalLink, Monitor, Smartphone } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { createNavigationItem, updateNavigationItem, deleteNavigationItem, moveNavigationItem } from "../settings/actions"

interface NavItem {
  id: string
  label: string
  destination: string
  isVisible: boolean
  isExternal: boolean
  icon: string | null
  desktopVisible: boolean
  mobileVisible: boolean
  sortOrder: number
}

export function NavigationAdmin({ initialItems }: { initialItems: NavItem[] }) {
  const [items, setItems] = useState<NavItem[]>(initialItems)
  const [showNew, setShowNew] = useState(false)
  const [newItem, setNewItem] = useState({ label: "", destination: "/", isVisible: true, isExternal: false, desktopVisible: true, mobileVisible: true })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreate = async () => {
    if (!newItem.label || !newItem.destination) { toast.error("Label and destination required"); return }
    setSaving(true)
    try {
      const created = await createNavigationItem(newItem)
      setItems([...items, created])
      setNewItem({ label: "", destination: "/", isVisible: true, isExternal: false, desktopVisible: true, mobileVisible: true })
      setShowNew(false)
      toast.success("Navigation item created")
    } catch { toast.error("Failed to create") }
    setSaving(false)
  }

  const handleUpdate = async (id: string, data: Partial<NavItem>) => {
    try {
      await updateNavigationItem(id, data)
      setItems(items.map((i) => i.id === id ? { ...i, ...data } : i))
    } catch { toast.error("Failed to update") }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteNavigationItem(id)
      setItems(items.filter((i) => i.id !== id))
      toast.success("Deleted")
    } catch { toast.error("Failed to delete") }
    finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleMove = async (id: string, direction: "up" | "down") => {
    try {
      await moveNavigationItem(id, direction)
      const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)
      const idx = sorted.findIndex((i) => i.id === id)
      const targetIdx = direction === "up" ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= sorted.length) return
      // Swap locally
      const temp = sorted[idx].sortOrder
      sorted[idx] = { ...sorted[idx], sortOrder: sorted[targetIdx].sortOrder }
      sorted[targetIdx] = { ...sorted[targetIdx], sortOrder: temp }
      setItems(sorted)
    } catch { toast.error("Failed to move") }
  }

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Navigation</h1>
          <p className="text-sm text-muted-foreground">Manage public navigation items. Labels appear on desktop, mobile, and footer.</p>
        </div>
        <Button onClick={() => setShowNew(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
      </div>

      {showNew && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Label</Label><Input value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} placeholder="e.g. About Me" /></div>
              <div><Label>Destination</Label><Input value={newItem.destination} onChange={(e) => setNewItem({ ...newItem, destination: e.target.value })} placeholder="/about" /></div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newItem.isVisible} onChange={(e) => setNewItem({ ...newItem, isVisible: e.target.checked })} className="rounded" /> Visible</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newItem.isExternal} onChange={(e) => setNewItem({ ...newItem, isExternal: e.target.checked })} className="rounded" /> External</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newItem.desktopVisible} onChange={(e) => setNewItem({ ...newItem, desktopVisible: e.target.checked })} className="rounded" /> Desktop</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newItem.mobileVisible} onChange={(e) => setNewItem({ ...newItem, mobileVisible: e.target.checked })} className="rounded" /> Mobile</label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={saving}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {sorted.map((item, idx) => (
          <div key={item.id} className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border ${item.isVisible ? "bg-surface/50 border-border/50" : "bg-muted/30 border-border/30 opacity-60"}`}>
            <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleMove(item.id, "up")} disabled={idx === 0}><ChevronUp className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleMove(item.id, "down")} disabled={idx === sorted.length - 1}><ChevronDown className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Input value={item.label} onChange={(e) => handleUpdate(item.id, { label: e.target.value })} className="h-8 text-sm max-w-[160px] min-w-0" />
                <Input value={item.destination} onChange={(e) => handleUpdate(item.id, { destination: e.target.value })} className="h-8 text-sm font-mono max-w-[200px] min-w-0" />
                {item.isExternal && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleUpdate(item.id, { desktopVisible: !item.desktopVisible })} className={`p-1.5 rounded ${item.desktopVisible ? "text-primary" : "text-muted-foreground/40"}`} title="Desktop"><Monitor className="h-4 w-4" /></button>
              <button onClick={() => handleUpdate(item.id, { mobileVisible: !item.mobileVisible })} className={`p-1.5 rounded ${item.mobileVisible ? "text-primary" : "text-muted-foreground/40"}`} title="Mobile"><Smartphone className="h-4 w-4" /></button>
              <button onClick={() => handleUpdate(item.id, { isVisible: !item.isVisible })} className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${item.isVisible ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>{item.isVisible ? "ON" : "OFF"}</button>
              <button onClick={() => handleUpdate(item.id, { isExternal: !item.isExternal })} className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${item.isExternal ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-muted text-muted-foreground border-border"}`}>{item.isExternal ? "EXT" : "INT"}</button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleteTarget(item.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No navigation items. Create one to get started.</p>}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Navigation Item"
        description="Are you sure you want to delete this navigation item? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget) }}
      />
    </div>
  )
}
