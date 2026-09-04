import React from "react"
import Link from "next/link"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { Button } from "@/components/ui/button"
import { GraduationCap, ArrowRight, Award } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"

export async function EducationPreview({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean } }) {
  let profile = null
  let education: Awaited<ReturnType<typeof contentService.getVisibleEducation>> = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) education = await contentService.getVisibleEducation(profile.id)
  } catch { return null }
  if (education.length === 0) return null

  return (
    <section className="py-14 md:py-18 lg:py-20 section-elevated">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <SectionHeading section={section} defaultEyebrow="Academic" defaultHeading="Education" />
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {education.slice(0, 4).map((edu, idx) => (
              <RevealSection key={edu.id} delay={idx < 2 ? 1 : 2}>
                <div className="group p-5 rounded-xl border border-border/50 bg-surface/50 hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 shrink-0 mt-0.5"><GraduationCap className="h-4 w-4 text-primary" /></div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground">{edu.degree}</h3>
                      <p className="text-sm font-medium text-primary">{edu.institution}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(edu.startDate).getFullYear()} – {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}</span>
                        {edu.result && <><span className="text-border">&middot;</span><span className="flex items-center gap-0.5"><Award className="h-2.5 w-2.5" />{edu.result}</span></>}
                      </div>
                      {edu.description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{edu.description}</p>}
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
          {education.length > 4 && <RevealSection><div className="mt-6"><Button variant="outline" className="text-sm h-10 rounded-lg" render={<Link href="/education" />}>View All Education<ArrowRight className="h-3.5 w-3.5 ml-1" /></Button></div></RevealSection>}
        </div>
      </div>
    </section>
  )
}
