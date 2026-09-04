"use server"

import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface GalleryItemInput {
  mediaAssetId: string
  caption?: string | null
  category?: string | null
  isVisible?: boolean
  isFeatured?: boolean
  captureDate?: string
  location?: string | null
  sortOrder?: number
}

export async function createGalleryItem(data: GalleryItemInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.galleryItem.create({
    data: {
      mediaAssetId: data.mediaAssetId,
      caption: data.caption || null,
      category: data.category || null,
      isVisible: data.isVisible ?? true,
      isFeatured: data.isFeatured ?? false,
      captureDate: data.captureDate ? new Date(data.captureDate) : null,
      location: data.location || null,
      sortOrder: data.sortOrder ?? 0,
    },
  })
  revalidatePath("/admin/gallery")
  revalidatePath("/gallery")
  return { success: true }
}

export async function updateGalleryItem(id: string, data: GalleryItemInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.galleryItem.update({
    where: { id },
    data: {
      ...data,
      captureDate: data.captureDate ? new Date(data.captureDate) : null,
    },
  })
  revalidatePath("/admin/gallery")
  revalidatePath("/gallery")
  return { success: true }
}

export async function deleteGalleryItem(id: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.galleryItem.delete({ where: { id } })
  revalidatePath("/admin/gallery")
  revalidatePath("/gallery")
  return { success: true }
}

export async function reorderGalleryItems(items: { id: string; sortOrder: number }[]) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.$transaction(
    items.map((item) =>
      prisma.galleryItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  )
  revalidatePath("/admin/gallery")
  revalidatePath("/gallery")
  return { success: true }
}
