import { Metadata } from "next"
import { notFound } from "next/navigation"
import { contentService } from "@/services/content/content.service"
import { ArticleDetail } from "@/components/public/articles/article-detail"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const article = await contentService.getArticleBySlug(slug)
    if (!article) return { title: "Article Not Found" }

    return {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || article.title,
      openGraph: {
        title: article.seoTitle || article.title,
        description: article.seoDescription || article.excerpt || "",
        type: "article",
        publishedTime: article.publishDate.toISOString(),
        images: article.ogImage ? [article.ogImage] : undefined,
      },
    }
  } catch {
    return { title: "Article" }
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  let article: Awaited<ReturnType<typeof contentService.getArticleBySlug>> = null
  try {
    article = await contentService.getArticleBySlug(slug)
  } catch {
    article = null
  }

  if (!article || !article.isPublished) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ArticleDetail article={article} />
      </div>
    </div>
  )
}
