"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth/auth"
import { revalidatePath } from "next/cache"
import { SPOTLIGHT_LOCAL_ID_PREFIX } from "@/components/shared/spotlight/stage"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

// Navigation
export async function getNavigationItems() {
  await requireAdmin()
  return prisma.navigationItem.findMany({ orderBy: { sortOrder: "asc" } })
}

export async function createNavigationItem(data: { label: string; destination: string; isVisible?: boolean; isExternal?: boolean; icon?: string; desktopVisible?: boolean; mobileVisible?: boolean }) {
  await requireAdmin()
  const maxOrder = await prisma.navigationItem.findMany({ orderBy: { sortOrder: "desc" }, take: 1 })
  const item = await prisma.navigationItem.create({
    data: { ...data, sortOrder: (maxOrder[0]?.sortOrder ?? -1) + 1 },
  })
  revalidatePath("/admin/navigation")
  revalidatePath("/")
  return item
}

export async function updateNavigationItem(id: string, data: { label?: string; destination?: string; isVisible?: boolean; isExternal?: boolean; icon?: string | null; desktopVisible?: boolean; mobileVisible?: boolean; sortOrder?: number }) {
  await requireAdmin()
  const item = await prisma.navigationItem.update({ where: { id }, data })
  revalidatePath("/admin/navigation")
  revalidatePath("/")
  return item
}

export async function deleteNavigationItem(id: string) {
  await requireAdmin()
  await prisma.navigationItem.delete({ where: { id } })
  revalidatePath("/admin/navigation")
  revalidatePath("/")
}

export async function reorderNavigation(ids: string[]) {
  await requireAdmin()
  for (let i = 0; i < ids.length; i++) {
    await prisma.navigationItem.update({ where: { id: ids[i] }, data: { sortOrder: i } })
  }
  revalidatePath("/admin/navigation")
  revalidatePath("/")
}

export async function moveNavigationItem(id: string, direction: "up" | "down") {
  await requireAdmin()
  const items = await prisma.navigationItem.findMany({ orderBy: { sortOrder: "asc" } })
  const idx = items.findIndex((i) => i.id === id)
  if (idx < 0) return
  const targetIdx = direction === "up" ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= items.length) return
  // Swap sort orders
  const temp = items[idx].sortOrder
  await prisma.navigationItem.update({ where: { id: items[idx].id }, data: { sortOrder: items[targetIdx].sortOrder } })
  await prisma.navigationItem.update({ where: { id: items[targetIdx].id }, data: { sortOrder: temp } })
  revalidatePath("/admin/navigation")
  revalidatePath("/")
}

// Home Sections
export async function getHomeSectionsAdmin() {
  await requireAdmin()
  return prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } })
}

export async function updateHomeSectionAdmin(id: string, data: {
  eyebrow?: string | null; heading?: string | null; supportingText?: string | null;
  sectionNumber?: string | null; showSectionNumber?: boolean;
  isVisible?: boolean; sortOrder?: number; label?: string | null; layoutVariant?: string | null;
}) {
  await requireAdmin()
  const section = await prisma.homeSection.update({ where: { id }, data })
  revalidatePath("/admin/home-sections")
  revalidatePath("/")
  return section
}

export async function moveHomeSection(id: string, direction: "up" | "down") {
  await requireAdmin()
  const sections = await prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } })
  const idx = sections.findIndex((s) => s.id === id)
  if (idx < 0) return
  const targetIdx = direction === "up" ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= sections.length) return
  const temp = sections[idx].sortOrder
  await prisma.homeSection.update({ where: { id: sections[idx].id }, data: { sortOrder: sections[targetIdx].sortOrder } })
  await prisma.homeSection.update({ where: { id: sections[targetIdx].id }, data: { sortOrder: temp } })
  revalidatePath("/admin/home-sections")
  revalidatePath("/")
}

// Highlight Metrics
export async function getHighlightMetricsAdmin() {
  await requireAdmin()
  return prisma.highlightMetric.findMany({ orderBy: { sortOrder: "asc" } })
}

export async function updateHighlightMetricAdmin(id: string, data: { isVisible?: boolean; label?: string; icon?: string | null; sortOrder?: number; valueMode?: string; manualValue?: string | null }) {
  await requireAdmin()
  const metric = await prisma.highlightMetric.update({ where: { id }, data })
  revalidatePath("/admin/highlights")
  revalidatePath("/")
  return metric
}

export async function moveHighlightMetric(id: string, direction: "up" | "down") {
  await requireAdmin()
  const metrics = await prisma.highlightMetric.findMany({ orderBy: { sortOrder: "asc" } })
  const idx = metrics.findIndex((m) => m.id === id)
  if (idx < 0) return
  const targetIdx = direction === "up" ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= metrics.length) return
  const temp = metrics[idx].sortOrder
  await prisma.highlightMetric.update({ where: { id: metrics[idx].id }, data: { sortOrder: metrics[targetIdx].sortOrder } })
  await prisma.highlightMetric.update({ where: { id: metrics[targetIdx].id }, data: { sortOrder: temp } })
  revalidatePath("/admin/highlights")
  revalidatePath("/")
}

// Hero Overlays
export async function getHeroOverlaysAdmin() {
  await requireAdmin()
  return prisma.heroOverlay.findMany({ orderBy: { sortOrder: "asc" } })
}

export async function updateHeroOverlayAdmin(id: string, data: {
  label?: string; valueType?: string; customValue?: string | null; valueSource?: string | null;
  isVisible?: boolean; desktopVisible?: boolean; mobileVisible?: boolean;
  desktopX?: number; desktopY?: number; mobileX?: number; mobileY?: number;
  width?: string; alignment?: string; opacity?: number; styleVariant?: string; sortOrder?: number;
}) {
  await requireAdmin()
  const overlay = await prisma.heroOverlay.update({ where: { id }, data })
  revalidatePath("/admin/hero-editor")
  revalidatePath("/")
  return overlay
}

export async function createHeroOverlayAdmin(data: {
  key: string; label: string; valueType?: string; customValue?: string | null;
  valueSource?: string | null; isVisible?: boolean; desktopVisible?: boolean;
  mobileVisible?: boolean; desktopX?: number; desktopY?: number;
  mobileX?: number; mobileY?: number; width?: string; alignment?: string;
  opacity?: number; styleVariant?: string; sortOrder?: number;
}) {
  await requireAdmin()
  const maxOrder = await prisma.heroOverlay.findMany({ orderBy: { sortOrder: "desc" }, take: 1 })
  const overlay = await prisma.heroOverlay.create({
    data: { ...data, sortOrder: (maxOrder[0]?.sortOrder ?? -1) + 1 },
  })
  revalidatePath("/admin/hero-editor")
  revalidatePath("/")
  return overlay
}

export async function deleteHeroOverlayAdmin(id: string) {
  await requireAdmin()
  await prisma.heroOverlay.delete({ where: { id } })
  revalidatePath("/admin/hero-editor")
  revalidatePath("/")
}

export async function duplicateHeroOverlayAdmin(id: string) {
  await requireAdmin()
  const source = await prisma.heroOverlay.findUnique({ where: { id } })
  if (!source) throw new Error("Overlay not found")
  const maxOrder = await prisma.heroOverlay.findMany({ orderBy: { sortOrder: "desc" }, take: 1 })
  const overlay = await prisma.heroOverlay.create({
    data: {
      key: `${source.key}-copy-${Date.now()}`,
      label: `${source.label} (Copy)`,
      valueType: source.valueType,
      customValue: source.customValue,
      valueSource: source.valueSource,
      isVisible: source.isVisible,
      desktopVisible: source.desktopVisible,
      mobileVisible: source.mobileVisible,
      desktopX: source.desktopX,
      desktopY: source.desktopY,
      mobileX: source.mobileX,
      mobileY: source.mobileY,
      width: source.width,
      alignment: source.alignment,
      opacity: source.opacity,
      styleVariant: source.styleVariant,
      sortOrder: (maxOrder[0]?.sortOrder ?? -1) + 1,
    },
  })
  revalidatePath("/admin/hero-editor")
  revalidatePath("/")
  return overlay
}

export async function bulkDeleteHeroOverlaysAdmin(ids: string[]) {
  await requireAdmin()
  if (ids.length === 0) throw new Error("No overlays selected")
  if (ids.length > 50) throw new Error("Too many overlays to delete at once")
  
  await prisma.heroOverlay.deleteMany({ where: { id: { in: ids } } })
  revalidatePath("/admin/hero-editor")
  revalidatePath("/")
  return { deleted: ids.length }
}

// Footer Treatments
export async function getFooterTreatments() {
  await requireAdmin()
  return prisma.footerTreatment.findMany({ orderBy: { sortOrder: "asc" } })
}

export async function createFooterTreatment(data: { name: string; url?: string; isVisible?: boolean }) {
  await requireAdmin()
  const maxOrder = await prisma.footerTreatment.findMany({ orderBy: { sortOrder: "desc" }, take: 1 })
  const item = await prisma.footerTreatment.create({
    data: { ...data, sortOrder: (maxOrder[0]?.sortOrder ?? -1) + 1 },
  })
  revalidatePath("/admin/footer")
  revalidatePath("/")
  return item
}

export async function updateFooterTreatment(id: string, data: { name?: string; url?: string | null; isVisible?: boolean; sortOrder?: number }) {
  await requireAdmin()
  const item = await prisma.footerTreatment.update({ where: { id }, data })
  revalidatePath("/admin/footer")
  revalidatePath("/")
  return item
}

export async function deleteFooterTreatment(id: string) {
  await requireAdmin()
  await prisma.footerTreatment.delete({ where: { id } })
  revalidatePath("/admin/footer")
  revalidatePath("/")
}

export async function moveFooterTreatment(id: string, direction: "up" | "down") {
  await requireAdmin()
  const items = await prisma.footerTreatment.findMany({ orderBy: { sortOrder: "asc" } })
  const idx = items.findIndex((i) => i.id === id)
  if (idx < 0) return
  const targetIdx = direction === "up" ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= items.length) return
  const temp = items[idx].sortOrder
  await prisma.footerTreatment.update({ where: { id: items[idx].id }, data: { sortOrder: items[targetIdx].sortOrder } })
  await prisma.footerTreatment.update({ where: { id: items[targetIdx].id }, data: { sortOrder: temp } })
  revalidatePath("/admin/footer")
  revalidatePath("/")
}

// Footer Locations
export async function getFooterLocations() {
  await requireAdmin()
  return prisma.footerLocation.findMany({ orderBy: { sortOrder: "asc" } })
}

export async function createFooterLocation(data: { title: string; hospitalName?: string; address?: string; visitingDays?: string; visitingHours?: string; appointmentPhone?: string; mapsUrl?: string; mapsEmbedUrl?: string; ctaLabel?: string; isPrimary?: boolean; isVisible?: boolean }) {
  await requireAdmin()
  const maxOrder = await prisma.footerLocation.findMany({ orderBy: { sortOrder: "desc" }, take: 1 })
  const item = await prisma.footerLocation.create({
    data: { ...data, sortOrder: (maxOrder[0]?.sortOrder ?? -1) + 1 },
  })
  revalidatePath("/admin/footer")
  revalidatePath("/")
  revalidatePath("/contact")
  return item
}

export async function updateFooterLocation(id: string, data: { title?: string; hospitalName?: string | null; address?: string | null; visitingDays?: string | null; visitingHours?: string | null; appointmentPhone?: string | null; mapsUrl?: string | null; mapsEmbedUrl?: string | null; ctaLabel?: string | null; icon?: string | null; isPrimary?: boolean; isVisible?: boolean; sortOrder?: number }) {
  await requireAdmin()
  const item = await prisma.footerLocation.update({ where: { id }, data })
  revalidatePath("/admin/footer")
  revalidatePath("/")
  revalidatePath("/contact")
  return item
}

export async function deleteFooterLocation(id: string) {
  await requireAdmin()
  await prisma.footerLocation.delete({ where: { id } })
  revalidatePath("/admin/footer")
  revalidatePath("/")
}

export async function moveFooterLocation(id: string, direction: "up" | "down") {
  await requireAdmin()
  const items = await prisma.footerLocation.findMany({ orderBy: { sortOrder: "asc" } })
  const idx = items.findIndex((i) => i.id === id)
  if (idx < 0) return
  const targetIdx = direction === "up" ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= items.length) return
  const temp = items[idx].sortOrder
  await prisma.footerLocation.update({ where: { id: items[idx].id }, data: { sortOrder: items[targetIdx].sortOrder } })
  await prisma.footerLocation.update({ where: { id: items[targetIdx].id }, data: { sortOrder: temp } })
  revalidatePath("/admin/footer")
  revalidatePath("/")
}

// Footer Settings
export async function getFooterSettings() {
  await requireAdmin()
  return prisma.footerSetting.findFirst()
}

export async function updateFooterSettings(data: {
  profileEnabled?: boolean; profileImage?: string | null; profileName?: string | null;
  profileTitle?: string | null; profileBio?: string | null; useMainProfile?: boolean;
  navigationEnabled?: boolean; treatmentsEnabled?: boolean; locationsEnabled?: boolean;
  socialLinksEnabled?: boolean; copyrightText?: string | null; brandText?: string;
  chamberSectionEyebrow?: string | null; chamberSectionHeading?: string | null; chamberSectionSupport?: string | null;
}) {
  await requireAdmin()
  const existing = await prisma.footerSetting.findFirst()
  const payload = { ...data, brandText: data.brandText ?? undefined }
  if (existing) {
    await prisma.footerSetting.update({ where: { id: existing.id }, data: payload })
  } else {
    await prisma.footerSetting.create({ data: payload })
  }
  revalidatePath("/admin/footer")
  revalidatePath("/")
  return { success: true }
}

// Social Links (dedicated management)
export async function getSocialLinksAdmin() {
  await requireAdmin()
  return prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } })
}

export async function createSocialLinkAdmin(data: { platform: string; label: string; url: string; icon?: string; iconKey?: string; hoverColor?: string; isVisible?: boolean }) {
  await requireAdmin()
  const maxOrder = await prisma.socialLink.findMany({ orderBy: { sortOrder: "desc" }, take: 1 })
  const createData: Record<string, unknown> = {
    platform: data.platform,
    label: data.label,
    url: data.url,
    sortOrder: (maxOrder[0]?.sortOrder ?? -1) + 1,
  }
  if (data.icon) createData.icon = data.icon
  if (data.iconKey) createData.iconKey = data.iconKey
  if (data.hoverColor) createData.hoverColor = data.hoverColor
  if (data.isVisible !== undefined) createData.isVisible = data.isVisible
  const item = await prisma.socialLink.create({ data: createData as never })
  revalidatePath("/admin/footer")
  revalidatePath("/")
  return item
}

export async function updateSocialLinkAdmin(id: string, data: { platform?: string; label?: string; url?: string; icon?: string | null; iconKey?: string | null; hoverColor?: string | null; isVisible?: boolean; sortOrder?: number }) {
  await requireAdmin()
  const item = await prisma.socialLink.update({ where: { id }, data })
  revalidatePath("/admin/footer")
  revalidatePath("/")
  return item
}

export async function deleteSocialLinkAdmin(id: string) {
  await requireAdmin()
  await prisma.socialLink.delete({ where: { id } })
  revalidatePath("/admin/footer")
  revalidatePath("/")
}

export async function moveSocialLinkAdmin(id: string, direction: "up" | "down") {
  await requireAdmin()
  const items = await prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } })
  const idx = items.findIndex((i) => i.id === id)
  if (idx < 0) return
  const targetIdx = direction === "up" ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= items.length) return
  const temp = items[idx].sortOrder
  await prisma.socialLink.update({ where: { id: items[idx].id }, data: { sortOrder: items[targetIdx].sortOrder } })
  await prisma.socialLink.update({ where: { id: items[targetIdx].id }, data: { sortOrder: temp } })
  revalidatePath("/admin/footer")
  revalidatePath("/")
}

// Home Spotlight
export async function getSpotlightSetting() {
  return prisma.homeSpotlightSetting.findFirst()
}

export async function updateSpotlightSetting(data: {
  eyebrow?: string; heading?: string; supportingText?: string;
  primaryCtaLabel?: string; primaryCtaDestination?: string; primaryCtaVisible?: boolean;
  secondaryCtaLabel?: string; secondaryCtaDestination?: string; secondaryCtaVisible?: boolean;
  backgroundImage?: string | null; backgroundOverlayStrength?: number;
  collageStyle?: string; frameStyle?: string; collageHeight?: string;
}) {
  await requireAdmin()
  const existing = await prisma.homeSpotlightSetting.findFirst()
  if (existing) {
    await prisma.homeSpotlightSetting.update({ where: { id: existing.id }, data })
  } else {
    await prisma.homeSpotlightSetting.create({ data })
  }
  revalidatePath("/admin/home")
  revalidatePath("/")
}

export async function getSpotlightImages() {
  return prisma.homeSpotlightImage.findMany({ orderBy: { sortOrder: "asc" } })
}

export async function updateSpotlightImage(id: string, data: { mediaUrl?: string | null; altText?: string | null; caption?: string | null; isVisible?: boolean; isLocked?: boolean; sortOrder?: number; rotation?: number; sizeVariant?: string; frameWidth?: string; frameHeight?: string; offsetX?: string; offsetY?: string; xPercent?: number; yPercent?: number; widthPercent?: number; heightPercent?: number; zIndex?: number; framePreset?: string; shadowPreset?: string; mobileXPercent?: number | null; mobileYPercent?: number | null; mobileWidthPercent?: number | null; mobileHeightPercent?: number | null; mobileRotation?: number | null }) {
  await requireAdmin()
  const item = await prisma.homeSpotlightImage.update({ where: { id }, data })
  revalidatePath("/admin/home")
  revalidatePath("/")
  return item
}

export async function moveSpotlightImage(id: string, direction: "up" | "down") {
  await requireAdmin()
  const items = await prisma.homeSpotlightImage.findMany({ orderBy: { sortOrder: "asc" } })
  const idx = items.findIndex((i) => i.id === id)
  if (idx < 0) return
  const targetIdx = direction === "up" ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= items.length) return
  const temp = items[idx].sortOrder
  await prisma.homeSpotlightImage.update({ where: { id: items[idx].id }, data: { sortOrder: items[targetIdx].sortOrder } })
  await prisma.homeSpotlightImage.update({ where: { id: items[targetIdx].id }, data: { sortOrder: temp } })
  revalidatePath("/admin/home")
  revalidatePath("/")
}

type SpotlightImageData = {
  id: string; mediaUrl?: string | null; altText?: string | null; caption?: string | null;
  isVisible?: boolean; isLocked?: boolean; sortOrder?: number; rotation?: number; sizeVariant?: string;
  frameWidth?: string; frameHeight?: string; offsetX?: string; offsetY?: string;
  xPercent?: number; yPercent?: number; widthPercent?: number; heightPercent?: number; zIndex?: number;
  framePreset?: string; shadowPreset?: string;
  mobileXPercent?: number | null; mobileYPercent?: number | null;
  mobileWidthPercent?: number | null; mobileHeightPercent?: number | null; mobileRotation?: number | null;
}

/** Editor-local ids for photos that have never been persisted. See spotlight-admin. */
const isLocalSpotlightId = (id: string) => id.startsWith(SPOTLIGHT_LOCAL_ID_PREFIX)

/**
 * Atomic Spotlight save.
 *
 * The editor keeps add / delete / duplicate local until Save, so this is the only
 * place Spotlight rows change. One interactive transaction reconciles the whole
 * composition — setting upsert, removal of dropped rows, update of existing rows,
 * creation of new ones — so a failure on any image rolls the setting back too and
 * never leaves a half-saved Spotlight.
 *
 * Returns the id each editor row was persisted as, so the client can rebase its
 * local ids without re-fetching.
 */
export async function saveAllSpotlight(setting: {
  eyebrow?: string; heading?: string; supportingText?: string;
  primaryCtaLabel?: string; primaryCtaDestination?: string; primaryCtaVisible?: boolean;
  secondaryCtaLabel?: string; secondaryCtaDestination?: string; secondaryCtaVisible?: boolean;
  backgroundImage?: string | null; backgroundOverlayStrength?: number;
  collageStyle?: string; frameStyle?: string; collageHeight?: string;
}, images: SpotlightImageData[]) {
  await requireAdmin()

  // Presets are geometry starters only; the persisted render mode is always the
  // saved free-form geometry.
  const settingData = { ...setting, collageStyle: "freeform" }

  const result = await prisma.$transaction(async (tx) => {
    const existingSetting = await tx.homeSpotlightSetting.findFirst({ select: { id: true } })
    if (existingSetting) {
      await tx.homeSpotlightSetting.update({ where: { id: existingSetting.id }, data: settingData })
    } else {
      await tx.homeSpotlightSetting.create({ data: settingData })
    }

    const existingRows = await tx.homeSpotlightImage.findMany({ select: { id: true } })
    const existingIds = new Set(existingRows.map((r) => r.id))
    const keptIds = new Set(images.map((i) => i.id).filter((id) => !isLocalSpotlightId(id)))
    const removedIds = [...existingIds].filter((id) => !keptIds.has(id))
    if (removedIds.length > 0) {
      await tx.homeSpotlightImage.deleteMany({ where: { id: { in: removedIds } } })
    }

    const idMap: { localId: string; id: string }[] = []
    for (let index = 0; index < images.length; index++) {
      const { id, ...rest } = images[index]
      const data = { ...rest, sortOrder: index }
      if (!isLocalSpotlightId(id) && existingIds.has(id)) {
        await tx.homeSpotlightImage.update({ where: { id }, data })
        idMap.push({ localId: id, id })
      } else {
        // A row deleted in the editor and restored with Undo keeps its original id.
        const created = await tx.homeSpotlightImage.create({
          data: isLocalSpotlightId(id) ? data : { ...data, id },
        })
        idMap.push({ localId: id, id: created.id })
      }
    }
    return { images: idMap }
  }, { timeout: 20000, maxWait: 10000 })

  revalidatePath("/")
  revalidatePath("/admin/spotlight")
  revalidatePath("/admin/home")
  return result
}
