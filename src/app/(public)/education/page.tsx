import { Education, Profile } from "@prisma/client"
import { profileService } from "@/services/profile/profile.service"
import { contentService } from "@/services/content/content.service"
import { GraduationCap, Award } from "lucide-react"

export default async function EducationPage() {
  let profile: Profile | null = null
  let education: Education[] = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) {
      education = await contentService.getEducation(profile.id)
    }
  } catch {
    profile = null
    education = []
  }

  if (!profile) return <div>Profile not found</div>

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Academic Background</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Education</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Academic qualifications and training that have shaped my clinical practice
          </p>
        </div>

        <div className="space-y-6">
          {education.map((edu) => (
            <div key={edu.id} className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary/10 shrink-0 mt-0.5">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2 min-w-0 flex-grow">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {edu.degree}
                  </h3>
                  <p className="text-base font-medium text-primary">{edu.institution}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {new Date(edu.startDate).getFullYear()} -{" "}
                      {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                    </span>
                    {edu.result && (
                      <>
                        <span className="text-border">|</span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {edu.result}
                        </span>
                      </>
                    )}
                  </div>
                  {edu.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{edu.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {education.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No education listed yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
