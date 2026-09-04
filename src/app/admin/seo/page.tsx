import { SeoSettingsAdmin } from "./seo-settings-admin"
import { seoService } from "@/lib/seo/seo.service"
import type { SeoSettings } from "@prisma/client"

export default async function AdminSeoPage() {
  let seoSettings: SeoSettings | null = null
  try {
    seoSettings = await seoService.getSeoSettings()
  } catch {
    seoSettings = null
  }
  return <SeoSettingsAdmin initialSettings={seoSettings} />
}
