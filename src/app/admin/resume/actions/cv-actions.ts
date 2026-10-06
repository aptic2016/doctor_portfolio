"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth/auth"
import { revalidatePath } from "next/cache"
import { CV_SECTIONS, SECTION_KEY_SET, PRESETS, getPresetOrder } from "@/lib/cv/sections"
import { DEMO_IDENTITY, DEMO_ENTRIES } from "@/lib/cv/demo-data"
import type { SortMode, SourceMode } from "@/lib/cv/sections"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

function revalidate() {
  revalidatePath("/admin/resume")
  revalidatePath("/resume")
  revalidatePath("/")
}

// ── CV SETTINGS ──

export async function getCvSettings() {
  await requireAdmin()
  let settings = await prisma.cvSettings.findFirst()
  if (!settings) {
    settings = await prisma.cvSettings.create({ data: {} })
  }
  return settings
}

export async function updateCvSettings(data: {
  resumeEnabled?: boolean
  showInNavigation?: boolean
  publicResumeEnabled?: boolean
  pdfDownloadEnabled?: boolean
  wordDownloadEnabled?: boolean
  activePreset?: string
  customPresetName?: string | null
  showPhotoOnPublic?: boolean
  photoOnPdf?: boolean
  photoOnWord?: boolean
  cvPhotoUrl?: string | null
  photoDisplayMode?: string
  photoSource?: string
  photoShape?: string
  cvFirstName?: string | null
  cvLastName?: string | null
  cvPostNominals?: string | null
  cvProfessionalTitle?: string | null
  cvSpecialty?: string | null
  cvEmail?: string | null
  cvPhone?: string | null
  cvCity?: string | null
  cvRegion?: string | null
  cvCountry?: string | null
  cvWebsite?: string | null
  cvLinkedin?: string | null
}) {
  await requireAdmin()
  let settings = await prisma.cvSettings.findFirst()
  if (!settings) {
    settings = await prisma.cvSettings.create({ data: {} })
  }

  const oldPreset = settings.activePreset
  const newPreset = data.activePreset
  const oldNav = settings.showInNavigation

  settings = await prisma.cvSettings.update({
    where: { id: settings.id },
    data,
  })

  if (newPreset && newPreset !== oldPreset) {
    await applyPresetDefaults(newPreset)
  }

  if (data.showInNavigation !== undefined && data.showInNavigation !== oldNav) {
    const existingNav = await prisma.navigationItem.findFirst({ where: { destination: "/resume" } })
    if (data.showInNavigation) {
      if (existingNav) {
        await prisma.navigationItem.update({ where: { id: existingNav.id }, data: { isVisible: true } })
      } else {
        await prisma.navigationItem.create({
          data: { label: "Resume / CV", destination: "/resume", isVisible: true, sortOrder: 90 },
        })
      }
    } else {
      if (existingNav) {
        await prisma.navigationItem.update({ where: { id: existingNav.id }, data: { isVisible: false } })
      }
    }
  }

  revalidate()
  return settings
}

async function applyPresetDefaults(presetKey: string) {
  const order = getPresetOrder(presetKey)
  const updates = order.map((key, idx) => {
    const def = CV_SECTIONS.find((s) => s.key === key)
    if (!def) return null
    return prisma.cvSection.upsert({
      where: { sectionKey: key },
      create: {
        sectionKey: key,
        sortOrder: idx,
        sortMode: def.defaultSortMode,
        sourceMode: def.sourceMode,
        publicEnabled: def.defaultPublicEnabled,
        pdfEnabled: def.defaultPdfEnabled,
        docxEnabled: def.defaultDocxEnabled,
        isConfigured: false,
      },
      update: {
        sortOrder: idx,
        isConfigured: false,
      },
    })
  }).filter(Boolean)

  await Promise.all(updates)
}

// ── CV SECTIONS ──

export async function getCvSections() {
  await requireAdmin()
  const dbSections = await prisma.cvSection.findMany({ orderBy: { sortOrder: "asc" } })

  const dbMap = new Map(dbSections.map((s) => [s.sectionKey, s]))

  return CV_SECTIONS.map((def, idx) => {
    const db = dbMap.get(def.key)
    return {
      ...def,
      id: db?.id ?? null,
      sortOrder: db?.sortOrder ?? idx,
      sortMode: (db?.sortMode ?? def.defaultSortMode) as SortMode,
      sourceMode: (db?.sourceMode ?? def.sourceMode) as SourceMode,
      isConfigured: db?.isConfigured ?? false,
      publicEnabled: db?.publicEnabled ?? def.defaultPublicEnabled,
      pdfEnabled: db?.pdfEnabled ?? def.defaultPdfEnabled,
      docxEnabled: db?.docxEnabled ?? def.defaultDocxEnabled,
      customTitle: db?.customTitle ?? null,
    }
  })
}

export async function updateCvSection(sectionKey: string, data: {
  customTitle?: string | null
  isVisible?: boolean
  sourceMode?: SourceMode
  sortOrder?: number
  sortMode?: SortMode
  isConfigured?: boolean
  publicEnabled?: boolean
  pdfEnabled?: boolean
  docxEnabled?: boolean
}) {
  await requireAdmin()
  if (!SECTION_KEY_SET.has(sectionKey)) throw new Error(`Invalid section key: ${sectionKey}`)

  const section = await prisma.cvSection.upsert({
    where: { sectionKey },
    create: { sectionKey, sortOrder: 0, sortMode: "newest_first", sourceMode: "website", ...data, isConfigured: true },
    update: { ...data, isConfigured: true },
  })

  revalidate()
  return section
}

export async function reorderCvSections(orderedKeys: string[]) {
  await requireAdmin()
  const updates = orderedKeys.map((key, idx) =>
    prisma.cvSection.upsert({
      where: { sectionKey: key },
      create: { sectionKey: key, sortOrder: idx, sortMode: "newest_first", sourceMode: "website" },
      update: { sortOrder: idx },
    })
  )
  await Promise.all(updates)
  revalidate()
}

// ── CV ITEM OVERRIDES ──

export async function getCvItemOverrides(sectionKey: string) {
  await requireAdmin()
  return prisma.cvItemOverride.findMany({
    where: { sectionKey },
    orderBy: { updatedAt: "desc" },
  })
}

export async function upsertCvItemOverride(sectionKey: string, sourceType: string, sourceId: string, data: {
  cvTitle?: string | null
  cvDescription?: string | null
  cvBullets?: string | null
  cvInstitution?: string | null
  cvLocation?: string | null
  cvDepartment?: string | null
  cvStartDate?: Date | null
  cvEndDate?: Date | null
  cvIsCurrent?: boolean | null
  cvSortOrder?: number | null
  hiddenFromCv?: boolean
  fieldVisibility?: Record<string, Record<string, boolean>> | null
}) {
  await requireAdmin()
  if (!SECTION_KEY_SET.has(sectionKey)) throw new Error(`Invalid section key: ${sectionKey}`)

  const { fieldVisibility, ...rest } = data
  const override = await prisma.cvItemOverride.upsert({
    where: { sectionKey_sourceType_sourceId: { sectionKey, sourceType, sourceId } },
    create: { sectionKey, sourceType, sourceId, ...rest, fieldVisibility: fieldVisibility ?? undefined },
    update: { ...rest, fieldVisibility: fieldVisibility ?? undefined },
  })

  revalidate()
  return override
}

export async function deleteCvItemOverride(id: string) {
  await requireAdmin()
  await prisma.cvItemOverride.delete({ where: { id } })
  revalidate()
}

export async function revertCvItemOverride(sectionKey: string, sourceType: string, sourceId: string) {
  await requireAdmin()
  await prisma.cvItemOverride.deleteMany({
    where: { sectionKey, sourceType, sourceId },
  })
  revalidate()
}

// ── CV CUSTOM ENTRIES ──

export async function getCvCustomEntries(sectionKey?: string) {
  await requireAdmin()
  const where = sectionKey ? { sectionKey } : {}
  return prisma.cvCustomEntry.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  })
}

export async function createCvCustomEntry(data: {
  sectionKey: string
  title: string
  subtitle?: string | null
  institution?: string | null
  department?: string | null
  location?: string | null
  description?: string | null
  bullets?: string | null
  email?: string | null
  phone?: string | null
  startDate?: Date | null
  endDate?: Date | null
  isCurrent?: boolean
  sortOrder?: number
  isVisible?: boolean
  fieldVisibility?: Record<string, Record<string, boolean>> | null
}) {
  await requireAdmin()
  if (!SECTION_KEY_SET.has(data.sectionKey)) throw new Error(`Invalid section key: ${data.sectionKey}`)

  const { fieldVisibility, ...rest } = data
  const entry = await prisma.cvCustomEntry.create({
    data: {
      ...rest,
      fieldVisibility: fieldVisibility ?? undefined,
    },
  })
  revalidate()
  return entry
}

export async function updateCvCustomEntry(id: string, data: {
  title?: string
  subtitle?: string | null
  institution?: string | null
  department?: string | null
  location?: string | null
  description?: string | null
  bullets?: string | null
  email?: string | null
  phone?: string | null
  startDate?: Date | null
  endDate?: Date | null
  isCurrent?: boolean
  sortOrder?: number
  isVisible?: boolean
  fieldVisibility?: Record<string, Record<string, boolean>> | null
}) {
  await requireAdmin()
  const { fieldVisibility, ...rest } = data
  const entry = await prisma.cvCustomEntry.update({
    where: { id },
    data: {
      ...rest,
      fieldVisibility: fieldVisibility ?? undefined,
    },
  })
  revalidate()
  return entry
}

export async function deleteCvCustomEntry(id: string) {
  await requireAdmin()
  await prisma.cvCustomEntry.delete({ where: { id } })
  revalidate()
}

export async function reorderCvCustomEntries(sectionKey: string, orderedIds: string[]) {
  await requireAdmin()
  const updates = orderedIds.map((id, idx) =>
    prisma.cvCustomEntry.update({ where: { id }, data: { sortOrder: idx } })
  )
  await Promise.all(updates)
  revalidate()
}

// ── PUBLIC DATA RESOLVER ──

// ── CANONICAL OUTPUT RESOLVER ──
// All outputs (public/pdf/docx) use resolveCvForOutput() from @/lib/cv/resolver.
// Import it for the public endpoint.
import { resolveCvForOutput } from "@/lib/cv/resolver"

export async function getPublicCvData() {
  const data = await resolveCvForOutput("public")
  if (!data) return null
  if (!data.settings.resumeEnabled || !data.settings.publicResumeEnabled) return null
  return data
}

// ── ATS READINESS CHECK ──

export async function getAtsReadiness() {
  await requireAdmin()
  const settings = await prisma.cvSettings.findFirst()
  const profile = await prisma.profile.findFirst()
  const sections = await prisma.cvSection.findMany({
    where: { isVisible: true, pdfEnabled: true },
    orderBy: { sortOrder: "asc" },
  })

  const issues: Array<{ type: "ready" | "warning" | "error"; message: string }> = []

  const name = settings?.cvFirstName || profile?.displayName
  if (name) {
    issues.push({ type: "ready", message: `Physician name present: ${name}` })
  } else {
    issues.push({ type: "error", message: "Physician name missing" })
  }

  const email = settings?.cvEmail || profile?.email
  if (email) {
    issues.push({ type: "ready", message: "Professional email present" })
  } else {
    issues.push({ type: "warning", message: "Professional email missing" })
  }

  if (sections.length === 0) {
    issues.push({ type: "error", message: "No visible sections for PDF" })
  } else {
    issues.push({ type: "ready", message: `${sections.length} sections configured for PDF` })
  }

  const emptySections = sections.filter((s) => {
    const def = CV_SECTIONS.find((d) => d.key === s.sectionKey)
    return !def
  })
  if (emptySections.length > 0) {
    issues.push({ type: "warning", message: `${emptySections.length} sections with unrecognized keys` })
  }

  const hasStandardHeadings = sections.every((s) => {
    const def = CV_SECTIONS.find((d) => d.key === s.sectionKey)
    return def?.atsHeading
  })
  if (hasStandardHeadings) {
    issues.push({ type: "ready", message: "All sections use standard ATS headings" })
  } else {
    issues.push({ type: "warning", message: "Some sections may have non-standard headings" })
  }

  const sensitiveHidden = sections.every((s) => {
    const def = CV_SECTIONS.find((d) => d.key === s.sectionKey)
    if (!def?.sensitive) return true
    return !s.publicEnabled || s.sectionKey !== "medical_licensure"
  })
  if (sensitiveHidden) {
    issues.push({ type: "ready", message: "Sensitive fields protected from public output" })
  } else {
    issues.push({ type: "warning", message: "Review sensitive field visibility" })
  }

  if (settings?.pdfDownloadEnabled) {
    issues.push({ type: "ready", message: "PDF download enabled" })
  } else {
    issues.push({ type: "warning", message: "PDF download disabled" })
  }

  issues.push({ type: "ready", message: "Text-based PDF (selectable, searchable)" })
  issues.push({ type: "ready", message: "Single-column ATS layout" })
  issues.push({ type: "ready", message: "No ATS false guarantee claimed" })

  return {
    ready: issues.every((i) => i.type !== "error"),
    issues,
    preset: settings?.activePreset || "international_physician",
  }
}

// ── DEMO CV ACTIONS ──

export async function loadDemoCv() {
  await requireAdmin()

  // Idempotent: if demo already loaded, remove first
  const existingSettings = await prisma.cvSettings.findFirst()
  if (existingSettings?.demoLoaded) {
    await removeDemoCvInternal()
  }

  // Ensure settings exist
  const settings = await prisma.cvSettings.findFirst()
  if (!settings) {
    await prisma.cvSettings.create({ data: { id: "default", resumeEnabled: true, publicResumeEnabled: true, pdfDownloadEnabled: true, wordDownloadEnabled: true, demoLoaded: true, showPhotoOnPublic: true, photoDisplayMode: "empty_slot", ...DEMO_IDENTITY } })
  } else {
    await prisma.cvSettings.update({
      where: { id: settings.id },
      data: { demoLoaded: true, showPhotoOnPublic: true, photoDisplayMode: "empty_slot", ...DEMO_IDENTITY },
    })
  }

  // Ensure demo sections exist with appropriate sourceMode
  const demoSectionKeys = [...new Set(DEMO_ENTRIES.map((e) => e.sectionKey))]
  for (const key of demoSectionKeys) {
    const def = CV_SECTIONS.find((s) => s.key === key)
    await prisma.cvSection.upsert({
      where: { sectionKey: key },
      create: {
        sectionKey: key,
        sortOrder: def ? getPresetOrder("international_physician").indexOf(key) : 0,
        sortMode: "newest_first",
        sourceMode: "cv_only",
        isConfigured: true,
        isVisible: true,
        publicEnabled: true,
        pdfEnabled: true,
        docxEnabled: true,
      },
      update: {
        sourceMode: "cv_only",
        isConfigured: true,
        isVisible: true,
        publicEnabled: true,
        pdfEnabled: true,
        docxEnabled: true,
      },
    })
  }

  // Create demo entries — strip extra fields not in CvCustomEntry schema, batch with createMany
  const cleanedEntries = DEMO_ENTRIES.map((entry) => {
    const e = entry as Record<string, unknown>
    const { category: _c, authors: _a, journal: _j, volume: _v, issue: _i, pages: _p, doi: _d, pmid: _pm, pmcid: _pc, ...clean } = e
    return {
      sectionKey: clean.sectionKey as string,
      title: clean.title as string,
      subtitle: (clean.subtitle as string) || null,
      institution: (clean.institution as string) || null,
      department: (clean.department as string) || null,
      location: (clean.location as string) || null,
      description: (clean.description as string) || null,
      bullets: (clean.bullets as string) || null,
      email: (clean.email as string) || null,
      phone: (clean.phone as string) || null,
      sortOrder: (clean.sortOrder as number) || 0,
      isCurrent: (clean.isCurrent as boolean) || false,
      fieldVisibility: (clean.fieldVisibility as object) || null,
      isDemo: true,
      isVisible: true,
      startDate: entry.startDate ? new Date(entry.startDate as string) : null,
      endDate: entry.endDate ? new Date(entry.endDate as string) : null,
    }
  })
  await prisma.cvCustomEntry.createMany({ data: cleanedEntries })

  revalidate()
  return { success: true, message: "Demo CV loaded" }
}

export async function resetDemoCv() {
  await requireAdmin()
  const settings = await prisma.cvSettings.findFirst()
  if (!settings?.demoLoaded) {
    return { success: false, message: "No demo CV loaded" }
  }

  // Remove all demo entries and recreate
  await removeDemoCvInternal()
  await loadDemoCv()

  return { success: true, message: "Demo CV reset" }
}

async function removeDemoCvInternal() {
  // Delete all demo-tagged custom entries
  await prisma.cvCustomEntry.deleteMany({ where: { isDemo: true } })

  // Clear demo identity fields from settings
  const settings = await prisma.cvSettings.findFirst()
  if (settings) {
    await prisma.cvSettings.update({
      where: { id: settings.id },
      data: {
        demoLoaded: false,
        cvFirstName: null,
        cvLastName: null,
        cvPostNominals: null,
        cvProfessionalTitle: null,
        cvSpecialty: null,
        cvEmail: null,
        cvPhone: null,
        cvCity: null,
        cvRegion: null,
        cvCountry: null,
        cvWebsite: null,
        cvLinkedin: null,
      },
    })
  }
}

export async function removeDemoCv() {
  await requireAdmin()
  const settings = await prisma.cvSettings.findFirst()
  if (!settings?.demoLoaded) {
    return { success: false, message: "No demo CV loaded" }
  }

  await removeDemoCvInternal()
  revalidate()
  return { success: true, message: "Demo CV removed" }
}
