import { AboutAdmin } from "./about-admin"
import { profileService } from "@/services/profile/profile.service"

export default async function AdminAboutPage() {
  let profile = null
  try {
    profile = await profileService.getProfileForAdmin()
  } catch {
    profile = null
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Page</h1>
          <p className="text-muted-foreground">Profile not found. Please set up your profile first.</p>
        </div>
      </div>
    )
  }

  return (
    <AboutAdmin
      profileId={profile.id}
      displayName={profile.displayName}
      professionalTitle={profile.professionalTitle}
      aboutImageUrl={profile.aboutImageUrl}
      aboutImageAlt={profile.aboutImageAlt}
      showAboutImage={profile.showAboutImage}
      aboutImagePosition={profile.aboutImagePosition}
    />
  )
}
