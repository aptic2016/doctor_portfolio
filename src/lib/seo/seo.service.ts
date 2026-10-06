import { prisma } from "@/lib/db"

export class SeoService {
  async getSeoSettings() {
    return prisma.seoSettings.findFirst()
  }

  async getSiteSettings() {
    return prisma.siteSettings.findFirst()
  }

  async getProfile() {
    return prisma.profile.findFirst()
  }

  async getBrandSettings() {
    return prisma.brandSettings.findFirst()
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
