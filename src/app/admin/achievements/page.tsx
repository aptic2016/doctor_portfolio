import { AchievementsAdmin } from "./achievements-admin"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { settingsService } from "@/services/settings/settings.service"

import type { Profile, Achievement } from "@prisma/client"

export default async function AdminAchievementsPage() {
  let profile: Profile | null = null
  let achievements: Achievement[] = []
  let sectionVisual: { id: string; sectionId: string; heading: string | null; mediaUrl: string | null; mediaAltText: string | null; mediaPosition: string; showMedia: boolean } | null = null
  try {
    const [p, visual] = await Promise.all([
      profileService.getPublicProfile(),
      settingsService.getHomeSectionBySectionId("ACHIEVEMENTS").catch(() => null),
    ])
    profile = p
    sectionVisual = visual ?? null
    achievements = profile ? await contentService.getAchievements(profile.id) : []
  } catch {
    achievements = []
  }

  return <AchievementsAdmin initialData={achievements} sectionVisual={sectionVisual} />
}
