"use server"

import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { auth } from "@/lib/auth/auth"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function createEducation(data: Omit<Prisma.EducationCreateInput, "profile">) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const profile = await profileService.getPublicProfile()
  if (!profile) throw new Error("Profile not found")

  await contentService.createEducation({
    ...data,
    profile: { connect: { id: profile.id } },
  })
  revalidatePath("/admin/education")
  return { success: true }
}

export async function updateEducation(id: string, data: Prisma.EducationUpdateInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await contentService.updateEducation(id, data)
  revalidatePath("/admin/education")
  return { success: true }
}

export async function deleteEducation(id: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await contentService.deleteEducation(id)
  revalidatePath("/admin/education")
  return { success: true }
}
