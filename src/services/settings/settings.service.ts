import { cache } from "react"
import { SettingsRepository } from "@/repositories/settings/settings.repository"
import { BrandSettings, ThemeSettings, SiteSettings, NavigationItem, SocialLink, HomeSection, HomeSectionId, HighlightMetric, HeroOverlay } from "@prisma/client"

export class SettingsService {
  private repository = new SettingsRepository()

  // Read helpers are memoised for the lifetime of one request so the public
  // layout and the footer stop issuing the same navigation/site/profile query
  // twice per render. Mutations are deliberately left uncached.
  getBrandSettings = cache(async (): Promise<BrandSettings | null> => this.repository.getBrandSettings())

  async updateBrandSettings(id: string, data: Partial<BrandSettings>): Promise<BrandSettings> {
    return this.repository.updateBrandSettings(id, data)
  }

  getThemeSettings = cache(async (): Promise<ThemeSettings | null> => this.repository.getThemeSettings())

  async updateThemeSettings(id: string, data: Partial<ThemeSettings>): Promise<ThemeSettings> {
    return this.repository.updateThemeSettings(id, data)
  }

  getSiteSettings = cache(async (): Promise<SiteSettings | null> => this.repository.getSiteSettings())

  async updateSiteSettings(id: string, data: Partial<SiteSettings>): Promise<SiteSettings> {
    return this.repository.updateSiteSettings(id, data)
  }

  getNavigation = cache(async (): Promise<NavigationItem[]> => this.repository.getNavigation())

  async getAllNavigation(): Promise<NavigationItem[]> {
    return this.repository.getAllNavigation()
  }

  getSocialLinks = cache(async (): Promise<SocialLink[]> => this.repository.getSocialLinks())

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
