import { profileService } from "@/services/profile/profile.service"
import { ProfileForm } from "./profile-form"
import type { Profile } from "@prisma/client"

export default async function AdminProfilePage() {
  let profile: Profile | null = null
  try {
    profile = await profileService.getProfileForAdmin()
  } catch {
    profile = null
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Profile not found. Please initialize it.</p>
      </div>
    )
  }

  return <ProfileForm initialData={profile} />
}
