import { MetadataRoute } from "next"
import { prisma } from "@/lib/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const staticPages = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${siteUrl}/education`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${siteUrl}/experience`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${siteUrl}/qualifications`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${siteUrl}/achievements`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${siteUrl}/publications`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${siteUrl}/articles`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${siteUrl}/gallery`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
  ]

  let resumePages: MetadataRoute.Sitemap = []
  let articlePages: MetadataRoute.Sitemap = []
  let publicationPages: MetadataRoute.Sitemap = []

  try {
    const cvSettings = await prisma.cvSettings.findFirst({
      select: { resumeEnabled: true, publicResumeEnabled: true },
    })
    if (cvSettings?.resumeEnabled && cvSettings?.publicResumeEnabled) {
      resumePages = [
        {
          url: `${siteUrl}/resume`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.8,
        },
      ]
    }

    const articles = await prisma.article.findMany({
      where: { isPublished: true, isDraft: false },
      select: { slug: true, updatedAt: true },
    })

    articlePages = articles.map((article) => ({
      url: `${siteUrl}/articles/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))

    const publications = await prisma.publication.findMany({
      where: { isVisible: true, isPublished: true },
      select: { slug: true, updatedAt: true },
    })

    publicationPages = publications.map((pub) => ({
      url: `${siteUrl}/publications#${pub.slug}`,
      lastModified: pub.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  } catch {
    // Database unavailable at build time
  }

  return [...staticPages, ...resumePages, ...articlePages, ...publicationPages]
}
