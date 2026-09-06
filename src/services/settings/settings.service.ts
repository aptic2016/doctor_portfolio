import { SettingsRepository } from "@/repositories/settings/settings.repository"
import { BrandSettings, ThemeSettings, SiteSettings, NavigationItem, SocialLink, HomeSection, HomeSectionId, HighlightMetric, HeroOverlay } from "@prisma/client"

export class SettingsService {
  private repository = new SettingsRepository()

  async getBrandSettings(): Promise<BrandSettings | null> {
    return this.repository.getBrandSettings()
  }

  async updateBrandSettings(id: string, data: Partial<BrandSettings>): Promise<BrandSettings> {
    return this.repository.updateBrandSettings(id, data)
  }

  async getThemeSettings(): Promise<ThemeSettings | null> {
    return this.repository.getThemeSettings()
  }

  async updateThemeSettings(id: string, data: Partial<ThemeSettings>): Promise<ThemeSettings> {
    return this.repository.updateThemeSettings(id, data)
  }

  async getSiteSettings(): Promise<SiteSettings | null> {
    return this.repository.getSiteSettings()
  }

  async updateSiteSettings(id: string, data: Partial<SiteSettings>): Promise<SiteSettings> {
    return this.repository.updateSiteSettings(id, data)
  }

  async getNavigation(): Promise<NavigationItem[]> {
    return this.repository.getNavigation()
  }

  async getAllNavigation(): Promise<NavigationItem[]> {
    return this.repository.getAllNavigation()
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    return this.repository.getSocialLinks()
  }

  async getAllSocialLinks(): Promise<SocialLink[]> {
    return this.repository.getAllSocialLinks()
  }

  async getHomeSections(): Promise<HomeSection[]> {
    return this.repository.getHomeSections()
  }

  async getHomeSectionBySectionId(sectionId: HomeSectionId): Promise<HomeSection | null> {
    return this.repository.getHomeSectionBySectionId(sectionId)
  }

  async getVisibleHomeSections(): Promise<HomeSection[]> {
    return this.repository.getVisibleHomeSections()
  }

  async getAllHighlightMetrics(): Promise<HighlightMetric[]> {
    return this.repository.getAllHighlightMetrics()
  }

  async getVisibleHighlightMetrics(): Promise<HighlightMetric[]> {
    return this.repository.getVisibleHighlightMetrics()
  }

  async updateHighlightMetric(id: string, data: Partial<HighlightMetric>): Promise<HighlightMetric> {
    return this.repository.updateHighlightMetric(id, data)
  }

  async updateManyHighlightMetrics(updates: { id: string; data: Partial<HighlightMetric> }[]): Promise<void> {
    return this.repository.updateManyHighlightMetrics(updates)
  }

  async getAllHeroOverlays(): Promise<HeroOverlay[]> {
    return this.repository.getAllHeroOverlays()
  }

  async getVisibleHeroOverlays(): Promise<HeroOverlay[]> {
    return this.repository.getVisibleHeroOverlays()
  }

  async updateHeroOverlay(id: string, data: Partial<HeroOverlay>): Promise<HeroOverlay> {
    return this.repository.updateHeroOverlay(id, data)
  }

  async getSpotlightSetting() {
    return this.repository.getSpotlightSetting()
  }

  async getSpotlightImages() {
    return this.repository.getSpotlightImages()
  }
}

export const settingsService = new SettingsService()
