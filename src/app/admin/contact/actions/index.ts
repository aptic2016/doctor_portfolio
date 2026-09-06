"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/auth"
import { assertCloudinaryUrl } from "@/lib/media/cloudinary-url"
import { resolveFocalPosition } from "@/lib/media/focal-point"

/**
 * Contact page presentation. Same guard as the About portrait: the URL is
 * checked against the one allowed image host and the focal point is normalised
 * to a known preset, because both are written straight into the public markup.
 */
export async function updateContactSettings(data: {
  profileId: string
  contactImageUrl: string | null
  contactImageAlt: string | null
  showContactImage: boolean
  contactImagePosition: string | null
}) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  try {
    const contactImageUrl = assertCloudinaryUrl(data.contactImageUrl)
    const contactImageAlt = data.contactImageAlt?.trim()

    await prisma.profile.update({
      where: { id: data.profileId },
      data: {
        contactImageUrl,
        contactImageAlt: contactImageAlt ? contactImageAlt.slice(0, 300) : null,
        showContactImage: data.showContactImage,
        contactImagePosition: resolveFocalPosition(data.contactImagePosition),
      },
    })

    revalidatePath("/admin/contact")
    revalidatePath("/contact")
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update"
    return { success: false, error: message }
  }
}
