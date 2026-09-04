import { Metadata } from "next"
import { Achievement, Profile } from "@prisma/client"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { Trophy, Calendar, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "Achievements",
  description: "Awards, honors, and achievements",
}

export default async function AchievementsPage() {
  let profile: Profile | null = null
  let achievements: Achievement[] = []
  try {
    profile = await profileService.getPublicProfile()
    achievements = profile
      ? await contentService.getVisibleAchievements(profile.id)
      : []
  } catch {
    profile = null
    achievements = []
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Recognition</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Achievements</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Awards, honours, and professional milestones
          </p>
        </div>

        {achievements.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No achievements to display.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map((item) => (
              <div key={item.id} className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 shrink-0 mt-0.5">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2 min-w-0 flex-grow">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                    {item.awardingOrganization && (
                      <p className="text-sm font-medium text-primary">{item.awardingOrganization}</p>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3">
                      {item.certificateUrl && (
                        <a href={item.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          View Certificate <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {item.externalUrl && (
                        <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          Learn More <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
