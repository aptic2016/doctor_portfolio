import { settingsService } from "@/services/settings/settings.service"
import { SiteSettingsClient } from "./site-settings-client"

export default async function SiteSettingsPage() {
  let siteSettings = null
  try {
    siteSettings = await settingsService.getSiteSettings()
  } catch {
    // Graceful fallback for build/dev without DB
  }

  return <SiteSettingsClient initialSettings={siteSettings} />
}
