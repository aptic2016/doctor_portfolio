import { settingsService } from "@/services/settings/settings.service"
import { profileService } from "@/services/profile/profile.service"
import { HomeAdmin } from "./home-admin"

export default async function AdminHomePage() {
  const sections = await settingsService.getHomeSections().catch(() => [])
  const brand = await settingsService.getBrandSettings().catch(() => null)
  const profile = await profileService.getPublicProfile().catch(() => null)
  const highlights = await settingsService.getAllHighlightMetrics().catch(() => [])

  return (
    <HomeAdmin
      initialSections={sections}
      initialBrand={brand}
      initialProfile={profile}
      initialHighlights={highlights}
    />
  )
}
