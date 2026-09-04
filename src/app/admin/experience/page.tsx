import { profileService } from "@/services/profile/profile.service"
import { contentService } from "@/services/content/content.service"
import { AdminExperiencePage } from "./experience-form"

import type { Profile, Experience } from "@prisma/client"

export default async function Page() {
  let profile: Profile | null = null
  let experience: Experience[] = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) {
      experience = await contentService.getExperience(profile.id)
    }
  } catch {
    profile = null
  }
  if (!profile) return <div className="p-8">Profile not found.</div>

  return <AdminExperiencePage initialData={experience} />
}
