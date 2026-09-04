"use server"

import { profileService } from "@/services/profile/profile.service"
import { profileSchema, ProfileFormValues } from "@/lib/validators/profile"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/auth"

export async function updateProfile(data: ProfileFormValues) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const validatedData = profileSchema.parse(data)
  const profile = await profileService.getProfileForAdmin()

  if (!profile) {
    // In a real app, we'd check if a profile exists for the current user.
    // For this MVP, we assume there is one global profile.
    return { success: false, error: "Profile not found" }
  }

  await profileService.updateProfile(profile.id, validatedData)
  revalidatePath("/admin/profile")
  revalidatePath("/")
  revalidatePath("/about")

  return { success: true }
}
