"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { loadDemoData, exportData, importData, getDataStats, clearAllData } from "./actions/data-actions"
import { exportFullBackup, restoreFullBackup } from "./actions/backup-v2-actions"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
import {
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  FileJson,
  CheckCircle,
  AlertCircle,
  Loader2,
  Archive,
  FileArchive,
} from "lucide-react"

interface DataStats {
  profile: number
  education: number
  experience: number
  publications: number
  achievements: number
  articles: number
  faqs: number
}

interface DataPageClientProps {
  initialStats: DataStats | null
}

export function DataPageClient({ initialStats }: DataPageClientProps) {
  const [stats, setStats] = useState<DataStats | null>(initialStats)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [importJson, setImportJson] = useState("")
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [restoreFile, setRestoreFile] = useState<File | null>(null)
  const [restoreMode, setRestoreMode] = useState<"replace" | "merge">("replace")

  const refreshStats = async () => {
    const result = await getDataStats()
    if (result.success && result.stats) {
      setStats(result.stats)
    }
  }

  const handleLoadDemo = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const result = await loadDemoData()
      if (result.success) {
        setMessage({ type: "success", text: "Demo data loaded successfully! The portfolio now has sample content." })
        await refreshStats()
      } else {
        setMessage({ type: "error", text: result.error || "Failed to load demo data." })
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const result = await exportData()
      if (result.success && result.data) {
        const json = JSON.stringify(result.data, null, 2)
        const blob = new Blob([json], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `portfolio-backup-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setMessage({ type: "success", text: "Data exported and downloaded successfully." })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to export data." })
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." })
    } finally {
      setLoading(false)
    }
  }

  const handleExportV2 = async () => {
    setLoading(true)
    setMessage(null)
    toast.loading("Exporting backup with media files...", { id: "backup-export" })
    try {
      const result = await exportFullBackup()
      if (result.success) {
        const binary = atob(result.buffer)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], { type: "application/zip" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = result.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        const mediaCount = result.manifest.activeMediaCount
        toast.success(`Backup exported: ${result.filename} (${mediaCount} media files)`, { id: "backup-export" })
        setMessage({ type: "success", text: `Full backup exported with ${mediaCount} media files.` })
      } else {
        toast.error("Export failed", { id: "backup-export" })
        setMessage({ type: "error", text: "Failed to export backup." })
      }
    } catch {
      toast.error("Export failed", { id: "backup-export" })
      setMessage({ type: "error", text: "An unexpected error occurred." })
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreV2 = async () => {
    if (!restoreFile) return
    setLoading(true)
    setMessage(null)
    toast.loading("Restoring backup — uploading media to Cloudinary...", { id: "backup-restore" })
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result
          if (typeof result === "string") resolve(result.split(",")[1])
          else reject(new Error("Failed to read file"))
        }
        reader.onerror = reject
        reader.readAsDataURL(restoreFile)
      })

      const result = await restoreFullBackup(base64, restoreMode)
      if (result.success) {
        toast.success(`Restored! ${result.mediaUploaded} media files re-uploaded.`, { id: "backup-restore" })
        setMessage({ type: "success", text: `Backup restored. ${result.mediaUploaded} media files re-uploaded.` })
        setRestoreFile(null)
        await refreshStats()
      } else {
        toast.error("Restore failed", { id: "backup-restore" })
        setMessage({ type: "error", text: "Failed to restore backup." })
      }
    } catch {
      toast.error("Restore failed", { id: "backup-restore" })
      setMessage({ type: "error", text: "An unexpected error occurred during restore." })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importJson.trim()) {
      setMessage({ type: "error", text: "Please paste JSON data to import." })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const result = await importData(importJson)
      if (result.success) {
        setMessage({ type: "success", text: "Data imported successfully!" })
        setImportJson("")
        await refreshStats()
      } else {
        setMessage({ type: "error", text: result.error || "Failed to import data." })
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." })
    } finally {
      setLoading(false)
    }
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === "string") {
        setImportJson(content)
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleRestoreFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setRestoreFile(file)
    e.target.value = ""
  }

  const handleClearAll = async () => {
    setLoading(true)
    setMessage(null)
    setShowClearConfirm(false)
    try {
      const result = await clearAllData()
      if (result.success) {
        setMessage({ type: "success", text: "All data cleared. The database is now empty." })
        await refreshStats()
      } else {
        setMessage({ type: "error", text: result.error || "Failed to clear data." })
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data & Backup</h1>
        <p className="text-muted-foreground">
          Manage your portfolio data, load demo content, and create backups.
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Current Data Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Current Data
          </CardTitle>
          <CardDescription>Overview of data currently in the database.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground capitalize">{key}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet. Load demo data to get started.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Full Backup V2 Export */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Archive className="h-5 w-5" />
              Full Backup V2
            </CardTitle>
            <CardDescription>
              Download a complete ZIP backup with all data and active media files from Cloudinary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>The ZIP backup includes:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>All profile, content, and settings data</li>
                <li>All active media files (downloaded from Cloudinary)</li>
                <li>manifest.json with record counts</li>
                <li>media-mappings.json for reference remapping</li>
                <li className="text-green-600">Uploads are re-uploaded to your Cloudinary on restore</li>
              </ul>
            </div>
            <Button onClick={handleExportV2} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Export Full Backup (ZIP)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Full Backup V2 Restore */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <FileArchive className="h-5 w-5" />
              Restore Full Backup
            </CardTitle>
            <CardDescription>
              Restore from a V2 ZIP backup. Media files are re-uploaded to Cloudinary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="restore-file">Upload ZIP File</Label>
              <Input
                id="restore-file"
                type="file"
                accept=".zip"
                onChange={handleRestoreFileImport}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-3">
              <Label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="restoreMode"
                  value="replace"
                  checked={restoreMode === "replace"}
                  onChange={() => setRestoreMode("replace")}
                  className="accent-green-600"
                />
                Replace all data
              </Label>
              <Label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="restoreMode"
                  value="merge"
                  checked={restoreMode === "merge"}
                  onChange={() => setRestoreMode("merge")}
                  className="accent-green-600"
                />
                Merge
              </Label>
            </div>
            <Button
              onClick={handleRestoreV2}
              disabled={loading || !restoreFile}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Restore from ZIP
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Load Demo Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Load Demo Data
            </CardTitle>
            <CardDescription>
              Populate the portfolio with a complete demo dataset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>This will:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Create a complete profile with bio, education, experience</li>
                <li>Add publications, achievements, and articles</li>
                <li>Configure site settings, branding, and AI assistant</li>
                <li><strong className="text-amber-600">Replaces all existing data</strong></li>
              </ul>
            </div>
            <Button onClick={handleLoadDemo} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Load Demo Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Export Data (Legacy) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data (JSON)
            </CardTitle>
            <CardDescription>
              Download a JSON backup of data only (no media files).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>The export includes:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Profile and biography</li>
                <li>Education, experience, qualifications</li>
                <li>Publications and achievements</li>
                <li>Articles, FAQs, and site settings</li>
                <li className="text-green-600">Never exports passwords or secrets</li>
              </ul>
            </div>
            <Button onClick={handleExport} disabled={loading} className="w-full" variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export & Download
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import Data (Legacy) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data (JSON)
            </CardTitle>
            <CardDescription>
              Restore data from a JSON backup file. This replaces all existing data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-import">Upload JSON File</Label>
              <Input
                id="file-import"
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="json-paste">Or Paste JSON Data</Label>
              <Textarea
                id="json-paste"
                placeholder='{"version": "1.0.0", "profile": {...}, ...}'
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                rows={6}
                className="mt-1 font-mono text-xs"
              />
            </div>
            <Button onClick={handleImport} disabled={loading || !importJson.trim()} className="w-full" variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FileJson className="mr-2 h-4 w-4" />
                  Import Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that affect your data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Clear All Data</strong> — Permanently deletes all profile, content, and settings data.
                This action cannot be undone.
              </p>
            </div>
            <Button onClick={() => setShowClearConfirm(true)} variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Delete Everything?"
        description="This will permanently delete all profile, content, and settings data. This action cannot be undone."
        confirmLabel="Yes, Delete Everything"
        variant="destructive"
        loading={loading}
        onConfirm={handleClearAll}
      />
    </div>
  )
}
