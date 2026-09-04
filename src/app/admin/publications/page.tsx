import { PublicationsAdmin } from "./publications-admin"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"

import type { Profile, Publication } from "@prisma/client"

export default async function AdminPublicationsPage() {
  let profile: Profile | null = null
  let publications: Publication[] = []
  try {
    profile = await profileService.getPublicProfile()
    publications = profile ? await contentService.getPublications(profile.id) : []
  } catch {
    publications = []
  }

  return <PublicationsAdmin initialData={publications} />
}
