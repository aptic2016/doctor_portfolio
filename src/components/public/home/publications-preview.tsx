import React from "react"
import Link from "next/link"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"

export async function PublicationsPreview({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean } }) {
  let profile = null
  let publications: Awaited<ReturnType<typeof contentService.getVisiblePublications>> = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) publications = await contentService.getVisiblePublications(profile.id)
  } catch { return null }
  if (publications.length === 0) return null

  return (
    <section className="py-14 md:py-18 lg:py-20 section-base">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <SectionHeading section={section} defaultEyebrow="Research" defaultHeading="Publications" />
          </RevealSection>
          <div className="space-y-3">
            {publications.slice(0, 3).map((pub, idx) => (
              <RevealSection key={pub.id} delay={idx + 1}>
                <div className="group flex items-start gap-4 p-5 rounded-xl border border-border/50 bg-surface/50 hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="text-sm font-bold text-primary/40 tabular-nums shrink-0 mt-0.5">{String(idx + 1).padStart(2, "0")}</div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-base font-semibold text-foreground leading-snug">{pub.title}</h3>
                    {pub.journal && <p className="text-xs text-primary font-medium italic">{pub.journal}</p>}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {pub.publicationDate && <span>{new Date(pub.publicationDate).getFullYear()}</span>}
                      {pub.doi && <span className="font-mono truncate max-w-[200px]">DOI: {pub.doi}</span>}
                    </div>
                    {pub.abstract && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{pub.abstract}</p>}
                  </div>
                  {pub.externalUrl && (
                    <a href={pub.externalUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </RevealSection>
            ))}
          </div>
          {publications.length > 3 && <RevealSection><div className="mt-6"><Button variant="outline" className="text-sm h-10 rounded-lg" render={<Link href="/publications" />}>View All Research<ArrowRight className="h-3.5 w-3.5 ml-1" /></Button></div></RevealSection>}
        </div>
      </div>
    </section>
  )
}
