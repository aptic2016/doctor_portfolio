import React from "react"
import Link from "next/link"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"

export async function AchievementsPreview({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean } }) {
  let profile = null
  let achievements: Awaited<ReturnType<typeof contentService.getVisibleAchievements>> = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) achievements = await contentService.getVisibleAchievements(profile.id)
  } catch { return null }
  if (achievements.length === 0) return null

  return (
    <section className="py-14 md:py-18 lg:py-20 section-elevated">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <SectionHeading section={section} defaultEyebrow="Recognition" defaultHeading="Achievements" />
          </RevealSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.slice(0, 3).map((ach, idx) => (
              <RevealSection key={ach.id} delay={idx + 1}>
                <div className="group p-5 rounded-xl border border-border/50 bg-surface/50 hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-foreground">{ach.title}</h3>
                      {ach.certificateUrl && (
                        <a href={ach.certificateUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1.5 rounded-md border border-border/50 text-muted-foreground hover:text-foreground transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    {ach.awardingOrganization && <p className="text-xs text-primary font-medium">{ach.awardingOrganization}</p>}
                    {ach.description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{ach.description}</p>}
                    {ach.date && <p className="text-xs text-muted-foreground font-semibold">{new Date(ach.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>}
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
          {achievements.length > 3 && <RevealSection><div className="mt-6"><Button variant="outline" className="text-sm h-10 rounded-lg" render={<Link href="/achievements" />}>View All Recognition<ArrowRight className="h-3.5 w-3.5 ml-1" /></Button></div></RevealSection>}
        </div>
      </div>
    </section>
  )
}
