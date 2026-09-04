import { Metadata } from "next"
import { SiteSettings } from "@prisma/client"
import { contentService } from "@/services/content/content.service"
import { settingsService } from "@/services/settings/settings.service"
import { ArticlesIndex } from "@/components/public/articles/articles-index"

export const metadata: Metadata = {
  title: "Articles",
  description: "Read the latest articles and insights",
}

export default async function ArticlesPage() {
  let siteSettings: SiteSettings | null = null
  let articles: Awaited<ReturnType<typeof contentService.getPublishedArticles>> = []
  try {
    siteSettings = await settingsService.getSiteSettings()
    if (siteSettings?.blogEnabled) {
      articles = await contentService.getPublishedArticles()
    }
  } catch {
    siteSettings = null
    articles = []
  }

  if (!siteSettings?.blogEnabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Blog is currently unavailable.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Insights</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Articles</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Clinical insights, professional perspectives, and medical education
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No articles published yet.</p>
          </div>
        ) : (
          <ArticlesIndex articles={articles} />
        )}
      </div>
    </div>
  )
}
