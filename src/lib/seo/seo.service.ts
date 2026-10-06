import { prisma } from "@/lib/db"
import { settingsService } from "@/services/settings/settings.service"

export class SeoService {
  async getSeoSettings() {
    return prisma.seoSettings.findFirst()
  }

  // Shared with the public layout/footer so metadata and the render pass of one
  // request hit a single row read instead of querying the same table twice.
  async getSiteSettings() {
    return settingsService.getSiteSettings()
  }

  async getProfile() {
    return prisma.profile.findFirst()
  }

  async getBrandSettings() {
    return settingsService.getBrandSettings()
  }

  /**
   * Icon href for the metadata block.
   *
   * The admin favicon is a full-size Cloudinary upload (a 1.7 MB PNG in the seeded
   * data) while a favicon is only ever rendered at 16-64px, so ask Cloudinary for a
   * small fit instead of pulling the original on every cold visit. URLs that already
   * carry a transformation, or that are not Cloudinary, are used untouched.
   */
  private faviconHref(src: string | null | undefined): string {
    if (!src) return "/favicon.ico"
    const marker = "/image/upload/"
    try {
      const url = new URL(src)
      if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return src
      const at = url.pathname.indexOf(marker)
      if (at === -1) return src
      const after = url.pathname.slice(at + marker.length)
      if (!after.replace(/^v\d+\//, "").includes(".")) return src
      url.pathname = url.pathname.slice(0, at + marker.length) + "w_128,h_128,c_fit,q_auto/" + after
      return url.toString()
    } catch {
      return src
    }
  }

  async generateMetadata(options: {
    title?: string
    description?: string
    path?: string
    image?: string
    type?: string
  }) {
    let seoSettings, siteSettings, profile, brandSettings
    try {
      ;[seoSettings, siteSettings, profile, brandSettings] = await Promise.all([
        this.getSeoSettings(),
        this.getSiteSettings(),
        this.getProfile(),
        this.getBrandSettings(),
      ])
    } catch {
      seoSettings = null
      siteSettings = null
      profile = null
      brandSettings = null
    }

    const siteUrl = siteSettings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const siteName = siteSettings?.siteTitle || profile?.displayName || "Portfolio"

    let title = options.title || seoSettings?.templateTitle || "{displayName} | {professionalTitle}"
    let description = options.description || seoSettings?.templateDescription || "Professional portfolio"

    if (profile) {
      title = title
        .replace("{displayName}", profile.displayName)
        .replace("{professionalTitle}", profile.professionalTitle)
        .replace("{organization}", profile.currentOrganization || "")
      description = description
        .replace("{displayName}", profile.displayName)
        .replace("{professionalTitle}", profile.professionalTitle)
        .replace("{organization}", profile.currentOrganization || "")
    }

    const url = options.path ? `${siteUrl}${options.path}` : siteUrl
    const image =
      options.image ||
      seoSettings?.ogImage ||
      brandSettings?.profileImage ||
      profile?.profileImage ||
      undefined

    return {
      title,
      description,
      icons: {
        icon: this.faviconHref(brandSettings?.favicon),
      },
      openGraph: {
        title,
        description,
        url,
        siteName,
        images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
        type: (options.type as "website" | "article" | "profile") || "website",
      },
      twitter: {
        card: "summary_large_image" as const,
        title,
        description,
        images: image ? [image] : undefined,
        creator: seoSettings?.twitterHandle || undefined,
      },
      alternates: {
        canonical: url,
      },
    }
  }

  generateJsonLd() {
    return {
      "@context": "https://schema.org",
      "@type": "Person",
    }
  }
}

export const seoService = new SeoService()
