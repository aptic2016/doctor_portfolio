import { HeroEditorPage } from "./hero-editor"
import { settingsService } from "@/services/settings/settings.service"

export default async function AdminHeroEditorPage() {
  const overlays = await settingsService.getAllHeroOverlays().catch(() => [])
  const brand = await settingsService.getBrandSettings().catch(() => null)

  return <HeroEditorPage initialOverlays={overlays} initialBrand={brand} />
}
