import { GalleryAdmin } from "./gallery-admin"
import { contentService } from "@/services/content/content.service"
import { settingsService } from "@/services/settings/settings.service"

export default async function AdminGalleryPage() {
  let galleryItems: Awaited<ReturnType<typeof contentService.getGalleryItems>> = []
  let galleryHomeLimit = 6
  try {
    const [items, siteSettings] = await Promise.all([
      contentService.getGalleryItems(),
      settingsService.getSiteSettings().catch(() => null),
    ])
    galleryItems = items
    galleryHomeLimit = siteSettings?.galleryHomeLimit ?? 6
  } catch {
    galleryItems = []
  }

  return <GalleryAdmin initialData={galleryItems} initialHomeLimit={galleryHomeLimit} />
}
