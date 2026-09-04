import React from "react"
import Link from "next/link"
import Image from "next/image"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"

export async function GalleryPreview({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean } }) {
  let profile = null
  let gallery: Awaited<ReturnType<typeof contentService.getVisibleGalleryItems>> = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) gallery = await contentService.getVisibleGalleryItems()
  } catch { return null }
  if (gallery.length === 0) return null

  return (
    <section className="py-14 md:py-18 lg:py-20 section-base">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <SectionHeading section={section} defaultEyebrow="Moments" defaultHeading="Gallery" />
          </RevealSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gallery.slice(0, 8).map((item, idx) => (
              <RevealSection key={item.id} delay={idx < 4 ? 1 : 2}>
                <div className={`group relative rounded-xl overflow-hidden border border-border/30 ${idx === 0 ? "col-span-2 row-span-2" : ""}`}>
                  <div className={`relative ${idx === 0 ? "aspect-square" : "aspect-[4/3]"}`}>
                    {item.mediaAsset?.secureUrl ? (
                      <Image src={item.mediaAsset.secureUrl} alt={item.mediaAsset.altText || item.caption || "Gallery"} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground/30 text-xs">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {(item.caption || item.category) && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-xs font-semibold text-white truncate">{item.caption || item.category}</p>
                    </div>
                  )}
                </div>
              </RevealSection>
            ))}
          </div>
          {gallery.length > 8 && <RevealSection><div className="mt-6"><Button variant="outline" className="text-sm h-10 rounded-lg" render={<Link href="/gallery" />}>View Full Gallery<ArrowRight className="h-3.5 w-3.5 ml-1" /></Button></div></RevealSection>}
        </div>
      </div>
    </section>
  )
}
