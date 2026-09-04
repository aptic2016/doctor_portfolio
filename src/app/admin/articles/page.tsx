import { ArticlesAdmin } from "./articles-admin"
import { contentService } from "@/services/content/content.service"

import type { Article, ArticleCategory, ArticleTag } from "@prisma/client"

export default async function AdminArticlesPage() {
  let articles: (Article & { categories: ArticleCategory[]; tags: ArticleTag[] })[] = []
  let categories: ArticleCategory[] = []
  let tags: ArticleTag[] = []
  try {
    ;[articles, categories, tags] = await Promise.all([
      contentService.getArticles(),
      contentService.getArticleCategories(),
      contentService.getArticleTags(),
    ])
  } catch {
    // Database unavailable at build time
  }

  return (
    <ArticlesAdmin
      initialArticles={articles}
      initialCategories={categories}
      initialTags={tags}
    />
  )
}
