"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhysicianResumeView, type CvData } from "@/components/resume/physician-resume-view"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Save, Eye, FileText, Download, ChevronDown, ChevronRight,
  Settings, Layers, Database, Search, Globe,
  GripVertical, Plus, Trash2, ExternalLink, CheckCircle2,
  AlertTriangle, XCircle, Pencil, ArrowUp, ArrowDown,
} from "lucide-react"

function Badge({ children, variant, className, title }: { children: React.ReactNode; variant?: string; className?: string; title?: string }) {
  return <span title={title} className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium", variant === "default" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground", className)}>{children}</span>
}

import {
  updateCvSettings,
  updateCvSection,
  reorderCvSections,
  getCvCustomEntries,
  createCvCustomEntry,
  updateCvCustomEntry,
  deleteCvCustomEntry,
  getAtsReadiness,
  getPublicCvData,
  loadDemoCv,
  resetDemoCv,
  removeDemoCv,
} from "./actions/cv-actions"
import {
  CV_SECTIONS, SECTION_GROUPS, PRESETS, SORT_MODE_LABELS, SOURCE_MODE_LABELS,
} from "@/lib/cv/sections"
import type { SectionDef, SectionGroup, SortMode, SourceMode } from "@/lib/cv/sections"
import { CvEntryForm, getCvEntryFormType } from "./cv-entry-forms"

interface CvSettingsData {
  id: string
  resumeEnabled: boolean
  showInNavigation: boolean
  publicResumeEnabled: boolean
  pdfDownloadEnabled: boolean
  wordDownloadEnabled: boolean
  activePreset: string
  customPresetName: string | null
  showPhotoOnPublic: boolean
  photoOnPdf: boolean
  photoOnWord: boolean
  cvPhotoUrl: string | null
  photoDisplayMode: string
  photoSource: string
  photoShape: string
  cvFirstName: string | null
  cvLastName: string | null
  cvPostNominals: string | null
  cvProfessionalTitle: string | null
  cvSpecialty: string | null
  cvEmail: string | null
  cvPhone: string | null
  cvCity: string | null
  cvRegion: string | null
  cvCountry: string | null
  cvWebsite: string | null
  cvLinkedin: string | null
  demoLoaded: boolean
}

interface SectionData {
  id: string | null
  key: string
  sectionKey: string
  label: string
  atsHeading: string
  group: SectionGroup
  groupLabel: string
  sourceMode: SourceMode
  websiteSourceType?: string
  canAddCvOnly: boolean
  supportsBullets: boolean
  defaultSortMode: SortMode
  sortOrder: number
  sortMode: SortMode
  isConfigured: boolean
  publicEnabled: boolean
  pdfEnabled: boolean
  docxEnabled: boolean
  customTitle: string | null
  sensitive: boolean
}

type Tab = "overview" | "sections" | "cv_data" | "preview"

const WEBSITE_EDIT_URLS: Record<string, string> = {
  profile: "/admin/profile",
  education: "/admin/education",
  experience: "/admin/experience",
  certification: "/admin/qualifications",
  qualification: "/admin/qualifications",
  publication: "/admin/publications",
  achievement: "/admin/achievements",
  interest: "/admin/interests",
}

function getWebsiteEditUrl(sourceType?: string): string {
  return WEBSITE_EDIT_URLS[sourceType || ""] || "/admin/profile"
}

export function ResumeAdmin({ initialSettings, initialSections }: { initialSettings: CvSettingsData | null; initialSections: SectionData[] }) {
  const [tab, setTab] = useState<Tab>("overview")
  const [settings, setSettings] = useState<CvSettingsData>(initialSettings ?? {
    id: "", resumeEnabled: false, showInNavigation: false, publicResumeEnabled: false,
    pdfDownloadEnabled: false, wordDownloadEnabled: false, activePreset: "international_physician",
    customPresetName: null, showPhotoOnPublic: false, photoOnPdf: false, photoOnWord: false,
    cvPhotoUrl: null, photoDisplayMode: "photo", photoSource: "profile", photoShape: "portrait",
    cvFirstName: null, cvLastName: null, cvPostNominals: null, cvProfessionalTitle: null,
    cvSpecialty: null, cvEmail: null, cvPhone: null, cvCity: null, cvRegion: null,
    cvCountry: null, cvWebsite: null, cvLinkedin: null, demoLoaded: false,
  })
  const [sections, setSections] = useState<SectionData[]>(initialSections)
  const [saving, setSaving] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState<SectionGroup | null>("identity")
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showHidden, setShowHidden] = useState(false)
  const [atsReadiness, setAtsReadiness] = useState<{ ready: boolean; issues: Array<{ type: string; message: string }>; preset: string } | null>(null)
  const [cvEntries, setCvEntries] = useState<Record<string, Array<{ id: string; sectionKey: string; title: string; subtitle: string | null; institution: string | null; department: string | null; location: string | null; description: string | null; bullets: string | null; startDate: string | null; endDate: string | null; isCurrent: boolean; sortOrder: number; isVisible: boolean }>>>({})
  const [showAddEntry, setShowAddEntry] = useState<string | null>(null)
  const [confirmPreset, setConfirmPreset] = useState<string | null>(null)
  const [demoLoading, setDemoLoading] = useState(false)
  const [confirmDemo, setConfirmDemo] = useState<"load" | "reset" | "remove" | null>(null)

  const handleSaveSettings = useCallback(async () => {
    setSaving(true)
    try {
      await updateCvSettings(settings)
      toast.success("Resume settings saved")
    } catch { toast.error("Failed to save") }
    setSaving(false)
  }, [settings])

  const handleSaveSection = useCallback(async (key: string, data: Partial<SectionData>) => {
    try {
      await updateCvSection(key, data as Record<string, unknown>)
      setSections((prev) => prev.map((s) => s.key === key ? { ...s, ...data, isConfigured: true } : s))
      toast.success("Section updated")
    } catch { toast.error("Failed to update section") }
  }, [])

  const handleMoveSection = useCallback(async (key: string, direction: "up" | "down") => {
    setSections((prev) => {
      const sorted = [...prev].sort((a, b) => a.sortOrder - b.sortOrder)
      const idx = sorted.findIndex((s) => s.key === key)
      if (idx < 0) return prev
      const targetIdx = direction === "up" ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev
      const temp = sorted[idx].sortOrder
      sorted[idx] = { ...sorted[idx], sortOrder: sorted[targetIdx].sortOrder }
      sorted[targetIdx] = { ...sorted[targetIdx], sortOrder: temp }
      const orderedKeys = sorted.map((s) => s.key)
      reorderCvSections(orderedKeys).catch(() => toast.error("Failed to reorder"))
      return sorted
    })
  }, [])

  const handleDeleteEntry = useCallback(async (sectionKey: string, entryId: string) => {
    try {
      await deleteCvCustomEntry(entryId)
      setCvEntries((prev) => ({
        ...prev,
        [sectionKey]: (prev[sectionKey] || []).filter((e) => e.id !== entryId),
      }))
      toast.success("Entry deleted")
    } catch { toast.error("Failed to delete") }
  }, [])

  const loadCvEntries = useCallback(async (sectionKey: string) => {
    if (cvEntries[sectionKey]) return
    try {
      const entries = await getCvCustomEntries(sectionKey)
      setCvEntries((prev) => ({
        ...prev,
        [sectionKey]: entries.map((e) => ({ ...e, startDate: e.startDate?.toISOString() || null, endDate: e.endDate?.toISOString() || null })),
      }))
    } catch { /* ignore */ }
  }, [cvEntries])

  const loadAtsReadiness = useCallback(async () => {
    try {
      const result = await getAtsReadiness()
      setAtsReadiness(result)
    } catch { toast.error("Failed to load ATS readiness") }
  }, [])

  const handleLoadDemo = useCallback(async () => {
    setDemoLoading(true)
    try {
      await loadDemoCv()
      setSettings((s) => ({ ...s, demoLoaded: true }))
      toast.success("Demo CV loaded! Dr. Maya Thompson, MD, MRCP, FACC")
      setConfirmDemo(null)
    } catch { toast.error("Failed to load demo CV") }
    setDemoLoading(false)
  }, [])

  const handleResetDemo = useCallback(async () => {
    setDemoLoading(true)
    try {
      await resetDemoCv()
      toast.success("Demo CV reset to original values")
      setConfirmDemo(null)
    } catch { toast.error("Failed to reset demo CV") }
    setDemoLoading(false)
  }, [])

  const handleRemoveDemo = useCallback(async () => {
    setDemoLoading(true)
    try {
      await removeDemoCv()
      setSettings((s) => ({ ...s, demoLoaded: false }))
      toast.success("Demo CV removed")
      setConfirmDemo(null)
    } catch { toast.error("Failed to remove demo CV") }
    setDemoLoading(false)
  }, [])

  const filteredSections = sections.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!s.label.toLowerCase().includes(q) && !s.atsHeading.toLowerCase().includes(q) && !s.key.toLowerCase().includes(q)) return false
    }
    if (!showHidden && !s.publicEnabled && !s.pdfEnabled && !s.docxEnabled) return false
    return true
  })

  const groups = Object.entries(SECTION_GROUPS).map(([key, val]) => ({
    key: key as SectionGroup,
    ...val,
    sections: filteredSections.filter((s) => s.group === key),
  }))

  // Load CV entries for all sections on mount
  useEffect(() => {
    const sectionKeys = CV_SECTIONS.filter((s) => s.canAddCvOnly).map((s) => s.key)
    sectionKeys.forEach((key) => loadCvEntries(key))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <Settings className="h-4 w-4" /> },
    { key: "sections", label: "Sections", icon: <Layers className="h-4 w-4" /> },
    { key: "cv_data", label: "CV-Only Data", icon: <Database className="h-4 w-4" /> },
    { key: "preview", label: "Preview", icon: <Eye className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resume / CV</h1>
          <p className="text-sm text-muted-foreground">Manage physician CV, presets, sections, and downloads</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save"}</Button>
      </div>

      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors", tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Status Cards */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
            {[
              { label: "Public Resume", value: settings.resumeEnabled && settings.publicResumeEnabled, enabledLabel: "Enabled", disabledLabel: "Disabled" },
              { label: "Navigation", value: settings.showInNavigation, enabledLabel: "Shown", disabledLabel: "Hidden" },
              { label: "ATS PDF", value: settings.pdfDownloadEnabled, enabledLabel: "Enabled", disabledLabel: "Disabled" },
              { label: "Word Download", value: settings.wordDownloadEnabled, enabledLabel: "Enabled", disabledLabel: "Disabled" },
              { label: "Demo CV", value: settings.demoLoaded, enabledLabel: "Loaded", disabledLabel: "Not Loaded" },
            ].map((card) => (
              <div key={card.label} className="p-3 rounded-lg border bg-muted/30">
                <div className="text-xs text-muted-foreground">{card.label}</div>
                <div className={cn("text-sm font-semibold mt-1", card.value ? "text-green-600" : "text-muted-foreground")}>{card.value ? card.enabledLabel : card.disabledLabel}</div>
              </div>
            ))}
          </div>

          {/* Public Resume disabled notice */}
          {settings.resumeEnabled && !settings.publicResumeEnabled && (
            <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 text-sm">
              Public Resume is currently disabled. You can still preview and edit the CV here.
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Col 1: Global Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Global Controls</h3>
              <div className="space-y-3">
                {[
                  ["Resume Enabled", "resumeEnabled", "Master switch for the CV system"] as const,
                  ["Show in Navigation", "showInNavigation", "Add /resume link to site navigation"] as const,
                  ["Public Resume Enabled", "publicResumeEnabled", "Allow public visitors to see the CV"] as const,
                  ["PDF Download Enabled", "pdfDownloadEnabled", "Show PDF download button on resume"] as const,
                  ["Word Download Enabled", "wordDownloadEnabled", "Show Word download button on resume"] as const,
                  ["Show Photo on Public", "showPhotoOnPublic", "Display profile photo on public resume"] as const,
                  ["Photo on PDF", "photoOnPdf", "Include photo in ATS PDF output"] as const,
                  ["Photo on Word", "photoOnWord", "Include photo in Word CV output"] as const,
                ].map(([label, key, help]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group">
                    <div>
                      <Label className="text-sm">{label}</Label>
                      <p className="text-[11px] text-muted-foreground">{help}</p>
                    </div>
                    <Switch checked={settings[key]} onCheckedChange={(v) => setSettings((s) => ({ ...s, [key]: v }))} />
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Default CV Profile + CV Identity Override */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Default CV Profile</h3>
              <p className="text-xs text-muted-foreground">Changing the preset will reset all section visibility and order to the preset defaults.</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <div key={key}>
                    {confirmPreset === key ? (
                      <div className="p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5 space-y-2">
                        <div className="text-xs font-medium text-yellow-700">Apply &quot;{preset.label}&quot; preset?</div>
                        <div className="text-[10px] text-muted-foreground">This will reset section order and visibility.</div>
                        <div className="flex gap-1">
                          <button onClick={() => { setSettings((s) => ({ ...s, activePreset: key })); setConfirmPreset(null) }} className="px-2 py-1 text-[10px] font-medium bg-primary text-primary-foreground rounded">Apply</button>
                          <button onClick={() => setConfirmPreset(null)} className="px-2 py-1 text-[10px] font-medium bg-muted rounded">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmPreset(key)} className={cn("p-3 rounded-lg border text-left text-sm transition-colors w-full", settings.activePreset === key ? "border-primary bg-primary/5" : "hover:bg-muted/50")}>
                        <div className="font-medium">{preset.label}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{preset.description}</div>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold mt-6">CV Identity Override</h3>
              <p className="text-xs text-muted-foreground">Override Profile data for CV output. Leave empty to use Website data.</p>
              <div className="grid gap-3">
                {[
                  ["First Name", "cvFirstName"], ["Last Name", "cvLastName"], ["Post-Nominals", "cvPostNominals"],
                  ["Professional Title", "cvProfessionalTitle"], ["Specialty", "cvSpecialty"],
                  ["Email", "cvEmail"], ["Phone", "cvPhone"],
                  ["City", "cvCity"], ["Region", "cvRegion"], ["Country", "cvCountry"],
                  ["Website", "cvWebsite"], ["LinkedIn", "cvLinkedin"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <Label className="text-xs">{label}</Label>
                    <Input value={(settings[key as keyof CvSettingsData] as string) || ""} onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value || null }))} placeholder={label} className="h-8 text-sm" />
                  </div>
                ))}
              </div>
            </div>
              </div>

              {/* Professional Summary Editor */}
              <h3 className="text-lg font-semibold mt-6">Professional Summary</h3>
              <p className="text-xs text-muted-foreground">This text appears near the top of your CV, below your name and title.</p>
              <div className="space-y-2">
                <Textarea
                  value={cvEntries["executive_summary"]?.[0]?.description || ""}
                  onChange={(e) => {
                    const val = e.target.value
                    setCvEntries((prev) => {
                      const existing = prev["executive_summary"]?.[0]
                      if (existing) {
                        return { ...prev, executive_summary: [{ ...existing, description: val }] }
                      }
                      return prev
                    })
                  }}
                  placeholder="Write a brief professional summary..."
                  rows={4}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const entry = cvEntries["executive_summary"]?.[0]
                      if (!entry) {
                        try {
                          const newEntry = await createCvCustomEntry({
                            sectionKey: "executive_summary",
                            title: "Professional Summary",
                            description: cvEntries["executive_summary"]?.[0]?.description || "",
                            sortOrder: 0,
                          })
                          setCvEntries((prev) => ({ ...prev, executive_summary: [{ id: newEntry.id, sectionKey: newEntry.sectionKey, title: newEntry.title, subtitle: newEntry.subtitle, institution: newEntry.institution, department: newEntry.department, location: newEntry.location, description: newEntry.description, bullets: newEntry.bullets, startDate: newEntry.startDate?.toISOString() || null, endDate: newEntry.endDate?.toISOString() || null, isCurrent: newEntry.isCurrent, sortOrder: newEntry.sortOrder, isVisible: newEntry.isVisible }] }))
                          toast.success("Summary saved")
                        } catch { toast.error("Failed to save") }
                        return
                      }
                      try {
                        await updateCvCustomEntry(entry.id, { description: entry.description })
                        toast.success("Summary saved")
                      } catch { toast.error("Failed to save") }
                    }}
                  >Save Summary</Button>
                </div>
              </div>

              {/* Photo Settings */}
              <h3 className="text-lg font-semibold mt-6">Photo</h3>
              <p className="text-xs text-muted-foreground">Control physician photo on the public Resume.</p>
              <div className="grid gap-3">
                {/* Photo Display Mode Radio */}
                <div className="space-y-2">
                  <Label className="text-xs">Photo Display Mode</Label>
                  {[
                    { value: "photo", label: "Show Passport Photo", desc: "Display the doctor photo in a passport-style rectangular area" },
                    { value: "empty_slot", label: "Keep Empty Passport Photo Slot", desc: "Show a reserved passport-size rectangle, empty for manual photo attachment" },
                    { value: "none", label: "No Photo", desc: "Do not display any photo area" },
                  ].map((opt) => (
                    <label key={opt.value} className={cn("flex items-start gap-3 p-2 rounded-md border cursor-pointer transition-colors", settings.photoDisplayMode === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50")}>
                      <input
                        type="radio"
                        name="photoDisplayMode"
                        value={opt.value}
                        checked={settings.photoDisplayMode === opt.value}
                        onChange={() => setSettings((s) => ({ ...s, photoDisplayMode: opt.value }))}
                        className="mt-0.5 h-4 w-4"
                      />
                      <div>
                        <div className="text-sm font-medium">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Photo Source — only when "Show Passport Photo" is selected */}
                {settings.photoDisplayMode === "photo" && (
                  <div className="space-y-2">
                    <Label className="text-xs">Photo Source</Label>
                    {[
                      { value: "profile", label: "Use Profile Photo", desc: "Use the existing Profile photo automatically" },
                      { value: "custom", label: "Custom Resume Photo", desc: "Select a specific photo for the Resume" },
                    ].map((opt) => (
                      <label key={opt.value} className={cn("flex items-start gap-3 p-2 rounded-md border cursor-pointer transition-colors", settings.photoSource === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50")}>
                        <input
                          type="radio"
                          name="photoSource"
                          value={opt.value}
                          checked={settings.photoSource === opt.value}
                          onChange={() => setSettings((s) => ({ ...s, photoSource: opt.value }))}
                          className="mt-0.5 h-4 w-4"
                        />
                        <div>
                          <div className="text-sm font-medium">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Custom Photo MediaPicker — only when "Show Passport Photo" + "Custom" */}
                {settings.photoDisplayMode === "photo" && settings.photoSource === "custom" && (
                  <div>
                    <Label className="text-xs">Select Resume Photo</Label>
                    <MediaPicker
                      value={settings.cvPhotoUrl || ""}
                      onChange={(url) => setSettings((s) => ({ ...s, cvPhotoUrl: url || null }))}
                      label="Resume Photo"
                      purpose="PROFILE"
                      filterPurpose="PROFILE"
                    />
                  </div>
                )}

                {/* Profile Photo Preview — when using profile photo */}
                {settings.photoDisplayMode === "photo" && settings.photoSource === "profile" && (
                  <div className="p-3 rounded-lg border border-border bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-2">Using Profile Photo</div>
                  </div>
                )}

                {/* Empty Slot Preview */}
                {settings.photoDisplayMode === "empty_slot" && (
                  <div className="p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-20 border-2 border-dashed border-border bg-background flex items-center justify-center">
                        <span className="text-[8px] text-muted-foreground text-center leading-tight">Passport<br/>Photo</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Empty passport slot will appear on the CV. Print and attach a photo manually if needed.</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Demo CV Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Demo CV</h3>
                <p className="text-xs text-muted-foreground">Load a fictional physician CV to learn how the system works. Your real website data will not be overwritten.</p>
              </div>
              {settings.demoLoaded && <Badge className="bg-green-100 text-green-700 border-green-200">Loaded</Badge>}
            </div>

            {confirmDemo === "load" && (
              <div className="p-3 rounded-lg border border-blue-500/50 bg-blue-500/5 space-y-2">
                <div className="text-sm font-medium">Load Demo Physician CV?</div>
                <div className="text-xs text-muted-foreground">This adds fictional CV-only example data so you can learn the Resume system. Your real website data will not be overwritten.</div>
                <div className="flex gap-2">
                  <button onClick={handleLoadDemo} disabled={demoLoading} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded">{demoLoading ? "Loading..." : "Load Demo CV"}</button>
                  <button onClick={() => setConfirmDemo(null)} className="px-3 py-1.5 text-xs font-medium bg-muted rounded">Cancel</button>
                </div>
              </div>
            )}
            {confirmDemo === "reset" && (
              <div className="p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5 space-y-2">
                <div className="text-sm font-medium">Reset Demo CV?</div>
                <div className="text-xs text-muted-foreground">This restores demo entries to their original example values.</div>
                <div className="flex gap-2">
                  <button onClick={handleResetDemo} disabled={demoLoading} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded">{demoLoading ? "Resetting..." : "Reset Demo CV"}</button>
                  <button onClick={() => setConfirmDemo(null)} className="px-3 py-1.5 text-xs font-medium bg-muted rounded">Cancel</button>
                </div>
              </div>
            )}
            {confirmDemo === "remove" && (
              <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/5 space-y-2">
                <div className="text-sm font-medium">Remove demo CV data?</div>
                <div className="text-xs text-muted-foreground">Only demo CV entries will be removed. Your real website and CV information will not be changed.</div>
                <div className="flex gap-2">
                  <button onClick={handleRemoveDemo} disabled={demoLoading} className="px-3 py-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded">{demoLoading ? "Removing..." : "Remove Demo CV"}</button>
                  <button onClick={() => setConfirmDemo(null)} className="px-3 py-1.5 text-xs font-medium bg-muted rounded">Cancel</button>
                </div>
              </div>
            )}

            {!confirmDemo && (
              <div className="flex flex-wrap gap-2">
                {!settings.demoLoaded ? (
                  <button onClick={() => setConfirmDemo("load")} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90">Load Demo CV</button>
                ) : (
                  <>
                    <button onClick={() => setConfirmDemo("reset")} className="px-3 py-1.5 text-xs font-medium bg-muted rounded hover:bg-muted/80">Reset Demo CV</button>
                    <button onClick={() => setConfirmDemo("remove")} className="px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive rounded hover:bg-destructive/20">Remove Demo CV</button>
                  </>
                )}
              </div>
            )}

            {settings.demoLoaded && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Demo data: <strong>Dr. Maya Thompson, MD, MRCP, FACC</strong> — Consultant Cardiologist. All data is completely fictional.
                </div>

                {/* Data Completeness */}
                <div className="p-3 rounded-lg bg-muted/30 space-y-2">
                  <div className="text-xs font-medium text-foreground">Data Completeness</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                    {["executive_summary", "medical_licensure", "board_certification", "clinical_experience", "clinical_expertise", "publications", "research_experience", "grants", "leadership", "teaching_experience", "mentoring", "conference_presentations", "peer_review", "quality_improvement", "cme_cpd", "memberships", "awards", "languages", "procedures_skills", "medical_education", "residency", "fellowship", "professional_certifications", "references"].map((sk) => {
                      const def = CV_SECTIONS.find((c) => c.key === sk)
                      const hasEntries = cvEntries[sk] && cvEntries[sk].length > 0
                      return (
                        <div key={sk} className={cn("flex items-center gap-1.5 px-2 py-1 rounded", hasEntries ? "bg-green-500/5 text-green-700" : "bg-muted/50 text-muted-foreground")}>
                          {hasEntries ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
                          <span className="truncate">{def?.label || sk}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Preset Preview */}
                <div className="p-3 rounded-lg bg-muted/30 space-y-2">
                  <div className="text-xs font-medium text-foreground">Preset Quick Reference</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                    {Object.entries(PRESETS).map(([key, preset]) => (
                      <div key={key} className={cn("px-2 py-1.5 rounded border", settings.activePreset === key ? "border-primary bg-primary/5" : "border-border/50")}>
                        <div className="font-medium">{preset.label}</div>
                        <div className="text-muted-foreground">{preset.defaultOrder.length} sections</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ SECTIONS TAB ═══════════ */}
      {tab === "sections" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search sections..." className="pl-9" />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer" title="Displays sections that are currently hidden so you can enable them again.">
              <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} className="rounded" />
              Show Hidden Sections
            </label>
          </div>

          {groups.map((group) => (
            <div key={group.key} className="border rounded-lg">
              <button onClick={() => setExpandedGroup(expandedGroup === group.key ? null : group.key)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  {expandedGroup === group.key ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-semibold">{group.label}</span>
                  <Badge variant="secondary" className="text-xs">{group.sections.length}</Badge>
                </div>
              </button>
              {expandedGroup === group.key && (
                <div className="border-t divide-y">
                  {group.sections.map((section) => {
                    const sortedAll = [...sections].sort((a, b) => a.sortOrder - b.sortOrder)
                    const globalIdx = sortedAll.findIndex((s) => s.key === section.key)
                    const canMoveUp = globalIdx > 0
                    const canMoveDown = globalIdx < sortedAll.length - 1
                    return (
                       <div key={section.key} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-sm">{section.customTitle || section.label}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className="text-[10px]" title={
                                  section.sourceMode === "cv_only"
                                    ? "This content exists only in the CV."
                                    : "This content comes from your website and stays in sync."
                                }>{SOURCE_MODE_LABELS[section.sourceMode]}</Badge>
                                {cvEntries[section.key]?.length > 0 && (
                                  <span className="text-[10px] text-muted-foreground">{cvEntries[section.key].length} item{cvEntries[section.key].length !== 1 ? 's' : ''}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleMoveSection(section.key, "up")} disabled={!canMoveUp} className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"><ArrowUp className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleMoveSection(section.key, "down")} disabled={!canMoveDown} className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"><ArrowDown className="h-3.5 w-3.5" /></button>
                            <div className="flex items-center gap-0.5 ml-1" title="Where this section appears">
                              <Badge variant={section.publicEnabled ? "default" : "outline"} className="text-[10px]">{section.publicEnabled ? "Public" : ""}</Badge>
                              <Badge variant={section.pdfEnabled ? "default" : "outline"} className="text-[10px]">{section.pdfEnabled ? "PDF" : ""}</Badge>
                              <Badge variant={section.docxEnabled ? "default" : "outline"} className="text-[10px]">{section.docxEnabled ? "Word" : ""}</Badge>
                            </div>
                            {section.sourceMode !== "cv_only" && section.websiteSourceType && (
                              <a href={getWebsiteEditUrl(section.websiteSourceType)} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground" title="Edit Website Data">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)} className="p-1 hover:bg-muted rounded">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {expandedSection === section.key && (
                          <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <Label className="text-xs">Section Title Override</Label>
                                <Input value={section.customTitle || ""} onChange={(e) => handleSaveSection(section.key, { customTitle: e.target.value || null })} placeholder={section.label} className="h-8 text-sm" />
                              </div>
                              <div>
                                <Label className="text-xs">Sort Mode</Label>
                                <select value={section.sortMode} onChange={(e) => handleSaveSection(section.key, { sortMode: e.target.value as SortMode })} className="w-full h-8 text-sm border rounded px-2 bg-background">
                                  {Object.entries(SORT_MODE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="flex items-center justify-between p-2 bg-background rounded" title="Show this section on the public Resume page.">
                                <Label className="text-xs">Public Resume</Label>
                                <Switch checked={section.publicEnabled} onCheckedChange={(v) => handleSaveSection(section.key, { publicEnabled: v })} />
                              </div>
                              <div className="flex items-center justify-between p-2 bg-background rounded" title="Include this section in the ATS PDF.">
                                <Label className="text-xs">ATS PDF</Label>
                                <Switch checked={section.pdfEnabled} onCheckedChange={(v) => handleSaveSection(section.key, { pdfEnabled: v })} />
                              </div>
                              <div className="flex items-center justify-between p-2 bg-background rounded" title="Include this section in the Word CV.">
                                <Label className="text-xs">Word DOCX</Label>
                                <Switch checked={section.docxEnabled} onCheckedChange={(v) => handleSaveSection(section.key, { docxEnabled: v })} />
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2 bg-background rounded">
                              <Label className="text-xs">Hide section entirely</Label>
                              <Switch checked={!section.publicEnabled && !section.pdfEnabled && !section.docxEnabled} onCheckedChange={(v) => handleSaveSection(section.key, { publicEnabled: !v, pdfEnabled: !v, docxEnabled: !v })} />
                            </div>

                            {section.sensitive && (
                              <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded text-xs text-yellow-600">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Sensitive section — review public visibility carefully
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {group.sections.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">No sections match search</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ CV DATA TAB ═══════════ */}
      {tab === "cv_data" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Add CV-only entries that don&apos;t exist in the website data (licenses, grants, teaching, references, etc.)</p>
          {CV_SECTIONS.filter((s) => s.canAddCvOnly).map((section) => (
            <div key={section.key} className="border rounded-lg">
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-sm">{section.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {cvEntries[section.key]?.length || 0} CV-only entries
                    {section.sensitive && <span className="ml-2 text-yellow-600">Sensitive</span>}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setShowAddEntry(showAddEntry === section.key ? null : section.key); loadCvEntries(section.key) }}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Add Entry
                </Button>
              </div>

              {showAddEntry === section.key && (
                <div className="border-t p-4 bg-muted/30">
                  <CvEntryForm
                    sectionKey={section.key}
                    onSave={async (data) => {
                      if (!data.title || !(data.title as string).trim()) { toast.error("Title is required"); return }
                      try {
                        const entry = await createCvCustomEntry({
                          sectionKey: section.key,
                          title: data.title as string,
                          subtitle: (data.subtitle as string) || null,
                          institution: (data.institution as string) || null,
                          department: (data.department as string) || null,
                          location: (data.location as string) || null,
                          description: (data.description as string) || null,
                          bullets: (data.bullets as string) || null,
                          email: (data.email as string) || null,
                          phone: (data.phone as string) || null,
                          startDate: data.startDate as Date | null,
                          endDate: data.endDate as Date | null,
                          isCurrent: !!data.isCurrent,
                          sortOrder: (cvEntries[section.key]?.length || 0),
                          fieldVisibility: (data.fieldVisibility as Record<string, Record<string, boolean>>) || null,
                        })
                        setCvEntries((prev) => ({
                          ...prev,
                          [section.key]: [...(prev[section.key] || []), { ...entry, startDate: entry.startDate?.toISOString() || null, endDate: entry.endDate?.toISOString() || null }],
                        }))
                        setShowAddEntry(null)
                        toast.success("Entry added")
                      } catch { toast.error("Failed to add entry") }
                    }}
                    onCancel={() => setShowAddEntry(null)}
                  />
                </div>
              )}

              {cvEntries[section.key] && cvEntries[section.key].length > 0 && (
                <div className="border-t divide-y">
                  {cvEntries[section.key].map((entry) => (
                    <div key={entry.id} className="p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{entry.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {[entry.institution, entry.location, entry.startDate ? new Date(entry.startDate).getFullYear() : null].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="secondary" className="text-[10px]" title="This item exists only in the CV">CV-only</Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(section.key, entry.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ PREVIEW TAB ═══════════ */}
      {tab === "preview" && (
        <PreviewTab settings={settings} sections={sections} onEditSection={(sectionKey) => { setTab("sections"); }} />
      )}
    </div>
  )
}

// ── Preview Tab Component ──
function PreviewTab({ settings, sections, onEditSection }: { settings: CvSettingsData; sections: SectionData[]; onEditSection: (sectionKey: string) => void }) {
  const [previewMode, setPreviewMode] = useState<"public" | "pdf" | "docx" | "ats_text">("public")
  const [atsReadiness, setAtsReadiness] = useState<{ ready: boolean; issues: Array<{ type: string; message: string }>; preset: string } | null>(null)
  const [showHowItWorks, setShowHowItWorks] = useState(true)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [cvData, setCvData] = useState<CvData | null>(null)
  const [cvDataLoading, setCvDataLoading] = useState(true)

  const hasData = sections.some((s) => s.publicEnabled || s.pdfEnabled || s.docxEnabled)
  const enabledSections = sections.filter((s) => s.publicEnabled || s.pdfEnabled || s.docxEnabled)
  const publicSections = sections.filter((s) => s.publicEnabled)
  const pdfSections = sections.filter((s) => s.pdfEnabled)
  const docxSections = sections.filter((s) => s.docxEnabled)

  const loadAtsReadiness = useCallback(async () => {
    try { setAtsReadiness(await getAtsReadiness()) } catch { toast.error("Failed to load ATS readiness") }
  }, [])

  const generatePdfPreview = useCallback(async () => {
    setPdfLoading(true)
    try {
      const res = await fetch("/api/cv/download/pdf")
      if (!res.ok) throw new Error("Failed")
      const blob = await res.blob()
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
      setPdfPreviewUrl(URL.createObjectURL(blob))
    } catch { toast.error("Failed to generate PDF preview") }
    setPdfLoading(false)
  }, [pdfPreviewUrl])

  const loadCvData = useCallback(async () => {
    if (cvData) return
    const data = await getPublicCvData().catch(() => null)
    if (data) setCvData(data as unknown as CvData)
    setCvDataLoading(false)
  }, [cvData])

  // Load CV data for the inline public preview.
  // State updates happen after `await getPublicCvData()`, not synchronously in the effect body.
  useEffect(() => {
    loadCvData() // eslint-disable-line react-hooks/set-state-in-effect
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (d: string | Date | null | undefined): string => {
    if (!d) return ""
    const date = typeof d === "string" ? new Date(d) : d
    if (isNaN(date.getTime())) return ""
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  const renderInlineItem = (item: { id: string; data: Record<string, unknown>; override?: Record<string, unknown> }) => {
    const o = item.override
    const title = (o?.cvTitle as string) || (item.data.title as string) || (item.data.jobTitle as string) || (item.data.degree as string) || ""
    const subtitle = (o?.cvSubtitle as string) || (item.data.subtitle as string) || (item.data.credential as string) || ""
    const institution = (o?.cvInstitution as string) || (item.data.institution as string) || (item.data.organization as string) || ""
    const location = (o?.cvLocation as string) || (item.data.location as string) || ""
    const department = (o?.cvDepartment as string) || (item.data.department as string) || ""
    const description = (o?.cvDescription as string) || (item.data.description as string) || ""
    const bulletsRaw = (o?.cvBullets as string) || (item.data.bullets as string) || (item.data.responsibilities as string) || (item.data.achievements as string) || ""
    const bullets = bulletsRaw.split("\n").map((b: string) => b.trim()).filter(Boolean)
    const start = formatDate(item.data.startDate as string | Date | null)
    const end = item.data.isCurrent ? "Present" : formatDate(item.data.endDate as string | Date | null)
    const dateRange = start || end ? (start && end ? `${start} — ${end}` : start || end) : ""
    const orgLine = [institution, department, location].filter(Boolean).join(" — ")

    return (
      <div key={item.id} className="py-2 border-b border-border/50 last:border-0">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <div className="min-w-0">
            {title && <div className="text-sm font-medium text-foreground leading-snug">{title}</div>}
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
            {orgLine && <div className="text-xs text-muted-foreground">{orgLine}</div>}
            {((item.data.email as string) || (item.data.phone as string)) && (
              <div className="text-xs text-muted-foreground">{[item.data.email as string, item.data.phone as string].filter(Boolean).join("  |  ")}</div>
            )}
          </div>
          {dateRange && <span className="text-[11px] text-muted-foreground whitespace-nowrap font-medium shrink-0">{dateRange}</span>}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">{description}</p>}
        {bullets.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            {bullets.map((b: string, i: number) => <li key={i} className="flex gap-1.5"><span className="text-muted-foreground/50 mt-0.5 shrink-0">•</span><span className="leading-relaxed">{b}</span></li>)}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* How This CV Works */}
      {showHowItWorks && (
        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">How This CV Works</h3>
            <button onClick={() => setShowHowItWorks(false)} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 text-xs text-muted-foreground">
            <div className="space-y-2">
              <div className="font-medium text-foreground">Data Sources</div>
              <div><strong>Website Data</strong> — automatically follows website content</div>
              <div><strong>CV Override</strong> — changes only the CV-specific version</div>
              <div><strong>CV Only</strong> — independent CV information</div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-foreground">Output Formats</div>
              <div><strong>Public Resume</strong> — the public /resume page</div>
              <div><strong>ATS PDF</strong> — clean single-column PDF for job applications</div>
              <div><strong>Word CV</strong> — editable DOCX for further editing</div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Mode Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {[
          { key: "public" as const, label: "Public Resume", icon: <Globe className="h-4 w-4" /> },
          { key: "pdf" as const, label: "ATS PDF", icon: <FileText className="h-4 w-4" /> },
          { key: "docx" as const, label: "Word CV", icon: <Download className="h-4 w-4" /> },
          { key: "ats_text" as const, label: "ATS Text", icon: <FileText className="h-4 w-4" /> },
        ].map((m) => (
          <button key={m.key} onClick={() => setPreviewMode(m.key)} className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors", previewMode === m.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {m.icon}{m.label}
          </button>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={settings.resumeEnabled && settings.publicResumeEnabled ? "/resume" : "#"}
          target={settings.resumeEnabled && settings.publicResumeEnabled ? "_blank" : undefined}
          className={cn("inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm", settings.resumeEnabled && settings.publicResumeEnabled ? "hover:bg-muted" : "opacity-50 cursor-not-allowed")}
          title={settings.resumeEnabled && settings.publicResumeEnabled ? "Open public resume in new tab" : "Enable Public Resume in Overview first."}
        >
          <ExternalLink className="h-4 w-4" />Open Public Resume
        </a>
        <Button variant="outline" onClick={loadAtsReadiness}><CheckCircle2 className="h-4 w-4 mr-2" />Check ATS Readiness</Button>
      </div>

      {/* ATS Readiness */}
      {atsReadiness && (
        <div className={cn("p-4 rounded-lg border", atsReadiness.ready ? "bg-green-500/5 border-green-500/20" : "bg-yellow-500/5 border-yellow-500/20")}>
          <div className="flex items-center gap-2 mb-3">
            {atsReadiness.ready ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-yellow-600" />}
            <span className="font-semibold">{atsReadiness.ready ? "ATS Ready" : "Needs Attention"}</span>
            <span className="text-xs text-muted-foreground ml-2">Preset: {PRESETS[atsReadiness.preset]?.label || atsReadiness.preset}</span>
          </div>
          <div className="space-y-1.5">
            {atsReadiness.issues.map((issue, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {issue.type === "ready" && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                {issue.type === "warning" && <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 shrink-0" />}
                {issue.type === "error" && <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />}
                <span>{issue.message}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">ATS-friendly format. No universal ATS guarantee exists.</p>
        </div>
      )}

      {/* Empty State */}
      {!hasData && (
        <div className="p-8 text-center border rounded-lg">
          <p className="text-muted-foreground mb-4">No CV content yet.</p>
          <div className="flex justify-center gap-3">
            <a href="/admin/resume" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">Load Demo CV</a>
            <a href="/admin/resume" className="px-4 py-2 border rounded-md text-sm hover:bg-muted">Add CV Data</a>
          </div>
        </div>
      )}

      {/* ── Public Resume Inline Preview (Shared Renderer) ── */}
      {hasData && previewMode === "public" && (
        <div className="border rounded-lg bg-gray-100 dark:bg-gray-900 max-h-[700px] overflow-y-auto p-4">
          <div className="bg-white border border-gray-200 shadow-sm">
            {cvDataLoading && <div className="p-8 text-center text-sm text-gray-500">Loading preview…</div>}
            {!cvDataLoading && cvData && (
              <PhysicianResumeView data={cvData} mode="admin" onEditSection={onEditSection} />
            )}
            {!cvDataLoading && !cvData && (
              <div className="p-8 text-center text-sm text-gray-500">
                <p>Could not load CV data.</p>
                <button onClick={loadCvData} className="mt-2 text-blue-600 hover:underline text-sm">Retry</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PDF Preview ── */}
      {hasData && previewMode === "pdf" && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
            <p>ATS PDF uses a clean single-column document layout. It intentionally looks simpler than the public Resume.</p>
            <p className="mt-1">Sections included: <strong>{pdfSections.length}</strong> | Format: PDFKit (single-column, ATS-friendly)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={generatePdfPreview} disabled={pdfLoading}>{pdfLoading ? "Generating…" : "Generate Preview PDF"}</Button>
            <a href="/api/cv/download/pdf" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted"><Download className="h-4 w-4" />Download PDF</a>
          </div>
          {pdfPreviewUrl && (
            <iframe src={pdfPreviewUrl} className="w-full h-[600px] border rounded-lg" title="PDF Preview" />
          )}
          {!pdfPreviewUrl && !pdfLoading && (
            <div className="p-8 text-center border rounded-lg text-sm text-muted-foreground">Click &quot;Generate Preview PDF&quot; to see a live preview.</div>
          )}
        </div>
      )}

      {/* ── Word Preview ── */}
      {hasData && previewMode === "docx" && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
            <p>Word CV is an editable DOCX file. Final appearance may vary by Word-compatible application.</p>
            <p className="mt-1">Sections included: <strong>{docxSections.length}</strong> | Format: docx library (real OOXML) | Font: Arial</p>
          </div>
          <div className="flex gap-2">
            <a href="/api/cv/download/docx" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted"><Download className="h-4 w-4" />Download Word CV</a>
          </div>
          {/* Section list for Word */}
          <div className="border rounded-lg divide-y">
            {docxSections.map((s) => {
              const def = CV_SECTIONS.find((c) => c.key === s.sectionKey)
              return (
                <div key={s.key} className="flex items-center justify-between px-4 py-2 text-sm">
                  <span className="font-medium">{s.customTitle || def?.label || s.sectionKey}</span>
                  <Badge variant="secondary" className="text-[10px]">DOCX</Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── ATS Text Preview ── */}
      {hasData && previewMode === "ats_text" && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
            <p>ATS Text shows the plain text structure that Applicant Tracking Systems read from your PDF.</p>
            <p className="mt-1">ATS parsers extract text from the PDF. No formatting, tables, or columns — just structured text.</p>
          </div>
          <div className="flex gap-2">
            <a href="/api/cv/download/pdf" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted"><Download className="h-4 w-4" />Download ATS PDF</a>
          </div>
          {/* Text structure preview */}
          <div className="border rounded-lg p-4 bg-muted/10 font-mono text-xs text-muted-foreground space-y-1 max-h-[400px] overflow-y-auto">
            {pdfSections.map((s) => {
              const def = CV_SECTIONS.find((c) => c.key === s.sectionKey)
              const title = s.customTitle || def?.label || s.sectionKey
              return (
                <div key={s.key}>
                  <div className="font-semibold text-foreground mt-2">{title.toUpperCase()}</div>
                  <div className="pl-2 border-l-2 border-border/50 ml-1">
                    {s.sectionKey === "professional_identity" ? (
                      <div>Medical Professional — [Identity data]</div>
                    ) : (
                      <div>[{s.sectionKey.replace(/_/g, " ")} items]</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Section Configuration Summary ── */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Section Configuration Summary</h3>
        <div className="space-y-2">
          {enabledSections.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{s.customTitle || s.label}</span>
                <Badge variant="secondary" className="text-[10px] shrink-0" title={
                  s.sourceMode === "website" ? "Use current portfolio website information automatically." :
                  s.sourceMode === "website_with_override" ? "Keep website data synced, but customize selected fields for the CV." :
                  "Use information that exists only in the CV."
                }>{SOURCE_MODE_LABELS[s.sourceMode]}</Badge>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex gap-1">
                  {s.publicEnabled && <span title="Public Resume: ON"><Globe className="h-3.5 w-3.5 text-blue-500" /></span>}
                  {s.pdfEnabled && <span title="ATS PDF: ON"><FileText className="h-3.5 w-3.5 text-orange-500" /></span>}
                  {s.docxEnabled && <span title="Word CV: ON"><Download className="h-3.5 w-3.5 text-green-500" /></span>}
                </div>
                <button onClick={() => onEditSection(s.sectionKey)} className="text-[11px] text-primary hover:underline">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
