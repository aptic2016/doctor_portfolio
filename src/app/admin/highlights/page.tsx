import { HighlightsAdmin } from "./highlights-admin"
import { settingsService } from "@/services/settings/settings.service"

export default async function AdminHighlightsPage() {
  const metrics = await settingsService.getAllHighlightMetrics().catch(() => [])

  return <HighlightsAdmin initialMetrics={metrics} />
}
