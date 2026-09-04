"use server"

import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { auth } from "@/lib/auth/auth"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function createQualification(data: Omit<Prisma.QualificationCreateInput, "profile">) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const profile = await profileService.getPublicProfile()
  if (!profile) throw new Error("Profile not found")

  await contentService.createQualification({
    ...data,
    profile: { connect: { id: profile.id } },
  })
  revalidatePath("/admin/qualifications")
  return { success: true }
}

export async function updateQualification(id: string, data: Prisma.QualificationUpdateInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await contentService.updateQualification(id, data)
  revalidatePath("/admin/qualifications")
  return { success: true }
}

export async function deleteQualification(id: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await contentService.deleteQualification(id)
  revalidatePath("/admin/qualifications")
  return { success: true }
}

export async function createCertification(data: Omit<Prisma.CertificationCreateInput, "profile">) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const profile = await profileService.getPublicProfile()
  if (!profile) throw new Error("Profile not found")

  await contentService.createCertification({
    ...data,
    profile: { connect: { id: profile.id } },
  })
  revalidatePath("/admin/qualifications")
  return { success: true }
}

export async function updateCertification(id: string, data: Prisma.CertificationUpdateInput) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await contentService.updateCertification(id, data)
  revalidatePath("/admin/qualifications")
  return { success: true }
}

export async function deleteCertification(id: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await contentService.deleteCertification(id)
  revalidatePath("/admin/qualifications")
  return { success: true }
}
