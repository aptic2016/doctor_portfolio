import { profileService } from "@/services/profile/profile.service"
import { contentService } from "@/services/content/content.service"
import { settingsService } from "@/services/settings/settings.service"
import { AdminExperiencePage } from "./experience-form"

import type { Profile, Experience } from "@prisma/client"

export default async function Page() {
  let profile: Profile | null = null
  let experience: Experience[] = []
  let sectionVisual: { id: string; sectionId: string; heading: string | null; mediaUrl: string | null; mediaAltText: string | null; mediaPosition: string; showMedia: boolean } | null = null
  try {
    const [p, visual] = await Promise.all([
      profileService.getPublicProfile(),
      settingsService.getHomeSectionBySectionId("EXPERIENCE_HIGHLIGHTS").catch(() => null),
    ])
    profile = p
    sectionVisual = visual ?? null
    if (profile) {
      experience = await contentService.getExperience(profile.id)
    }
  } catch {
    profile = null
  }
  if (!profile) return <div className="p-8">Profile not found.</div>

  return <AdminExperiencePage initialData={experience} sectionVisual={sectionVisual} />
}
