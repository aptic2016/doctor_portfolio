import React from "react"
import Link from "next/link"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"

export async function ArticlesPreview({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean } }) {
  let profile = null
  let articles: Awaited<ReturnType<typeof contentService.getPublishedArticles>> = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) articles = await contentService.getPublishedArticles()
  } catch { return null }
  if (articles.length === 0) return null

  return (
    <section className="py-14 md:py-18 lg:py-20 section-surface">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <SectionHeading section={section} defaultEyebrow="Journal" defaultHeading="Latest Articles" />
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.slice(0, 3).map((article, idx) => (
              <RevealSection key={article.id} delay={idx + 1}>
                <Link href={`/articles/${article.slug}`} className="group block p-5 rounded-xl border border-border/50 bg-surface/50 hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="space-y-2">
                    {article.categories && article.categories.length > 0 && (
                      <span className="inline-block text-xs font-bold tracking-[0.1em] uppercase text-primary bg-primary/5 px-2 py-0.5 rounded-full">{article.categories[0].name}</span>
                    )}
                    <h3 className="text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                    {article.excerpt && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{article.excerpt}</p>}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      {article.publishDate && <span>{new Date(article.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                      {article.readingTime && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{article.readingTime} min</span>}
                    </div>
                  </div>
                </Link>
              </RevealSection>
            ))}
          </div>
          {articles.length > 3 && <RevealSection><div className="mt-6"><Button variant="outline" className="text-sm h-10 rounded-lg" render={<Link href="/articles" />}>View All Articles<ArrowRight className="h-3.5 w-3.5 ml-1" /></Button></div></RevealSection>}
        </div>
      </div>
    </section>
  )
}
