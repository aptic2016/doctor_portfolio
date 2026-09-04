import { Metadata } from "next"
import { SiteSettings } from "@prisma/client"
import { contentService } from "@/services/content/content.service"
import { settingsService } from "@/services/settings/settings.service"
import { PublicGallery } from "@/components/public/gallery/public-gallery"

export const metadata: Metadata = {
  title: "Gallery",
  description: "Best moments and highlights",
}

export default async function GalleryPage() {
  let siteSettings: SiteSettings | null = null
  let galleryItems: Awaited<ReturnType<typeof contentService.getVisibleGalleryItems>> = []
  try {
    siteSettings = await settingsService.getSiteSettings()
    if (siteSettings?.galleryEnabled) {
      galleryItems = await contentService.getVisibleGalleryItems()
    }
  } catch {
    siteSettings = null
    galleryItems = []
  }

  if (!siteSettings?.galleryEnabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Gallery is currently unavailable.</p>
      </div>
    )
  }
  const galleryLabel = siteSettings?.galleryLabel || "Gallery"

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Moments</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">{galleryLabel}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A collection of professional moments and highlights
          </p>
        </div>

        {galleryItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No gallery items yet.</p>
          </div>
        ) : (
          <PublicGallery items={galleryItems} />
        )}
      </div>
    </div>
  )
}
