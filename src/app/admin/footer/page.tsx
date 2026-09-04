import { FooterAdmin } from "./footer-admin"
import { prisma } from "@/lib/db"
import { settingsService } from "@/services/settings/settings.service"

export default async function AdminFooterPage() {
  const [treatments, locations, settings, socialLinks, profile, brandSettings] = await Promise.all([
    prisma.footerTreatment.findMany({ orderBy: { sortOrder: "asc" } }).catch(() => []),
    prisma.footerLocation.findMany({ orderBy: { sortOrder: "asc" } }).catch(() => []),
    prisma.footerSetting.findFirst().catch(() => null),
    settingsService.getAllSocialLinks().catch(() => []),
    (await import("@/services/profile/profile.service")).profileService.getPublicProfile().catch(() => null),
    settingsService.getBrandSettings().catch(() => null),
  ])

  return (
    <FooterAdmin
      initialTreatments={treatments}
      initialLocations={locations}
      initialSettings={settings}
      initialSocialLinks={socialLinks}
      profile={profile}
      brandSettings={brandSettings}
    />
  )
}
