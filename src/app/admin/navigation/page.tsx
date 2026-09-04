import { NavigationAdmin } from "./navigation-admin"
import { settingsService } from "@/services/settings/settings.service"

export default async function AdminNavigationPage() {
  const items = await settingsService.getAllNavigation().catch(() => [])

  return <NavigationAdmin initialItems={items} />
}
