"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock, Calendar } from "lucide-react"

interface ArticleCategory {
  id: string
  name: string
  slug: string
}

interface ArticleTag {
  id: string
  name: string
  slug: string
}

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  readingTime: number | null
  publishDate: Date
  categories: ArticleCategory[]
  tags: ArticleTag[]
}

export function ArticlesIndex({ articles }: { articles: Article[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/articles/${article.slug}`}
          className="group block"
        >
          <article className="h-full flex flex-col bg-card rounded-xl overflow-hidden border hover:shadow-lg transition-shadow">
            {article.coverImage && (
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-col flex-grow p-6">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.publishDate).toLocaleDateString()}
                </span>
                {article.readingTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readingTime} min read
                  </span>
                )}
              </div>

              <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {article.title}
              </h2>

              {article.excerpt && (
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
              )}

              <div className="mt-auto flex flex-wrap gap-2">
                {article.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}
