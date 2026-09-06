import { settingsService } from "@/services/settings/settings.service"
import { profileService } from "@/services/profile/profile.service"
import { HomeAdmin } from "./home-admin"

export default async function AdminHomePage() {
  const [sections, brand, profile, highlights] = await Promise.all([
    settingsService.getHomeSections().catch(() => []),
    settingsService.getBrandSettings().catch(() => null),
    profileService.getPublicProfile().catch(() => null),
    settingsService.getAllHighlightMetrics().catch(() => []),
  ])

  return (
    <HomeAdmin
      initialSections={sections}
      initialBrand={brand}
      initialProfile={profile}
      initialHighlights={highlights}
    />
  )
}
