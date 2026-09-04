"use client"

import React, { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ChevronUp, ChevronDown } from "lucide-react"
import { updateHomeSectionAdmin, moveHomeSection } from "../settings/actions"

interface Section {
  id: string
  sectionId: string
  label: string | null
  eyebrow: string | null
  heading: string | null
  supportingText: string | null
  sectionNumber: string | null
  showSectionNumber: boolean
  isVisible: boolean
  sortOrder: number
}

const SECTION_NAMES: Record<string, string> = {
  HERO: "Hero", INTRO: "Profile / About", POSITION: "Position",
  EXPERIENCE_HIGHLIGHTS: "Experience", EDUCATION_HIGHLIGHTS: "Education",
  QUALIFICATIONS: "Qualifications", EXPERTISE: "Expertise",
  ACHIEVEMENTS: "Achievements", PUBLICATIONS: "Publications",
  GALLERY: "Gallery", ARTICLES: "Articles", AI_CTA: "AI Insight", CONTACT_CTA: "Contact",
  PROFESSIONAL_SPOTLIGHT: "Professional Spotlight",
}

export function HomeSectionsAdmin({ initialSections }: { initialSections: Section[] }) {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const handleUpdateImmediate = async (id: string, data: Partial<Section>) => {
    try {
      const cleanData = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined))
      await updateHomeSectionAdmin(id, cleanData)
    } catch { toast.error("Failed to save changes") }
  }

  const handleUpdate = useCallback((id: string, data: Partial<Section>) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, ...data } : s))
    const key = `${id}-${Object.keys(data)[0]}`
    const existing = debounceTimers.current.get(key)
    if (existing) clearTimeout(existing)
    debounceTimers.current.set(key, setTimeout(() => {
      handleUpdateImmediate(id, data)
      debounceTimers.current.delete(key)
    }, 600))
  }, [])

  const handleToggleVisible = async (id: string, isVisible: boolean) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, isVisible } : s))
    try {
      const cleanData = { isVisible }
      await updateHomeSectionAdmin(id, cleanData)
    } catch { toast.error("Failed to update visibility") }
  }

  const handleToggleSectionNumber = async (id: string, showSectionNumber: boolean) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, showSectionNumber } : s))
    try {
      await updateHomeSectionAdmin(id, { showSectionNumber })
    } catch { toast.error("Failed to update") }
  }

  const handleMove = async (id: string, direction: "up" | "down") => {
    const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex((s) => s.id === id)
    const targetIdx = direction === "up" ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= sorted.length) return

    const temp = sorted[idx].sortOrder
    sorted[idx] = { ...sorted[idx], sortOrder: sorted[targetIdx].sortOrder }
    sorted[targetIdx] = { ...sorted[targetIdx], sortOrder: temp }
    setSections(sorted)

    try {
      await moveHomeSection(id, direction)
      toast.success("Section moved")
    } catch { toast.error("Failed to move") }
  }

  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Home Sections</h1>
        <p className="text-sm text-muted-foreground">Configure section labels, headings, numbers, visibility, and order.</p>
      </div>

      <div className="space-y-3">
        {sorted.map((section, idx) => (
          <div key={section.id} className={`p-4 rounded-lg border space-y-3 ${section.isVisible ? "bg-card border-border/50" : "bg-muted/20 border-border/30 opacity-60"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleMove(section.id, "up")} disabled={idx === 0}><ChevronUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleMove(section.id, "down")} disabled={idx === sorted.length - 1}><ChevronDown className="h-4 w-4" /></Button>
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase">{section.sectionId}</span>
                <span className="text-xs text-muted-foreground">{SECTION_NAMES[section.sectionId] || section.sectionId}</span>
              </div>
              <button onClick={() => handleToggleVisible(section.id, !section.isVisible)} className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-colors ${section.isVisible ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>{section.isVisible ? "VISIBLE" : "HIDDEN"}</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label className="text-[10px]">Eyebrow</Label><Input value={section.eyebrow || ""} onChange={(e) => handleUpdate(section.id, { eyebrow: e.target.value })} placeholder="Career" className="h-8 text-xs" /></div>
              <div><Label className="text-[10px]">Heading</Label><Input value={section.heading || ""} onChange={(e) => handleUpdate(section.id, { heading: e.target.value })} placeholder="Professional Journey" className="h-8 text-xs" /></div>
              <div><Label className="text-[10px]">Section Number</Label><Input value={section.sectionNumber || ""} onChange={(e) => handleUpdate(section.id, { sectionNumber: e.target.value })} placeholder="01" className="h-8 text-xs" /></div>
              <div><Label className="text-[10px]">Supporting Text</Label><Input value={section.supportingText || ""} onChange={(e) => handleUpdate(section.id, { supportingText: e.target.value })} placeholder="Optional description" className="h-8 text-xs" /></div>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={section.showSectionNumber} onChange={(e) => handleToggleSectionNumber(section.id, e.target.checked)} className="rounded" />
              Show section number
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
