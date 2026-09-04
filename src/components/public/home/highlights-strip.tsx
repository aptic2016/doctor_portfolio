import React from "react"
import { profileService } from "@/services/profile/profile.service"
import { contentService } from "@/services/content/content.service"
import { settingsService } from "@/services/settings/settings.service"
import { Award, BookOpen, GraduationCap, Briefcase, Trophy } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Award, BookOpen, GraduationCap, Briefcase, Trophy,
}

export async function HighlightsStrip() {
  let profile = null
  let metrics: Awaited<ReturnType<typeof settingsService.getVisibleHighlightMetrics>> = []
  let counts: Record<string, number> = {}
  try {
    profile = await profileService.getPublicProfile()
    ;[metrics] = await Promise.all([
      settingsService.getVisibleHighlightMetrics(),
      profile ? Promise.all([
        contentService.getVisibleQualifications(profile.id),
        contentService.getVisibleExperience(profile.id),
        contentService.getVisiblePublications(profile.id),
        contentService.getVisibleAchievements(profile.id),
        contentService.getVisibleEducation(profile.id),
      ]).then(([q, e, p, a, ed]) => {
        counts = { qualifications: q.length, experience: e.length, publications: p.length, achievements: a.length, education: ed.length }
      }) : Promise.resolve(),
    ])
  } catch { return null }

  if (metrics.length === 0) return null

  return (
    <section className="py-6 border-y border-border/30 bg-surface/30">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <RevealSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
            {metrics.map((metric) => {
              const Icon = metric.icon ? ICON_MAP[metric.icon] : Award
              const value = metric.valueMode === "MANUAL" ? (metric.manualValue || "—") : (counts[metric.key] || 0)
              return (
                <div key={metric.key} className="flex items-center gap-2.5 justify-center lg:justify-start">
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                    {Icon && <Icon className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground leading-none">{value}</div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">{metric.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </RevealSection>
      </div>
    </section>
  )
}
