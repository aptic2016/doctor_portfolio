import { Experience, Profile } from "@prisma/client"
import { profileService } from "@/services/profile/profile.service"
import { contentService } from "@/services/content/content.service"
import { MapPin, Building2 } from "lucide-react"

export default async function ExperiencePage() {
  let profile: Profile | null = null
  let experience: Experience[] = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) {
      experience = await contentService.getExperience(profile.id)
    }
  } catch {
    profile = null
    experience = []
  }

  if (!profile) return <div>Profile not found</div>

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Career</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Professional Experience</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A chronological overview of my career journey and professional milestones
          </p>
        </div>

        <div className="relative space-y-8">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />

          {experience.map((exp) => (
            <div key={exp.id} className="relative md:pl-16">
              <div className={`absolute left-4 top-6 rounded-full border-2 hidden md:block ${exp.isCurrent ? "w-5 h-5 left-[10px] bg-primary border-primary shadow-[0_0_8px_var(--primary)]" : "w-4 h-4 bg-background border-border"}`} />

              <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{exp.jobTitle}</h3>
                    <div className="flex items-center gap-2 text-primary font-medium mt-1">
                      <Building2 className="h-4 w-4" />
                      <span>{exp.organization}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
                    {exp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {exp.location}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {new Date(exp.startDate).getFullYear()} -{" "}
                      {exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : ""}
                    </span>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{exp.description}</p>
                )}
                {exp.responsibilities && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{exp.responsibilities}</p>
                )}
                {exp.isCurrent && (
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Current Position
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {experience.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No experience listed yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
