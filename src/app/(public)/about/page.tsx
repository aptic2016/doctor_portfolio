import Image from "next/image"
import { profileService } from "@/services/profile/profile.service"
import { settingsService } from "@/services/settings/settings.service"
import { resolveFocalPosition } from "@/lib/media/focal-point"
import { MapPin, Mail, Phone, Building2, Quote } from "lucide-react"

export default async function AboutPage() {
  let profile = null
  let socialLinks: { platform: string; url: string; label: string; isVisible: boolean }[] = []
  try {
    ;[profile, socialLinks] = await Promise.all([
      profileService.getPublicProfile(),
      settingsService.getSocialLinks(),
    ])
  } catch {
    profile = null
  }

  if (!profile) return (
    <div className="container mx-auto py-20 text-center">
      <h1 className="text-2xl font-bold">Profile not available</h1>
    </div>
  )

  const visibleLinks = socialLinks.filter((l) => l.isVisible)
  const showImage = profile.showAboutImage && profile.aboutImageUrl

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Hero intro */}
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">About Me</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">{profile.displayName}</h1>
          <p className="text-xl text-primary font-medium">{profile.professionalTitle}</p>
        </div>

        <div className={`grid grid-cols-1 gap-12 lg:gap-16 ${showImage ? "lg:grid-cols-3" : ""}`}>
          {/* Sidebar — only rendered when image is enabled */}
          {showImage && (
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Clinical Portrait Frame */}
                <div className="relative">
                  {/* Backing layer — subtle medical-blue accent */}
                  <div className="absolute -inset-2 rounded-2xl bg-primary/[0.04] border border-primary/[0.06]" />
                  {/* Accent corner — top-left architectural detail */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-lg z-10" aria-hidden="true" />
                  {/* Accent corner — bottom-right */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-lg z-10" aria-hidden="true" />
                  {/* Main image container */}
                  <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-lg bg-muted">
                    <Image
                      src={profile.aboutImageUrl!}
                      alt={profile.aboutImageAlt || `${profile.displayName} - ${profile.professionalTitle}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                      style={{ objectPosition: resolveFocalPosition(profile.aboutImagePosition) }}
                      priority
                    />
                  </div>
                  {/* Profile label */}
                  <div className="mt-3 text-center">
                    <p className="text-sm font-semibold text-foreground">{profile.displayName}</p>
                    <p className="text-xs text-muted-foreground">{profile.professionalTitle}</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border bg-card space-y-4">
                  <h3 className="font-semibold text-foreground">Contact Information</h3>
                  <div className="space-y-3">
                    {profile.location && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{profile.location}</span>
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <a href={`mailto:${profile.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                          {profile.email}
                        </a>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <a href={`tel:${profile.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                          {profile.phone}
                        </a>
                      </div>
                    )}
                    {profile.currentOrganization && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{profile.currentOrganization}</span>
                      </div>
                    )}
                  </div>
                </div>

                {visibleLinks.length > 0 && (
                  <div className="p-6 rounded-2xl border bg-card space-y-4">
                    <h3 className="font-semibold text-foreground">Connect</h3>
                    <div className="flex flex-col gap-2">
                      {visibleLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main content */}
          <div className={`${showImage ? "lg:col-span-2" : ""} space-y-12`}>
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Professional Biography</h2>
              <div className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {profile.fullBio || profile.shortBio || "No biography available."}
              </div>
            </section>

            {profile.philosophy && (
              <section>
                <div className="p-6 rounded-2xl bg-muted/50 border space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Quote className="h-4 w-4" />
                    Professional Philosophy
                  </div>
                  <p className="text-base italic text-muted-foreground leading-relaxed">
                    &ldquo;{profile.philosophy}&rdquo;
                  </p>
                </div>
              </section>
            )}

            {profile.careerObjective && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Career Objective</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {profile.careerObjective}
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
