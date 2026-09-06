import { z } from "zod"
import { CLOUDINARY_HOST } from "@/lib/media/cloudinary-url"
import { isMediaPosition } from "@/lib/media/focal-point"

/**
 * Page-image URL. Blank means "no image"; anything else has to be an https URL
 * on the one remote host `next/image` is configured for. The rule lives in the
 * schema rather than in a single action because two screens write these columns
 * — `/admin/profile` submits them with the rest of the profile, and the About
 * and Contact screens edit them on their own.
 */
const pageImageUrl = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value) return true
      try {
        const parsed = new URL(value)
        return parsed.protocol === "https:" && parsed.hostname === CLOUDINARY_HOST
      } catch {
        return false
      }
    },
    { message: "Only Cloudinary media URLs are allowed" },
  )

/** Blank, or one of the nine presets — the value ships as inline CSS. */
const focalPosition = z
  .string()
  .optional()
  .refine((value) => !value || isMediaPosition(value), { message: "Unsupported focal point" })

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  displayName: z.string().min(2, "Display name is required"),
  professionalTitle: z.string().min(2, "Professional title is required"),
  tagline: z.string().optional(),
  shortBio: z.string().optional(),
  fullBio: z.string().optional(),
  currentDesignation: z.string().optional(),
  currentOrganization: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  careerObjective: z.string().optional(),
  philosophy: z.string().optional(),
  quote: z.string().optional(),
  resumeUrl: z.string().url("Invalid resume URL").optional().or(z.literal("")),
  aboutImageUrl: pageImageUrl,
  aboutImageAlt: z.string().optional(),
  showAboutImage: z.boolean().default(true),
  aboutImagePosition: focalPosition,
  contactImageUrl: pageImageUrl,
  contactImageAlt: z.string().optional(),
  showContactImage: z.boolean().default(true),
  contactImagePosition: focalPosition,
  isVisible: z.boolean().default(true),
  allowAI: z.boolean().default(true),
})

export type ProfileFormValues = z.input<typeof profileSchema>
