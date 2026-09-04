import Link from "next/link"
import { prisma } from "@/lib/db"
import { settingsService } from "@/services/settings/settings.service"
import { MapPin, Phone, Clock } from "lucide-react"
import { DefaultChamberIcon } from "@/components/public/shared/default-chamber-icon"
import { SocialIconLink } from "@/components/public/shared/social-icon"

export async function Footer() {
  let navItems: { label: string; destination: string; isVisible: boolean }[] = []
  let socialLinks: { platform: string; label: string; url: string; isVisible: boolean; iconKey?: string | null; hoverColor?: string | null; sortOrder?: number }[] = []
  let footerSettings: Record<string, unknown> | null = null
  let locations: { title: string; hospitalName: string | null; address: string | null; visitingDays: string | null; visitingHours: string | null; appointmentPhone: string | null; mapsUrl: string | null; isVisible: boolean }[] = []
  let profile: Record<string, unknown> | null = null
  let siteSettings: Record<string, unknown> | null = null

  try {
    ;[navItems, socialLinks, footerSettings, locations, siteSettings, profile] = await Promise.all([
      settingsService.getNavigation(),
      settingsService.getSocialLinks(),
      prisma.footerSetting.findFirst(),
      prisma.footerLocation.findMany({ where: { isVisible: true }, orderBy: { sortOrder: "asc" } }),
      settingsService.getSiteSettings(),
      (await import("@/services/profile/profile.service")).profileService.getPublicProfile().catch(() => null),
    ])
  } catch {
    // Database unavailable — graceful fallback
  }

  const visibleNav = navItems.filter((n) => n.isVisible)
  const visibleSocials = socialLinks.filter((s) => s.isVisible && s.url)
  const sortedSocials = [...visibleSocials].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  const visibleLocations = locations.filter((l) => l.isVisible)

  const fs = footerSettings as Record<string, unknown> | null
  const profileEnabled = fs?.profileEnabled !== false
  const navigationEnabled = fs?.navigationEnabled !== false
  const locationsEnabled = fs?.locationsEnabled !== false
  const socialLinksEnabled = fs?.socialLinksEnabled !== false

  const useMainProfile = fs?.useMainProfile !== false
  const pImage = useMainProfile ? (profile?.profileImage as string | null) : (fs?.profileImage as string | null)
  const pName = useMainProfile ? ((profile?.displayName as string) || (profile?.fullName as string) || "") : ((fs?.profileName as string) || "")
  const pTitle = useMainProfile ? ((profile?.professionalTitle as string) || "") : ((fs?.profileTitle as string) || "")
  const pBio = useMainProfile ? ((profile?.shortBio as string) || "") : ((fs?.profileBio as string) || "")

  const copyrightName = useMainProfile
    ? ((profile?.displayName as string) || (profile?.fullName as string) || "")
    : ((fs?.profileName as string) || "")
  const copyrightText = fs?.copyrightText as string | null
  const showAgency = siteSettings?.showAgencyBranding as boolean
  const agencyName = (siteSettings?.agencyName as string) || "Aptic"
  const agencyUrl = siteSettings?.agencyUrl as string | null
  const agencyLabel = (siteSettings?.agencyLabel as string) || "Designed & Developed by"

  const hasAnyContent = profileEnabled || navigationEnabled || locationsEnabled

  return (
    <footer className="border-t border-border/30 section-surface font-[family-name:var(--font-poppins)]">
      <div className="mx-auto px-5 sm:px-6 lg:px-8 pt-10 pb-6 lg:pt-12 lg:pb-8">
        <div className="max-w-screen-xl mx-auto">

          {hasAnyContent && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr] gap-7 lg:gap-8">

              {/* Column 1 — Doctor Identity */}
              {profileEnabled && (
                <div className="space-y-2.5">
                  {pImage && (
                    <img src={pImage} alt={pName} className="w-11 h-11 rounded-full object-cover border border-border/30" />
                  )}
                  <div>
                    {pName && <h3 className="font-semibold text-base text-foreground">{pName}</h3>}
                    {pTitle && <p className="text-sm text-muted-foreground mt-0.5">{pTitle}</p>}
                  </div>
                  {pBio && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{pBio}</p>}
                  {socialLinksEnabled && sortedSocials.length > 0 && (
                    <div className="flex items-center gap-2 pt-0.5">
                      {sortedSocials.map((s, i) => (
                        <SocialIconLink
                          key={i}
                          url={s.url}
                          platform={s.platform}
                          iconKey={s.iconKey}
                          hoverColor={s.hoverColor}
                          label={s.label}
                          size="sm"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Column 2 — Useful Navigation */}
              {navigationEnabled && visibleNav.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold tracking-[0.18em] uppercase text-primary/70">Useful Navigation</h4>
                  <nav className="flex flex-col gap-0.5">
                    {visibleNav.map((item, idx) => (
                      <Link key={idx} href={item.destination} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit group">
                        <span className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0 text-[10px]">&#8250;</span>
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {/* Column 3 — Practice Locations with internal 2-column grid */}
              {locationsEnabled && visibleLocations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold tracking-[0.18em] uppercase text-primary/70">Practice Locations</h4>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                    {visibleLocations.slice(0, 2).map((loc, idx) => (
                      <LocationBlock key={idx} loc={loc} />
                    ))}
                    {visibleLocations.slice(2, 4).map((loc, idx) => (
                      <LocationBlock key={idx + 2} loc={loc} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Bottom bar */}
          <div className="mt-6 pt-3.5 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-1.5">
            <p className="text-sm text-muted-foreground">
              {copyrightText || `\u00A9 ${new Date().getFullYear()} ${copyrightName || "Aptic"}. All rights reserved.`}
            </p>
            {showAgency && (
              <p className="text-sm text-muted-foreground/60">
                {agencyLabel}{" "}
                {agencyUrl ? (
                  <a href={agencyUrl} target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary transition-colors font-medium">
                    {agencyName}
                  </a>
                ) : (
                  <span className="text-primary/70 font-medium">{agencyName}</span>
                )}
              </p>
            )}
          </div>

        </div>
      </div>
    </footer>
  )
}

function LocationBlock({ loc }: { loc: { title: string; hospitalName: string | null; address: string | null; visitingDays: string | null; visitingHours: string | null; appointmentPhone: string | null; mapsUrl: string | null } }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <DefaultChamberIcon className="h-3.5 w-3.5 text-primary/60 shrink-0" />
        <h5 className="text-sm font-bold uppercase tracking-wide text-foreground">{loc.title}</h5>
      </div>
      {loc.hospitalName && <p className="text-sm text-muted-foreground">{loc.hospitalName}</p>}
      {loc.address && (
        <p className="text-[13px] text-muted-foreground flex items-start gap-1 leading-relaxed">
          <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/50" />
          <span>{loc.address}</span>
        </p>
      )}
      {loc.visitingDays && (
        <p className="text-[13px] text-muted-foreground flex items-start gap-1">
          <Clock className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/50" />
          <span>{loc.visitingDays}{loc.visitingHours ? `, ${loc.visitingHours}` : ""}</span>
        </p>
      )}
      {loc.appointmentPhone && (
        <p className="text-[13px] text-muted-foreground flex items-center gap-1">
          <Phone className="h-3 w-3 shrink-0 text-muted-foreground/50" />
          <span>{loc.appointmentPhone}</span>
        </p>
      )}
    </div>
  )
}


