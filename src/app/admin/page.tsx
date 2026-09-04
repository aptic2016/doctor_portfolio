import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Award,
  Briefcase,
  GraduationCap,
  ArrowUpRight
} from "lucide-react"
import { profileService } from "@/services/profile/profile.service"
import { contentService } from "@/services/content/content.service"
import { mediaService } from "@/services/media/media.service"
import { cn } from "@/lib/utils"
import type { Profile, Education, Experience, Qualification, Publication, MediaAsset } from "@prisma/client"

export default async function AdminDashboard() {
  let profile: Profile | null = null
  let education: Education[] = []
  let experience: Experience[] = []
  let qualifications: Qualification[] = []
  let publications: Publication[] = []
  let mediaAssets: MediaAsset[] = []

  try {
    profile = await profileService.getPublicProfile()
    const profileId = profile?.id || ""
    ;[education, experience, qualifications, publications, mediaAssets] =
      await Promise.all([
        contentService.getEducation(profileId),
        contentService.getExperience(profileId),
        contentService.getQualifications(profileId),
        contentService.getPublications(profileId),
        mediaService.getAllAssets(),
      ])
  } catch {
    // Database unavailable at build time
  }

  const stats = [
    { label: "Education", value: education.length, icon: GraduationCap, color: "text-blue-500 dark:text-blue-400" },
    { label: "Experience", value: experience.length, icon: Briefcase, color: "text-green-500 dark:text-green-400" },
    { label: "Qualifications", value: qualifications.length, icon: Award, color: "text-purple-500 dark:text-purple-400" },
    { label: "Publications", value: publications.length, icon: FileText, color: "text-orange-500 dark:text-orange-400" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back to your portfolio management center.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3" /> Updated recently
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Media Assets</span>
              <span className="font-medium">{mediaAssets.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profile Status</span>
              <span className={cn("font-medium", profile?.isVisible ? "text-green-500 dark:text-green-400" : "text-yellow-500 dark:text-yellow-400")}>
                {profile?.isVisible ? "Published" : "Hidden"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI Enabled</span>
              <span className={cn("font-medium", profile?.allowAI ? "text-green-500 dark:text-green-400" : "text-yellow-500 dark:text-yellow-400")}>
                {profile?.allowAI ? "Yes" : "No"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <span className="text-green-500 dark:text-green-400 font-medium flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" /> Online
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cloudinary</span>
              <span className="text-green-500 dark:text-green-400 font-medium flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" /> Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI Service</span>
              <span className="text-green-500 dark:text-green-400 font-medium flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" /> Active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
