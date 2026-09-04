import { z } from "zod"

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
  isVisible: z.boolean().default(true),
  allowAI: z.boolean().default(true),
})

export type ProfileFormValues = z.input<typeof profileSchema>
