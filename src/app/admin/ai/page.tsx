import { AiSettingsAdmin } from "./ai-settings-admin"
import { aiService } from "@/services/ai/ai.service"

export default async function AdminAiPage() {
  let settings: Awaited<ReturnType<typeof aiService.getSettings>> = null
  try {
    settings = await aiService.getSettings()
  } catch {
    settings = null
  }
  return <AiSettingsAdmin initialSettings={settings} />
}
