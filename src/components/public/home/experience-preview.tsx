import React from "react"
import Link from "next/link"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowRight, Building2 } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"

export async function ExperiencePreview({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean } }) {
  let profile = null
  let experience: Awaited<ReturnType<typeof contentService.getVisibleExperience>> = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) experience = await contentService.getVisibleExperience(profile.id)
  } catch { return null }
  if (experience.length === 0) return null

  return (
    <section className="py-14 md:py-18 lg:py-20 section-base">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <SectionHeading section={section} defaultEyebrow="Career" defaultHeading="Professional Journey" />
          </RevealSection>
          <div className="relative pl-10 lg:pl-12">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border/60" />
            <div className="space-y-5">
              {experience.slice(0, 3).map((exp) => (
                <RevealSection key={exp.id}>
                  <div className="group relative">
                    <div className={`absolute -left-[26px] top-5 rounded-full border-2 ${exp.isCurrent ? "w-4 h-4 -left-[28px] top-[14px] bg-primary border-primary shadow-[0_0_8px_var(--primary)]" : "w-3 h-3 bg-background border-border"}`} />
                    <div className="p-5 rounded-xl border border-border/50 bg-surface/50 hover:border-primary/20 hover:shadow-sm transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">{exp.jobTitle}</h3>
                          <div className="flex items-center gap-1.5 text-primary text-sm font-medium mt-0.5">
                            <Building2 className="h-3.5 w-3.5" />{exp.organization}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                          {exp.location && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{exp.location}</span>}
                          <span className="px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-primary font-semibold">
                            {new Date(exp.startDate).getFullYear()} – {exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : ""}
                          </span>
                        </div>
                      </div>
                      {exp.description && <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>}
                      {exp.isCurrent && <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 mt-2"><span className="h-1 w-1 rounded-full bg-green-500" />Current</span>}
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
            {experience.length > 3 && (
              <RevealSection>
                <div className="mt-6 pl-10 lg:pl-12">
                  <Button variant="outline" className="text-sm h-10 rounded-lg" render={<Link href="/experience" />}>View All Journey<ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
                </div>
              </RevealSection>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
