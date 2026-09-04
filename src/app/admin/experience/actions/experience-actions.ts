"use server"

import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { auth } from "@/lib/auth/auth"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function createExperience(data: Omit<Prisma.ExperienceCreateInput, "profile">) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const profile = await profileService.getPublicProfile()
  if (!profile) throw new Error("Profile not found")

  await contentService.createExperience({
    ...data,
    profile: { connect: { id: profile.id } },
  })
  revalidatePath("/admin/experience")
  return { success: true }
}

export async function updateExperience(id: string, data: Prisma.ExperienceUpdateInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await contentService.updateExperience(id, data)
  revalidatePath("/admin/experience")
  return { success: true }
}

export async function deleteExperience(id: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await contentService.deleteExperience(id)
  revalidatePath("/admin/experience")
  return { success: true }
}
