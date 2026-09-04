import React from "react"
import Link from "next/link"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"

export async function QualificationsPreview({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean } }) {
  let profile = null
  let qualifications: Awaited<ReturnType<typeof contentService.getVisibleQualifications>> = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) qualifications = await contentService.getVisibleQualifications(profile.id)
  } catch { return null }
  if (qualifications.length === 0) return null

  const now = new Date()

  return (
    <section className="py-14 md:py-18 lg:py-20 section-surface">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <SectionHeading section={section} defaultEyebrow="Credentials" defaultHeading="Qualifications" />
          </RevealSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {qualifications.slice(0, 6).map((q, idx) => {
              const expiry = q.expiryDate ? new Date(q.expiryDate) : null
              const daysLeft = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / 86400000) : null
              const isExpiring = daysLeft !== null && daysLeft > 0 && daysLeft < 90
              const isExpired = daysLeft !== null && daysLeft <= 0

              return (
                <RevealSection key={q.id} delay={idx < 3 ? 1 : 2}>
                  <div className={`group relative p-4 rounded-xl border bg-surface/50 hover:shadow-sm transition-all ${isExpired ? "border-destructive/20 hover:border-destructive/30" : isExpiring ? "border-yellow-500/20 hover:border-yellow-500/30" : "border-border/50 hover:border-primary/20"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isExpired ? "bg-destructive/10 text-destructive" : isExpiring ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "bg-primary/10 text-primary"}`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h3 className="text-base font-semibold text-foreground">{q.title}</h3>
                        {q.issuingOrganization && <p className="text-xs text-primary font-medium">{q.issuingOrganization}</p>}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {q.issueDate && <span>Issued {new Date(q.issueDate).getFullYear()}</span>}
                          {daysLeft !== null && daysLeft > 0 && <span className={isExpiring ? "text-yellow-600 dark:text-yellow-400 font-semibold" : ""}>Expires in {daysLeft} days</span>}
                          {isExpired && <span className="text-destructive font-semibold">Expired</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </RevealSection>
              )
            })}
          </div>
          {qualifications.length > 6 && <RevealSection><div className="mt-6"><Button variant="outline" className="text-sm h-10 rounded-lg" render={<Link href="/qualifications" />}>View All Credentials<ArrowRight className="h-3.5 w-3.5 ml-1" /></Button></div></RevealSection>}
        </div>
      </div>
    </section>
  )
}
