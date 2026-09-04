import { profileService } from "@/services/profile/profile.service"
import { contentService } from "@/services/content/content.service"
import { AdminQualificationsPage } from "./qualifications-form"

import type { Profile, Qualification, Certification } from "@prisma/client"

export default async function Page() {
  let profile: Profile | null = null
  let qualifications: Qualification[] = []
  let certifications: Certification[] = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) {
      qualifications = await contentService.getQualifications(profile.id)
      certifications = await contentService.getCertifications(profile.id)
    }
  } catch {
    profile = null
  }
  if (!profile) return <div className="p-8">Profile not found.</div>

  return <AdminQualificationsPage initialQualifications={qualifications} initialCertifications={certifications} />
}
