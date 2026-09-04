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

interface PublicationInput {
  title: string
  slug?: string
  abstract?: string
  authors: string
  journal?: string
  conference?: string
  publisher?: string
  publicationDate: string
  doi?: string
  citation?: string
  externalUrl?: string
  pdfUrl?: string
  coverImage?: string
  isVisible?: boolean
  isFeatured?: boolean
  isPublished?: boolean
}

export async function createPublication(data: PublicationInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const profile = await prisma.profile.findFirst()
  if (!profile) throw new Error("No profile found")

  const slug = data.slug || slugify(data.title)

  await prisma.publication.create({
    data: {
      ...data,
      slug,
      profile: { connect: { id: profile.id } },
      publicationDate: new Date(data.publicationDate),
    },
  })
  revalidatePath("/admin/publications")
  revalidatePath("/publications")
  return { success: true }
}

export async function updatePublication(id: string, data: PublicationInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const slug = data.slug || slugify(data.title)

  await prisma.publication.update({
    where: { id },
    data: {
      ...data,
      slug,
      publicationDate: data.publicationDate ? new Date(data.publicationDate) : undefined,
    },
  })
  revalidatePath("/admin/publications")
  revalidatePath("/publications")
  return { success: true }
}

export async function deletePublication(id: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.publication.delete({ where: { id } })
  revalidatePath("/admin/publications")
  revalidatePath("/publications")
  return { success: true }
}
