/**
 * Canonical CV Output Resolver
 *
 * Single source of truth for resolving CV data per output type.
 * All outputs (public, pdf, docx) MUST use this resolver.
 *
 * Flow:
 * Master data → Website/CV Override/CV-only resolution
 * → Section visibility → Item visibility
 * → Field visibility for requested output
 * → Final data
 */

import { prisma } from "@/lib/db"
import { CV_SECTIONS } from "@/lib/cv/sections"
import type { CvOutput, FieldVisibilityMap } from "./field-privacy"
import {
  getEffectiveFieldVisibility,
  applyFieldVisibility,
  parseFieldVisibility,
} from "./field-privacy"

interface ResolvedItem {
  id: string
  source: "website" | "override" | "cv_only"
  data: Record<string, unknown>
  override?: Record<string, unknown>
  fieldVisibility: FieldVisibilityMap
}

interface ResolvedSection {
  sectionKey: string
  isVisible: boolean
  sortOrder: number
  sortMode: string
  sourceMode: string
  publicEnabled: boolean
  pdfEnabled: boolean
  docxEnabled: boolean
  customTitle: string | null
  def: ReturnType<typeof CV_SECTIONS.find>
  items: ResolvedItem[]
}

interface ResolvedCv {
  settings: {
    id: string
    resumeEnabled: boolean
    publicResumeEnabled: boolean
    pdfDownloadEnabled: boolean
    wordDownloadEnabled: boolean
    activePreset: string
    [key: string]: unknown
  }
  identity: {
    firstName: string
    lastName: string
    postNominals: string
    professionalTitle: string
    specialty: string
    email: string
    phone: string
    city: string
    region: string
    country: string
    website: string
    linkedin: string
    profileImage: string | null
    photoUrl: string | null
    photoShape: string
    showPhotoOnPublic: boolean
  }
  sections: ResolvedSection[]
  socialLinks: Array<{ platform: string; url: string }>
  preset: string
}

/**
 * Check if a section is enabled for a specific output.
 */
function isSectionEnabledForOutput(section: ResolvedSection, output: CvOutput): boolean {
  if (output === "public") return section.publicEnabled
  if (output === "pdf") return section.pdfEnabled
  if (output === "docx") return section.docxEnabled
  return false
}

/**
 * Resolve the full CV data from the database.
 * This is the raw resolution before output filtering.
 */
export async function resolveCvData(): Promise<ResolvedCv | null> {
  const settings = await prisma.cvSettings.findFirst()
  if (!settings) return null

  const profile = await prisma.profile.findFirst()
  if (!profile) return null

  const dbSections = await prisma.cvSection.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
  })

  const sectionKeys = dbSections.map((s) => s.sectionKey)

  const [education, experience, qualifications, certifications, publications, achievements, interests, socialLinks] = await Promise.all([
    prisma.education.findMany({ where: { profileId: profile.id, isVisible: true }, orderBy: { startDate: "desc" } }),
    prisma.experience.findMany({ where: { profileId: profile.id, isVisible: true }, orderBy: { startDate: "desc" } }),
    prisma.qualification.findMany({ where: { profileId: profile.id, isVisible: true }, orderBy: { issueDate: "desc" } }),
    prisma.certification.findMany({ where: { profileId: profile.id, isVisible: true }, orderBy: { issueDate: "desc" } }),
    prisma.publication.findMany({ where: { profileId: profile.id, isVisible: true, isPublished: true }, orderBy: { publicationDate: "desc" } }),
    prisma.achievement.findMany({ where: { profileId: profile.id, isVisible: true }, orderBy: { date: "desc" } }),
    prisma.professionalInterest.findMany({ where: { profileId: profile.id, isVisible: true }, orderBy: { sortOrder: "asc" } }),
    prisma.socialLink.findMany({ where: { isVisible: true }, orderBy: { sortOrder: "asc" } }),
  ])

  const [overrides, customEntries] = await Promise.all([
    prisma.cvItemOverride.findMany({ where: { sectionKey: { in: sectionKeys } } }),
    prisma.cvCustomEntry.findMany({ where: { sectionKey: { in: sectionKeys }, isVisible: true }, orderBy: { sortOrder: "asc" } }),
  ])

  const websiteData: Record<string, unknown[]> = {
    education,
    experience,
    qualification: qualifications,
    certification: certifications,
    publication: publications,
    achievement: achievements,
    interest: interests,
    profile: profile ? [profile as unknown as Record<string, unknown>] : [],
  }

  const overridesBySource = new Map<string, typeof overrides[0]>()
  for (const o of overrides) {
    overridesBySource.set(`${o.sectionKey}:${o.sourceType}:${o.sourceId}`, o)
  }

  const customBySection = new Map<string, typeof customEntries>()
  for (const c of customEntries) {
    const arr = customBySection.get(c.sectionKey) || []
    arr.push(c)
    customBySection.set(c.sectionKey, arr)
  }

  const resolvedSections: ResolvedSection[] = dbSections.map((section) => {
    const def = CV_SECTIONS.find((s) => s.key === section.sectionKey)
    const items: ResolvedItem[] = []

    // Only include website data if section sourceMode is NOT cv_only
    const srcType = def?.websiteSourceType
    if (srcType && websiteData[srcType] && section.sourceMode !== "cv_only") {
      const srcItems = websiteData[srcType] as Array<Record<string, unknown>>
      for (const item of srcItems) {
        const itemId = item.id as string
        const overrideKey = `${section.sectionKey}:${srcType}:${itemId}`
        const override = overridesBySource.get(overrideKey)
        if (override?.hiddenFromCv) continue

        const overrideData = override
          ? Object.fromEntries(
              Object.entries(override).filter(
                ([k]) => k.startsWith("cv") && override[k as keyof typeof override] != null
              )
            ) as Record<string, unknown>
          : undefined

        items.push({
          id: itemId,
          source: override ? "override" : "website",
          data: item,
          override: overrideData,
          fieldVisibility: getEffectiveFieldVisibility(
            section.sectionKey,
            override?.fieldVisibility
          ),
        })
      }
    }

    const cvEntries = customBySection.get(section.sectionKey) || []
    for (const entry of cvEntries) {
      items.push({
        id: entry.id,
        source: "cv_only",
        data: entry as unknown as Record<string, unknown>,
        fieldVisibility: getEffectiveFieldVisibility(
          section.sectionKey,
          entry.fieldVisibility
        ),
      })
    }

    // Deduplicate items by ID (safety net against duplicate DB records)
    const seenIds = new Set<string>()
    const dedupedItems = items.filter((item) => {
      if (seenIds.has(item.id)) return false
      seenIds.add(item.id)
      return true
    })

    return {
      sectionKey: section.sectionKey,
      isVisible: section.isVisible,
      sortOrder: section.sortOrder,
      sortMode: section.sortMode,
      sourceMode: section.sourceMode,
      publicEnabled: section.publicEnabled,
      pdfEnabled: section.pdfEnabled,
      docxEnabled: section.docxEnabled,
      customTitle: section.customTitle ?? null,
      def,
      items: dedupedItems,
    }
  })

  const identity = {
    firstName: settings.cvFirstName || "",
    lastName: settings.cvLastName || "",
    postNominals: settings.cvPostNominals || "",
    professionalTitle: settings.cvProfessionalTitle || "",
    specialty: settings.cvSpecialty || "",
    email: settings.cvEmail || "",
    phone: settings.cvPhone || "",
    city: settings.cvCity || "",
    region: settings.cvRegion || "",
    country: settings.cvCountry || "",
    website: settings.cvWebsite || profile.website || "",
    linkedin: settings.cvLinkedin || "",
    profileImage: settings.showPhotoOnPublic ? settings.photoSource === "custom" ? settings.cvPhotoUrl : (settings.cvPhotoUrl || profile.profileImage) : null,
    photoUrl: settings.photoSource === "custom" ? settings.cvPhotoUrl : (settings.cvPhotoUrl || profile.profileImage || null),
    photoShape: settings.photoShape || "portrait",
    showPhotoOnPublic: settings.showPhotoOnPublic,
    photoDisplayMode: settings.photoDisplayMode || "photo",
  }

  return {
    settings: settings as unknown as ResolvedCv["settings"],
    identity,
    sections: resolvedSections,
    socialLinks: socialLinks as unknown as ResolvedCv["socialLinks"],
    preset: settings.activePreset,
  }
}

/**
 * Filter resolved CV data for a specific output type.
 * This is the SINGLE canonical filtering function.
 *
 * - Section visibility (publicEnabled/pdfEnabled/docxEnabled)
 * - Item-level hiddenFromCv (already filtered in resolveCvData)
 * - Field-level visibility per output
 */
export function filterForOutput(data: ResolvedCv, output: CvOutput): ResolvedCv {
  const filteredSections = data.sections
    .filter((section) => isSectionEnabledForOutput(section, output))
    .map((section) => ({
      ...section,
      items: section.items.map((item) => {
        const filteredData = applyFieldVisibility(
          item.data,
          item.fieldVisibility,
          output
        )
        let filteredOverride = item.override
        if (filteredOverride) {
          filteredOverride = applyFieldVisibility(
            filteredOverride,
            item.fieldVisibility,
            output
          )
        }
        return {
          ...item,
          data: filteredData,
          override: filteredOverride,
        }
      }),
    }))

  // Filter identity contact info based on Contact custom entry's field visibility
  const filteredIdentity = { ...data.identity }
  const filteredSettings = { ...data.settings } as Record<string, unknown>
  for (const section of data.sections) {
    for (const item of section.items) {
      const itemData = item.data as Record<string, unknown>
      if (itemData.title === "Contact" || (section.sectionKey === "custom" && (itemData.email || itemData.phone))) {
        const emailVis = item.fieldVisibility.email
        const phoneVis = item.fieldVisibility.phone
        if (emailVis && !emailVis[output]) {
          filteredIdentity.email = ""
          filteredSettings.cvEmail = ""
        }
        if (phoneVis && !phoneVis[output]) {
          filteredIdentity.phone = ""
          filteredSettings.cvPhone = ""
        }
      }
    }
  }

  return {
    ...data,
    settings: filteredSettings as ResolvedCv["settings"],
    identity: filteredIdentity,
    sections: filteredSections,
  }
}

/**
 * Get CV data for a specific output type.
 * Combines resolution + filtering in one call.
 */
export async function resolveCvForOutput(output: CvOutput): Promise<ResolvedCv | null> {
  const data = await resolveCvData()
  if (!data) return null
  return filterForOutput(data, output)
}
