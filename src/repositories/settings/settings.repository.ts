import { Prisma, BrandSettings, ThemeSettings, SiteSettings, NavigationItem, SocialLink, HomeSection, HomeSectionId, HighlightMetric, HeroOverlay } from "@prisma/client"
import { prisma } from "@/lib/db"

export class SettingsRepository {
  async getBrandSettings(): Promise<BrandSettings | null> {
    return prisma.brandSettings.findFirst()
  }

  async updateBrandSettings(id: string, data: Partial<BrandSettings>): Promise<BrandSettings> {
    return prisma.brandSettings.update({ where: { id }, data })
  }

  async createBrandSettings(data: Prisma.BrandSettingsCreateInput): Promise<BrandSettings> {
    return prisma.brandSettings.create({ data })
  }

  async getThemeSettings(): Promise<ThemeSettings | null> {
    return prisma.themeSettings.findFirst()
  }

  async updateThemeSettings(id: string, data: Partial<ThemeSettings>): Promise<ThemeSettings> {
    return prisma.themeSettings.update({ where: { id }, data })
  }

  async createThemeSettings(data: Prisma.ThemeSettingsCreateInput): Promise<ThemeSettings> {
    return prisma.themeSettings.create({ data })
  }

  async getSiteSettings(): Promise<SiteSettings | null> {
    return prisma.siteSettings.findFirst()
  }

  async updateSiteSettings(id: string, data: Partial<SiteSettings>): Promise<SiteSettings> {
    return prisma.siteSettings.update({ where: { id }, data })
  }

  async createSiteSettings(data: Prisma.SiteSettingsCreateInput): Promise<SiteSettings> {
    return prisma.siteSettings.create({ data })
  }

  async getNavigation(): Promise<NavigationItem[]> {
    return prisma.navigationItem.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    })
  }

  async getAllNavigation(): Promise<NavigationItem[]> {
    return prisma.navigationItem.findMany({ orderBy: { sortOrder: "asc" } })
  }

  async createNavigationItem(data: Prisma.NavigationItemCreateInput): Promise<NavigationItem> {
    return prisma.navigationItem.create({ data })
  }

  async updateNavigationItem(id: string, data: Partial<NavigationItem>): Promise<NavigationItem> {
    return prisma.navigationItem.update({ where: { id }, data })
  }

  async deleteNavigationItem(id: string): Promise<NavigationItem> {
    return prisma.navigationItem.delete({ where: { id } })
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    return prisma.socialLink.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    })
  }

  async getAllSocialLinks(): Promise<SocialLink[]> {
    return prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } })
  }

  async createSocialLink(data: Prisma.SocialLinkCreateInput): Promise<SocialLink> {
    return prisma.socialLink.create({ data })
  }

  async updateSocialLink(id: string, data: Partial<SocialLink>): Promise<SocialLink> {
    return prisma.socialLink.update({ where: { id }, data })
  }

  async deleteSocialLink(id: string): Promise<SocialLink> {
    return prisma.socialLink.delete({ where: { id } })
  }

  async getHomeSections(): Promise<HomeSection[]> {
    return prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } })
  }

  async getHomeSectionBySectionId(sectionId: HomeSectionId): Promise<HomeSection | null> {
    return prisma.homeSection.findFirst({ where: { sectionId } })
  }

  async getVisibleHomeSections(): Promise<HomeSection[]> {
    return prisma.homeSection.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    })
  }

  async updateHomeSection(id: string, data: Partial<HomeSection>): Promise<HomeSection> {
    return prisma.homeSection.update({ where: { id }, data })
  }

  async getSeoSettings() {
    return prisma.seoSettings.findFirst()
  }

  async updateSeoSettings(id: string, data: Prisma.SeoSettingsUpdateInput) {
    return prisma.seoSettings.update({ where: { id }, data })
  }

  async getAllHighlightMetrics(): Promise<HighlightMetric[]> {
    return prisma.highlightMetric.findMany({ orderBy: { sortOrder: "asc" } })
  }

  async getVisibleHighlightMetrics(): Promise<HighlightMetric[]> {
    return prisma.highlightMetric.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    })
  }

  async updateHighlightMetric(id: string, data: Partial<HighlightMetric>): Promise<HighlightMetric> {
    return prisma.highlightMetric.update({ where: { id }, data })
  }

  async updateManyHighlightMetrics(updates: { id: string; data: Partial<HighlightMetric> }[]): Promise<void> {
    for (const { id, data } of updates) {
      await prisma.highlightMetric.update({ where: { id }, data })
    }
  }

  async getAllHeroOverlays(): Promise<HeroOverlay[]> {
    return prisma.heroOverlay.findMany({ orderBy: { sortOrder: "asc" } })
  }

  async getVisibleHeroOverlays(): Promise<HeroOverlay[]> {
    return prisma.heroOverlay.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    })
  }

  async updateHeroOverlay(id: string, data: Partial<HeroOverlay>): Promise<HeroOverlay> {
    return prisma.heroOverlay.update({ where: { id }, data })
  }

  async getSpotlightSetting() {
    return prisma.homeSpotlightSetting.findFirst()
  }

  async getSpotlightImages() {
    return prisma.homeSpotlightImage.findMany({ orderBy: { sortOrder: "asc" } })
  }
}
