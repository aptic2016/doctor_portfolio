import { ContactAdmin } from "./contact-admin"
import { profileService } from "@/services/profile/profile.service"
import { prisma } from "@/lib/db"

export default async function AdminContactPage() {
  let profile = null
  let locations: { id: string; title: string; hospitalName: string | null; address: string | null; visitingDays: string | null; visitingHours: string | null; appointmentPhone: string | null; mapsUrl: string | null; mapsEmbedUrl: string | null; icon: string | null; ctaLabel: string | null; isPrimary: boolean; sortOrder: number; isVisible: boolean }[] = []
  try {
    const [p, locs] = await Promise.all([
      profileService.getProfileForAdmin(),
      prisma.footerLocation.findMany({ orderBy: { sortOrder: "asc" } }).catch(() => []),
    ])
    profile = p
    locations = locs
  } catch {
    profile = null
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Page</h1>
          <p className="text-muted-foreground">Profile not found. Please set up your profile first.</p>
        </div>
      </div>
    )
  }

  return (
    <ContactAdmin
      profileId={profile.id}
      displayName={profile.displayName}
      professionalTitle={profile.professionalTitle}
      location={profile.location}
      contactImageUrl={profile.contactImageUrl}
      contactImageAlt={profile.contactImageAlt}
      showContactImage={profile.showContactImage}
      contactImagePosition={profile.contactImagePosition}
      initialLocations={locations}
    />
  )
}
