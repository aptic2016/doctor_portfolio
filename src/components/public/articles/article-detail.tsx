"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ArticleCategory {
  name: string
  slug: string
}

interface ArticleTag {
  name: string
  slug: string
}

interface Article {
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  readingTime: number | null
  publishDate: Date
  categories: ArticleCategory[]
  tags: ArticleTag[]
}

export function ArticleDetail({ article }: { article: Article }) {
  return (
    <article>
      <Link href="/articles">
        <Button variant="ghost" className="mb-8 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Articles
        </Button>
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(article.publishDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {article.readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readingTime} min read
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-base sm:text-xl text-muted-foreground">{article.excerpt}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {article.categories.map((cat) => (
            <span
              key={cat.slug}
              className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full"
            >
              {cat.name}
            </span>
          ))}
          {article.tags.map((tag) => (
            <span
              key={tag.slug}
              className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </header>

      {article.coverImage && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
      />
    </article>
  )
}

function formatContent(content: string): string {
  let html = content
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")

  if (!html.startsWith("<")) {
    html = "<p>" + html + "</p>"
  }

  return html
}
