import React from "react"
import Link from "next/link"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { settingsService } from "@/services/settings/settings.service"
import { buttonVariants } from "@/components/ui/button"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"
import { GalleryPreviewGrid } from "./gallery-preview-grid"
import { HOME_GALLERY_LIMIT, toGalleryPhotos } from "@/components/public/gallery/gallery-photos"

/**
 * HOME GALLERY SECTION — a curated teaser, never the whole collection.
 *
 * Stays a server component: it reads the same visible gallery items in the same
 * admin sort order as the gallery page, trims them to the configured home limit and
 * hands plain data to the client grid that owns the lightbox.
 */
export async function GalleryPreview({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean } }) {
  let profile = null
  let gallery: Awaited<ReturnType<typeof contentService.getVisibleGalleryItems>> = []
  let homeLimit: number = HOME_GALLERY_LIMIT
  try {
    /* One round trip for all three reads. A missing site-settings row is not
       fatal — the teaser just falls back to the shared default count. */
    const [profileResult, galleryResult, siteSettings] = await Promise.all([
      profileService.getPublicProfile(),
      contentService.getVisibleGalleryItems(),
      settingsService.getSiteSettings().catch(() => null),
    ])
    profile = profileResult
    gallery = galleryResult
    homeLimit = siteSettings?.galleryHomeLimit ?? HOME_GALLERY_LIMIT
  } catch { return null }

  /* No published profile means no public content at all, gallery included. */
  if (!profile) return null

  const photos = toGalleryPhotos(gallery).slice(0, homeLimit)
  if (photos.length === 0) return null

  return (
    <section className="py-10 md:py-14 lg:py-16 section-base">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <SectionHeading section={section} defaultEyebrow="Moments" defaultHeading="Gallery" />
          </RevealSection>

          <GalleryPreviewGrid photos={photos} />

          <RevealSection>
            <div className="mt-6 flex justify-center">
              <Link
                href="/gallery"
                className={buttonVariants({ variant: "outline", className: "text-sm h-10 rounded-lg" })}
              >
                More
              </Link>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  )
}
