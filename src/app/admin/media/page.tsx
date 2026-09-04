"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Trash2, Search, Pencil, Copy, ImageIcon, Loader2, RefreshCw, RotateCcw, AlertTriangle, XCircle, CheckSquare, Square } from "lucide-react"
import { toast } from "sonner"
import { MediaUploader } from "@/components/admin/media/media-uploader"

interface MediaAsset {
  id: string
  publicId: string
  secureUrl: string
  originalFilename?: string | null
  displayName?: string | null
  purpose?: string | null
  altText?: string | null
  width?: number | null
  height?: number | null
  format?: string | null
  folder?: string | null
  status?: string
  trashedAt?: string | null
  missingDetectedAt?: string | null
  createdAt: string
}

type TabView = "library" | "trash" | "missing"

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [trashedAssets, setTrashedAssets] = useState<MediaAsset[]>([])
  const [missingAssets, setMissingAssets] = useState<MediaAsset[]>([])
  const [activeTab, setActiveTab] = useState<TabView>("library")
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null)
  const [editAltText, setEditAltText] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkDialogAction, setBulkDialogAction] = useState<"trash" | "restore" | "permanent-delete" | "remove-missing">("trash")

  const getDisplayName = (asset: MediaAsset) => {
    return asset.displayName || asset.originalFilename || asset.altText || asset.publicId.split("/").pop() || "Untitled"
  }

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/media/assets")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setAssets(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load media assets")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchTrashed = useCallback(async () => {
    try {
      const res = await fetch("/api/media/trash")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setTrashedAssets(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load trashed assets")
    }
  }, [])

  const fetchMissing = useCallback(async () => {
    try {
      const res = await fetch("/api/media/assets?includeMissing=true")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      const all = Array.isArray(data) ? data : []
      setMissingAssets(all.filter((a: MediaAsset) => a.status === "MISSING"))
    } catch {
      toast.error("Failed to load missing assets")
    }
  }, [])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [assetsRes, trashRes] = await Promise.all([
          fetch("/api/media/assets"),
          fetch("/api/media/trash"),
        ])
        if (assetsRes.ok) {
          const data = await assetsRes.json()
          if (active) setAssets(Array.isArray(data) ? data : [])
        }
        if (trashRes.ok) {
          const data = await trashRes.json()
          if (active) setTrashedAssets(Array.isArray(data) ? data : [])
        }
      } catch {
        if (active) toast.error("Failed to load media assets")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const handleUploadSuccess = (newAsset?: MediaAsset) => {
    if (newAsset) {
      setAssets((prev) => {
        if (prev.some((a) => a.id === newAsset.id)) return prev
        return [newAsset as MediaAsset, ...prev]
      })
    }
    fetchAssets()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("URL copied to clipboard")
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredAssets = assets.filter(
    (a) =>
      a.altText?.toLowerCase().includes(search.toLowerCase()) ||
      a.publicId.toLowerCase().includes(search.toLowerCase()) ||
      a.folder?.toLowerCase().includes(search.toLowerCase()) ||
      a.originalFilename?.toLowerCase().includes(search.toLowerCase()) ||
      a.displayName?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredTrashed = trashedAssets.filter(
    (a) =>
      a.altText?.toLowerCase().includes(search.toLowerCase()) ||
      a.publicId.toLowerCase().includes(search.toLowerCase()) ||
      a.displayName?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredMissing = missingAssets.filter(
    (a) =>
      a.altText?.toLowerCase().includes(search.toLowerCase()) ||
      a.publicId.toLowerCase().includes(search.toLowerCase()) ||
      a.displayName?.toLowerCase().includes(search.toLowerCase())
  )

  const getCurrentList = (): MediaAsset[] => {
    if (activeTab === "library") return filteredAssets
    if (activeTab === "trash") return filteredTrashed
    return filteredMissing
  }

  const selectAll = () => {
    const list = getCurrentList()
    setSelectedIds(new Set(list.map((a) => a.id)))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const allSelected = getCurrentList().length > 0 && getCurrentList().every((a) => selectedIds.has(a.id))

  const handleSelectAllToggle = () => {
    if (allSelected) {
      clearSelection()
    } else {
      selectAll()
    }
  }

  const openBulkDialog = (action: "trash" | "restore" | "permanent-delete" | "remove-missing") => {
    setBulkDialogAction(action)
    setBulkDialogOpen(true)
  }

  const executeBulkAction = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    setBulkLoading(true)
    try {
      const res = await fetch("/api/media/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetIds: ids, action: bulkDialogAction }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Bulk action failed")

      const { successCount, failedCount } = result

      if (failedCount > 0) {
        toast.warning(`${successCount} succeeded, ${failedCount} failed`)
      } else {
        const labels: Record<string, string> = {
          trash: "Moved to trash",
          restore: "Restored",
          "permanent-delete": "Permanently deleted",
          "remove-missing": "Records removed",
        }
        toast.success(`${labels[bulkDialogAction]} (${successCount} item${successCount !== 1 ? "s" : ""})`)
      }

      setSelectedIds(new Set())
      setBulkDialogOpen(false)

      if (bulkDialogAction === "trash") {
        fetchAssets()
        fetchTrashed()
      } else if (bulkDialogAction === "restore") {
        fetchTrashed()
        fetchAssets()
      } else if (bulkDialogAction === "permanent-delete") {
        fetchTrashed()
        fetchMissing()
      } else if (bulkDialogAction === "remove-missing") {
        fetchMissing()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bulk action failed"
      toast.error(message)
    } finally {
      setBulkLoading(false)
    }
  }

  const handleUpdateAltText = async () => {
    if (!editingAsset) return
    try {
      const res = await fetch("/api/media/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingAsset.id, altText: editAltText }),
      })
      if (!res.ok) throw new Error("Update failed")
      toast.success("Updated successfully")
      setAssets(assets.map((a) => a.id === editingAsset.id ? { ...a, altText: editAltText } : a))
      setEditingAsset(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update"
      toast.error(message)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch("/api/media/sync", { method: "POST" })
      if (!res.ok) throw new Error("Sync failed")
      const result = await res.json()
      if (result.missing > 0) {
        toast.warning(`Found ${result.missing} missing asset(s) from Cloudinary`)
        fetchMissing()
      } else {
        toast.success(`All ${result.active} assets verified on Cloudinary`)
      }
      fetchAssets()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sync failed"
      toast.error(message)
    } finally {
      setIsSyncing(false)
    }
  }

  const bulkDialogLabels: Record<string, { title: string; description: string; confirmLabel: string }> = {
    trash: {
      title: "Move to Trash",
      description: `Move ${selectedIds.size} item${selectedIds.size !== 1 ? "s" : ""} to trash? You can restore them later from the Trash tab.`,
      confirmLabel: "Move to Trash",
    },
    restore: {
      title: "Restore Selected",
      description: `Restore ${selectedIds.size} item${selectedIds.size !== 1 ? "s" : ""} from trash to the library?`,
      confirmLabel: "Restore Selected",
    },
    "permanent-delete": {
      title: "Delete Permanently",
      description: `Permanently delete ${selectedIds.size} item${selectedIds.size !== 1 ? "s" : ""} from Cloudinary? This cannot be undone.`,
      confirmLabel: "Delete Permanently",
    },
    "remove-missing": {
      title: "Remove Selected Records",
      description: `Remove ${selectedIds.size} missing asset record${selectedIds.size !== 1 ? "s" : ""} from the database? The Cloudinary file is already gone.`,
      confirmLabel: "Remove Records",
    },
  }

  const renderBulkActionBar = () => {
    if (selectedIds.size === 0) return null

    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span>{selectedIds.size} selected</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Clear
          </Button>
          {activeTab === "library" && (
            <Button variant="destructive" size="sm" onClick={() => openBulkDialog("trash")}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Move to Trash
            </Button>
          )}
          {activeTab === "trash" && (
            <>
              <Button variant="outline" size="sm" onClick={() => openBulkDialog("restore")}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Restore Selected
              </Button>
              <Button variant="destructive" size="sm" onClick={() => openBulkDialog("permanent-delete")}>
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Delete Permanently
              </Button>
            </>
          )}
          {activeTab === "missing" && (
            <Button variant="destructive" size="sm" onClick={() => openBulkDialog("remove-missing")}>
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Remove Selected Records
            </Button>
          )}
        </div>
      </div>
    )
  }

  const renderCheckbox = (id: string) => {
    const checked = selectedIds.has(id)
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          toggleSelection(id)
        }}
        className="absolute top-2 left-2 z-10 rounded bg-black/50 p-0.5 text-white hover:bg-black/70 transition-colors"
      >
        {checked ? (
          <CheckSquare className="h-5 w-5" />
        ) : (
          <Square className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    )
  }

  const renderLibraryTab = () => {
    if (filteredAssets.length === 0) {
      return (
        <div className="col-span-full py-20 text-center text-muted-foreground border rounded-lg">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">
            {search ? "No assets found" : "No media uploaded yet"}
          </p>
          <p className="text-sm mt-1">
            {search ? "Try a different search term" : "Upload your first image to get started"}
          </p>
          {!search && (
            <Button variant="outline" className="mt-4" onClick={fetchAssets}>
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="group relative aspect-square rounded-lg overflow-hidden border bg-slate-100 dark:bg-slate-900"
          >
            {renderCheckbox(asset.id)}
            <img
              src={asset.secureUrl}
              alt={asset.altText || "Media Asset"}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(asset.secureUrl)}
                title="Copy URL"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setEditingAsset(asset)
                  setEditAltText(asset.altText || "")
                }}
                title="Edit alt text"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-[10px] truncate">
              {getDisplayName(asset)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderTrashTab = () => {
    if (filteredTrashed.length === 0) {
      return (
        <div className="col-span-full py-20 text-center text-muted-foreground border rounded-lg">
          <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Trash is empty</p>
          <p className="text-sm mt-1">Deleted assets will appear here</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredTrashed.map((asset) => (
          <div
            key={asset.id}
            className="group relative aspect-square rounded-lg overflow-hidden border bg-slate-100 dark:bg-slate-900 opacity-75"
          >
            {renderCheckbox(asset.id)}
            <img
              src={asset.secureUrl}
              alt={asset.altText || "Media Asset"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setSelectedIds(new Set([asset.id]))
                  openBulkDialog("restore")
                }}
                title="Restore"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setSelectedIds(new Set([asset.id]))
                  openBulkDialog("permanent-delete")
                }}
                title="Delete Permanently"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-[10px] truncate">
              {getDisplayName(asset)}
            </div>
            {asset.trashedAt && (
              <div className="absolute top-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                {new Date(asset.trashedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderMissingTab = () => {
    if (filteredMissing.length === 0) {
      return (
        <div className="col-span-full py-20 text-center text-muted-foreground border rounded-lg">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No missing assets</p>
          <p className="text-sm mt-1">All Cloudinary assets are accounted for</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {filteredMissing.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30"
          >
            <button
              type="button"
              onClick={() => toggleSelection(asset.id)}
              className="shrink-0"
            >
              {selectedIds.has(asset.id) ? (
                <CheckSquare className="h-5 w-5 text-primary" />
              ) : (
                <Square className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </button>
            <AlertTriangle className="h-8 w-8 text-orange-500 shrink-0" />
            <div className="flex-grow min-w-0">
              <p className="font-medium truncate">{getDisplayName(asset)}</p>
              <p className="text-sm text-muted-foreground truncate">{asset.publicId}</p>
              {asset.missingDetectedAt && (
                <p className="text-xs text-muted-foreground">
                  Detected: {new Date(asset.missingDetectedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Manage all images uploaded to your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
            Sync Cloudinary
          </Button>
          <Button variant="outline" size="sm" onClick={() => { fetchAssets(); fetchTrashed(); fetchMissing(); }} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <MediaUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => { setActiveTab("library"); setSearch(""); clearSelection(); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "library"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Library ({assets.length})
        </button>
        <button
          onClick={() => { setActiveTab("trash"); fetchTrashed(); setSearch(""); clearSelection(); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "trash"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Trash ({trashedAssets.length})
        </button>
        <button
          onClick={() => { setActiveTab("missing"); fetchMissing(); setSearch(""); clearSelection(); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "missing"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Missing ({missingAssets.length})
        </button>
      </div>

      {/* Search and selection controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, alt text, ID, or folder..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {activeTab === "library" && `${filteredAssets.length} asset${filteredAssets.length !== 1 ? "s" : ""}`}
          {activeTab === "trash" && `${filteredTrashed.length} item${filteredTrashed.length !== 1 ? "s" : ""}`}
          {activeTab === "missing" && `${filteredMissing.length} missing`}
        </span>
        {getCurrentList().length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAllToggle}
          >
            {allSelected ? (
              <>
                <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                Clear Selection
              </>
            ) : (
              <>
                <Square className="h-3.5 w-3.5 mr-1.5" />
                Select All ({getCurrentList().length})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Bulk action bar */}
      {renderBulkActionBar()}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p className="text-sm">Loading media...</p>
        </div>
      ) : activeTab === "library" ? (
        renderLibraryTab()
      ) : activeTab === "trash" ? (
        renderTrashTab()
      ) : (
        renderMissingTab()
      )}

      {/* Edit Alt Text Dialog */}
      <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Alt Text</DialogTitle>
            <DialogDescription>
              Update the alt text for accessibility and SEO.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingAsset && (
              <div className="aspect-video rounded-lg overflow-hidden border">
                <img
                  src={editingAsset.secureUrl}
                  alt={editAltText || ""}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-alt">Alt Text</Label>
              <Input
                id="edit-alt"
                value={editAltText}
                onChange={(e) => setEditAltText(e.target.value)}
                placeholder="Describe the image"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAsset(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAltText}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirm Dialog */}
      <ConfirmDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        title={bulkDialogLabels[bulkDialogAction].title}
        description={bulkDialogLabels[bulkDialogAction].description}
        confirmLabel={bulkDialogLabels[bulkDialogAction].confirmLabel}
        cancelLabel="Cancel"
        variant={bulkDialogAction === "restore" ? "default" : "destructive"}
        onConfirm={executeBulkAction}
        loading={bulkLoading}
      />
    </div>
  )
}
