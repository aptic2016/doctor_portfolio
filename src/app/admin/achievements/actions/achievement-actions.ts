"use server"

import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export interface CreateAchievementInput {
  title: string
  awardingOrganization?: string
  date: string
  description?: string
  image?: string
  certificateUrl?: string
  externalUrl?: string
  isVisible?: boolean
  isFeatured?: boolean
  sortOrder?: number
}

export interface UpdateAchievementInput {
  title?: string
  awardingOrganization?: string
  date?: string
  description?: string
  image?: string
  certificateUrl?: string
  externalUrl?: string
  isVisible?: boolean
  isFeatured?: boolean
  sortOrder?: number
}

export async function createAchievement(data: CreateAchievementInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const profile = await prisma.profile.findFirst()
  if (!profile) throw new Error("No profile found")

  await prisma.achievement.create({
    data: {
      ...data,
      profileId: profile.id,
      date: new Date(data.date),
    },
  })
  revalidatePath("/admin/achievements")
  revalidatePath("/achievements")
  return { success: true }
}

export async function updateAchievement(id: string, data: UpdateAchievementInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.achievement.update({
    where: { id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    },
  })
  revalidatePath("/admin/achievements")
  revalidatePath("/achievements")
  return { success: true }
}

export async function deleteAchievement(id: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.achievement.delete({ where: { id } })
  revalidatePath("/admin/achievements")
  revalidatePath("/achievements")
  return { success: true }
}
