import { GalleryAdmin } from "./gallery-admin"
import { contentService } from "@/services/content/content.service"

export default async function AdminGalleryPage() {
  let galleryItems: Awaited<ReturnType<typeof contentService.getGalleryItems>> = []
  try {
    galleryItems = await contentService.getGalleryItems()
  } catch {
    galleryItems = []
  }

  return <GalleryAdmin initialData={galleryItems} />
}
