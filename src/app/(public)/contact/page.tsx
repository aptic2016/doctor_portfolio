import { Metadata } from "next"
import { Profile, SiteSettings } from "@prisma/client"
import { settingsService } from "@/services/settings/settings.service"
import { profileService } from "@/services/profile/profile.service"
import { prisma } from "@/lib/db"
import { ContactForm } from "@/components/public/contact/contact-form"
import { Mail, Phone, MapPin, Clock, Navigation } from "lucide-react"
import { DefaultChamberIcon } from "@/components/public/shared/default-chamber-icon"
import { ChamberCard } from "@/components/public/shared/chamber-card"
import { RevealSection } from "@/components/public/shared/use-reveal"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch",
}

interface Location {
  id: string
  title: string
  hospitalName: string | null
  address: string | null
  visitingDays: string | null
  visitingHours: string | null
  appointmentPhone: string | null
  mapsUrl: string | null
  mapsEmbedUrl: string | null
  icon: string | null
  ctaLabel: string | null
  isPrimary: boolean
  sortOrder: number
  isVisible: boolean
}

function getMapEmbedUrl(loc: Location): string | null {
  if (loc.mapsEmbedUrl) return loc.mapsEmbedUrl
  if (!loc.mapsUrl) return null
  try {
    const url = new URL(loc.mapsUrl)
    const q = url.searchParams.get("q") || url.searchParams.get("query")
    if (q) return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(q)}&zoom=15`
    const geoMatch = url.pathname.match(/\/maps\/@([0-9.-]+),([0-9.-]+)/)
    if (geoMatch) return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d50000!2d${geoMatch[2]}!3d${geoMatch[1]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1`
    return null
  } catch {
    return null
  }
}

export default async function ContactPage() {
  let siteSettings: SiteSettings | null = null
  let profile: Profile | null = null
  let locations: Location[] = []
  try {
    ;[siteSettings, profile] = await Promise.all([
      settingsService.getSiteSettings(),
      profileService.getPublicProfile(),
    ])
    locations = await prisma.footerLocation.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    }) as Location[]
  } catch {
    siteSettings = null
    profile = null
  }

  if (!siteSettings?.contactVisibility) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Contact form is currently unavailable.</p>
      </div>
    )
  }

  const primaryLocation = locations.find((l) => l.isPrimary) || locations[0]
  const embedUrl = primaryLocation ? getMapEmbedUrl(primaryLocation) : null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Contact</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            I welcome enquiries about my clinical practice, referral discussions, or professional collaborations.
          </p>
        </div>

        {/* Map LEFT + Form RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Map + Primary Location */}
          <div className="space-y-4">
            {embedUrl ? (
              <div className="rounded-2xl border border-border/50 bg-surface/50 overflow-hidden">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full aspect-[4/3] lg:aspect-auto lg:h-[480px]"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-border/50 bg-surface/50 p-8 flex flex-col items-center justify-center text-center min-h-[320px] lg:min-h-[480px]">
                <MapPin className="h-10 w-10 text-primary/40 mb-4" />
                <p className="text-sm text-muted-foreground">Map location not configured</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Set a Google Maps URL in Footer Locations admin</p>
              </div>
            )}
            {primaryLocation && (
              <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 shrink-0">
                    {primaryLocation.icon ? (
                      <img src={primaryLocation.icon} alt="" className="h-4 w-4 object-contain" />
                    ) : (
                      <DefaultChamberIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{primaryLocation.title}</p>
                    {primaryLocation.hospitalName && <p className="text-xs text-muted-foreground mt-0.5">{primaryLocation.hospitalName}</p>}
                    {primaryLocation.address && <p className="text-xs text-muted-foreground mt-0.5">{primaryLocation.address}</p>}
                    {primaryLocation.visitingDays && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="inline h-3 w-3 mr-1 text-primary/60" />
                        {primaryLocation.visitingDays}{primaryLocation.visitingHours ? `, ${primaryLocation.visitingHours}` : ""}
                      </p>
                    )}
                    {primaryLocation.appointmentPhone && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <Phone className="inline h-3 w-3 mr-1 text-primary/60" />
                        {primaryLocation.appointmentPhone}
                      </p>
                    )}
                    {primaryLocation.mapsUrl && (
                      <a href={primaryLocation.mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-2 transition-colors">
                        <Navigation className="h-3 w-3" /> Open in Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Contact Info + Form */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-border/50 bg-surface/50 space-y-4">
              <h3 className="font-semibold text-foreground">Contact Information</h3>
              <div className="space-y-3">
                {profile?.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <a href={`mailto:${profile.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <a href={`tel:${profile.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {profile.phone}
                    </a>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
            <ContactForm />
          </div>
        </div>

        {/* Medical Separator */}
        {locations.length > 0 && (
          <div className="my-16 flex items-center justify-center gap-3">
            <div className="flex-1 h-px bg-border/40" />
            <div className="flex items-center gap-2 text-primary/40">
              <svg className="h-4 w-auto" viewBox="0 0 80 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M0 8 L8 8 L12 2 L16 14 L20 4 L24 12 L28 8 L80 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2 C12 2 12 6 12 9" strokeLinecap="round" />
                <path d="M12 15 C12 18 12 22 12 22" strokeLinecap="round" />
                <path d="M10 9 L10 6 C10 4 14 4 14 6 L14 9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 15 L10 18 C10 20 14 20 14 18 L14 15" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12 L15 12" strokeLinecap="round" />
              </svg>
              <svg className="h-4 w-auto" viewBox="0 0 80 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M0 8 L52 8 L56 2 L60 14 L64 4 L68 12 L72 8 L80 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 h-px bg-border/40" />
          </div>
        )}

        {/* Practice Locations */}
        {locations.length > 0 && (
          <RevealSection>
            <div>
              <div className="text-center space-y-3 mb-10">
                <div className="inline-flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-primary uppercase tracking-wider">Practice Locations</p>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Chambers &amp; Appointments</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {locations.map((loc) => (
                  <ChamberCard key={loc.id} loc={loc} />
                ))}
              </div>
            </div>
          </RevealSection>
        )}
      </div>
    </div>
  )
}
