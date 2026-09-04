"use server"

import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export interface CreateArticleInput {
  title: string
  slug?: string
  excerpt?: string
  content?: string
  coverImage?: string
  readingTime?: number
  isDraft?: boolean
  isPublished?: boolean
  isFeatured?: boolean
  seoTitle?: string
  seoDescription?: string
  canonicalUrl?: string
  ogImage?: string
  sortOrder?: number
  categoryIds?: string[]
  tagIds?: string[]
}

export interface UpdateArticleInput {
  title: string
  slug?: string
  excerpt?: string
  content?: string
  coverImage?: string
  readingTime?: number
  isDraft?: boolean
  isPublished?: boolean
  isFeatured?: boolean
  seoTitle?: string
  seoDescription?: string
  canonicalUrl?: string
  ogImage?: string
  sortOrder?: number
  categoryIds?: string[]
  tagIds?: string[]
}

export async function createArticle(data: CreateArticleInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const slug = data.slug || slugify(data.title)
  const now = new Date()

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: data.content || "",
      coverImage: data.coverImage || null,
      readingTime: data.readingTime || null,
      isDraft: data.isDraft ?? true,
      isPublished: data.isPublished ?? false,
      isFeatured: data.isFeatured ?? false,
      publishDate: data.isPublished ? now : now,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      canonicalUrl: data.canonicalUrl || null,
      ogImage: data.ogImage || null,
      sortOrder: data.sortOrder ?? 0,
      categories: data.categoryIds?.length
        ? { connect: data.categoryIds.map((id: string) => ({ id })) }
        : undefined,
      tags: data.tagIds?.length
        ? { connect: data.tagIds.map((id: string) => ({ id })) }
        : undefined,
    },
  })

  revalidatePath("/admin/articles")
  revalidatePath("/articles")
  revalidatePath(`/articles/${slug}`)
  return article
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const slug = data.slug || slugify(data.title)

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: data.content || "",
      coverImage: data.coverImage || null,
      readingTime: data.readingTime || null,
      isDraft: data.isDraft ?? true,
      isPublished: data.isPublished ?? false,
      isFeatured: data.isFeatured ?? false,
      publishDate: data.isPublished ? new Date() : undefined,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      canonicalUrl: data.canonicalUrl || null,
      ogImage: data.ogImage || null,
      sortOrder: data.sortOrder ?? 0,
      categories: data.categoryIds !== undefined
        ? { set: data.categoryIds.map((id: string) => ({ id })) }
        : undefined,
      tags: data.tagIds !== undefined
        ? { set: data.tagIds.map((id: string) => ({ id })) }
        : undefined,
    },
  })

  revalidatePath("/admin/articles")
  revalidatePath("/articles")
  revalidatePath(`/articles/${slug}`)
  return article
}

export async function deleteArticle(id: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const article = await prisma.article.findUnique({ where: { id } })
  await prisma.article.delete({ where: { id } })

  revalidatePath("/admin/articles")
  revalidatePath("/articles")
  if (article) revalidatePath(`/articles/${article.slug}`)
  return { success: true }
}

export async function createCategory(name: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const slug = slugify(name)
  const category = await prisma.articleCategory.create({
    data: { name, slug },
  })
  revalidatePath("/admin/articles")
  return category
}

export async function deleteCategory(id: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.articleCategory.delete({ where: { id } })
  revalidatePath("/admin/articles")
  return { success: true }
}

export async function createTag(name: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const slug = slugify(name)
  const tag = await prisma.articleTag.create({
    data: { name, slug },
  })
  revalidatePath("/admin/articles")
  return tag
}

export async function deleteTag(id: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.articleTag.delete({ where: { id } })
  revalidatePath("/admin/articles")
  return { success: true }
}
