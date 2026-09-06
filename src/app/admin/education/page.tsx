import { profileService } from "@/services/profile/profile.service"
import { contentService } from "@/services/content/content.service"
import { settingsService } from "@/services/settings/settings.service"
import { AdminEducationPage } from "./education-form"

import type { Profile, Education } from "@prisma/client"

export default async function Page() {
  let profile: Profile | null = null
  let education: Education[] = []
  let sectionVisual: { id: string; sectionId: string; heading: string | null; mediaUrl: string | null; mediaAltText: string | null; mediaPosition: string; showMedia: boolean } | null = null
  try {
    const [p, visual] = await Promise.all([
      profileService.getPublicProfile(),
      settingsService.getHomeSectionBySectionId("EDUCATION_HIGHLIGHTS").catch(() => null),
    ])
    profile = p
    sectionVisual = visual ?? null
    if (profile) {
      education = await contentService.getEducation(profile.id)
    }
  } catch {
    profile = null
  }
  if (!profile) return <div className="p-8">Profile not found.</div>

  return <AdminEducationPage initialData={education} sectionVisual={sectionVisual} />
}
