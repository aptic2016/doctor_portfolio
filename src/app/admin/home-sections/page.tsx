import { HomeSectionsAdmin } from "./home-sections-admin"
import { settingsService } from "@/services/settings/settings.service"

export default async function AdminHomeSectionsPage() {
  const sections = await settingsService.getHomeSections().catch(() => [])

  return <HomeSectionsAdmin initialSections={sections} />
}
