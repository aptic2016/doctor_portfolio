import { AchievementsAdmin } from "./achievements-admin"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"

import type { Profile, Achievement } from "@prisma/client"

export default async function AdminAchievementsPage() {
  let profile: Profile | null = null
  let achievements: Achievement[] = []
  try {
    profile = await profileService.getPublicProfile()
    achievements = profile ? await contentService.getAchievements(profile.id) : []
  } catch {
    achievements = []
  }

  return <AchievementsAdmin initialData={achievements} />
}
