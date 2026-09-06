"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/auth"
import { assertCloudinaryUrl } from "@/lib/media/cloudinary-url"
import { resolveFocalPosition } from "@/lib/media/focal-point"

/**
 * About page presentation. Both values that reach the public DOM are validated
 * here, not just in the form: the URL has to be a Cloudinary https URL (the one
 * host `next/image` is configured for) and the focal point has to be one of the
 * closed preset values, since it is applied as an inline `object-position`.
 */
export async function updateAboutSettings(data: {
  profileId: string
  aboutImageUrl: string | null
  aboutImageAlt: string | null
  showAboutImage: boolean
  aboutImagePosition: string | null
}) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  try {
    const aboutImageUrl = assertCloudinaryUrl(data.aboutImageUrl)
    const aboutImageAlt = data.aboutImageAlt?.trim()

    await prisma.profile.update({
      where: { id: data.profileId },
      data: {
        aboutImageUrl,
        aboutImageAlt: aboutImageAlt ? aboutImageAlt.slice(0, 300) : null,
        showAboutImage: data.showAboutImage,
        aboutImagePosition: resolveFocalPosition(data.aboutImagePosition),
      },
    })

    revalidatePath("/admin/about")
    revalidatePath("/about")
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update"
    return { success: false, error: message }
  }
}
