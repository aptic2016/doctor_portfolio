import { AppearanceAdmin } from "./appearance-admin"
import { settingsService } from "@/services/settings/settings.service"
import type { BrandSettings, ThemeSettings, SiteSettings } from "@prisma/client"

export default async function AdminAppearancePage() {
  let brandSettings: BrandSettings | null = null
  let themeSettings: ThemeSettings | null = null
  let siteSettings: SiteSettings | null = null
  try {
    ;[brandSettings, themeSettings, siteSettings] = await Promise.all([
      settingsService.getBrandSettings(),
      settingsService.getThemeSettings(),
      settingsService.getSiteSettings(),
    ])
  } catch {
    // Database unavailable at build time
  }

  return (
    <AppearanceAdmin
      initialBrandSettings={brandSettings}
      initialThemeSettings={themeSettings}
      initialSiteSettings={siteSettings}
    />
  )
}
