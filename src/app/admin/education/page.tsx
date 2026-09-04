import { profileService } from "@/services/profile/profile.service"
import { contentService } from "@/services/content/content.service"
import { AdminEducationPage } from "./education-form"

import type { Profile, Education } from "@prisma/client"

export default async function Page() {
  let profile: Profile | null = null
  let education: Education[] = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) {
      education = await contentService.getEducation(profile.id)
    }
  } catch {
    profile = null
  }
  if (!profile) return <div className="p-8">Profile not found.</div>

  return <AdminEducationPage initialData={education} />
}
