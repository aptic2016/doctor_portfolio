import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { buttonVariants } from "@/components/ui/button"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"
import { GalleryPreviewGrid } from "./gallery-preview-grid"
import { HOME_GALLERY_LIMIT, toGalleryPhotos } from "@/components/public/gallery/gallery-photos"

/**
 * HOME GALLERY SECTION — a curated teaser, never the whole collection.
 *
 * Stays a server component: it reads the same visible gallery items in the same
 * admin sort order as the gallery page, trims them to HOME_GALLERY_LIMIT and
 * hands plain data to the client grid that owns the lightbox.
 */
export async function GalleryPreview({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean } }) {
  let profile = null
  let gallery: Awaited<ReturnType<typeof contentService.getVisibleGalleryItems>> = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) gallery = await contentService.getVisibleGalleryItems()
  } catch { return null }

  const photos = toGalleryPhotos(gallery).slice(0, HOME_GALLERY_LIMIT)
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
