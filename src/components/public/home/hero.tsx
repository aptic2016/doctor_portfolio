import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { profileService } from "@/services/profile/profile.service"
import { settingsService } from "@/services/settings/settings.service"
import { contentService } from "@/services/content/content.service"
import { MapPin, Building2, ArrowRight, Stethoscope, Award, Briefcase } from "lucide-react"
import { HeroOverlayPocket, HeroPortraitStage } from "@/components/shared/hero-visual"
import { EcgLine } from "@/components/shared/ecg-line"

export async function Hero() {
  let profile = null
  let quals: { id: string }[] = []
  let exps: { id: string }[] = []
  let brand = null
  let overlays: {
    key: string; label: string; valueType: string; customValue: string | null; valueSource: string | null
    desktopVisible: boolean; mobileVisible: boolean
    desktopX: number; desktopY: number; mobileX: number; mobileY: number
    width: string; opacity: number; styleVariant: string; sortOrder: number
  }[] = []
  try {
    ;[profile, brand] = await Promise.all([
      profileService.getPublicProfile(),
      settingsService.getBrandSettings(),
    ])
    if (profile) {
      const results = await Promise.all([
        contentService.getVisibleQualifications(profile.id).catch(() => []),
        contentService.getVisibleExperience(profile.id).catch(() => []),
      ])
      quals = results[0]
      exps = results[1]
    }
    overlays = (await settingsService.getVisibleHeroOverlays().catch(() => []) as typeof overlays)
      .filter((o) => o.valueType !== "MANUAL" || o.customValue)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  } catch { profile = null }

  if (!profile) return null

  const getOverlayValue = (o: typeof overlays[0]) => {
    if (o.valueType === "MANUAL") return o.customValue || "—"
    switch (o.valueSource) {
      case "currentDesignation": return profile!.currentDesignation || "—"
      case "qualificationCount": return String(quals.length).padStart(2, "0")
      case "location": return profile!.location?.split(",")[0] || "—"
      case "experienceYears": return exps.length > 0 ? `${exps.length} Roles` : "—"
      default: return "—"
    }
  }

  const bgStyle = brand?.heroBackground || "grid"

  const overlayStyleMap: Record<string, string> = {
    glass: "glass-surface shadow-lg",
    minimal: "bg-background/80 border border-border/50 shadow-sm",
    outline: "bg-transparent border-2 border-primary/30",
    solid: "bg-primary/10 border border-primary/20 shadow-sm",
  }

  return (
    <section className="relative min-h-[50vh] lg:min-h-[60vh]">
      {/* ===== MOBILE: Portrait-first (app-like) ===== */}
      <div className="lg:hidden flex flex-col">
        {/* Portrait area */}
        <div className="relative aspect-[4/5] w-full shrink-0 overflow-visible">
          <div className="absolute inset-0 medical-grid opacity-40" />
          {brand?.profileImage ? (
            <Image
              src={brand.profileImage}
              alt={profile.displayName}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center 40px" }}
              priority
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
              <Stethoscope className="h-20 w-20 mb-2" />
            </div>
          )}

          {/* Mobile overlay cards positioned from DB */}
          {overlays.filter((o) => o.mobileVisible).map((o) => {
            const style = overlayStyleMap[o.styleVariant] || overlayStyleMap.glass
            return (
              <HeroOverlayPocket
                key={o.key}
                style={style}
                x={o.mobileX}
                y={o.mobileY}
                width={o.width}
                opacity={o.opacity}
                sortOrder={o.sortOrder}
              >
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary/60">{o.label}</div>
                <div className="text-xs font-semibold text-foreground mt-0.5">{getOverlayValue(o)}</div>
              </HeroOverlayPocket>
            )
          })}
        </div>

        {/* Identity block below portrait */}
        <div className="flex-1 px-5 py-6 space-y-4">
          {brand?.heroShowBadge && brand?.heroBadgeText && (
            <div data-hero-status-badge="" className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {brand.heroBadgeText}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.05] text-foreground">
            {profile.displayName}
          </h1>

          <p className="text-base font-semibold text-primary">
            {profile.professionalTitle}
          </p>

          {profile.tagline && (
            <p className="text-sm text-muted-foreground leading-relaxed">{profile.tagline}</p>
          )}

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            {brand?.heroShowWorkplace && profile.currentDesignation && profile.currentOrganization && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary/60" />
                <span>{profile.currentDesignation}, {profile.currentOrganization}</span>
              </div>
            )}
            {brand?.heroShowLocation && profile.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary/60" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <Button size="lg" className="h-11 px-6 text-sm rounded-lg w-full" render={<Link href={brand?.heroPrimaryCtaDest || "/about"} />}>
              {brand?.heroPrimaryCtaLabel || "Profile"} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <div className="flex gap-2.5">
              <Button size="lg" variant="outline" className="h-11 px-6 text-sm rounded-lg flex-1" render={<Link href={brand?.heroSecondaryCtaDest || "/contact"} />}>
                {brand?.heroSecondaryCtaLabel || "Connect"}
              </Button>
              {brand?.heroShowCvCta && profile.resumeUrl && (
                <Button size="lg" variant="ghost" className="h-11 px-6 text-sm rounded-lg" render={<a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" />}>
                  {brand.heroCvCtaLabel || "CV"}
                </Button>
              )}
            </div>
          </div>

          {brand?.heroShowQualifications && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <Award className="h-4 w-4 text-primary/60" />
              <span>{quals.length} Qualifications</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== DESKTOP: Two-column with DB-driven overlays ===== */}
      <div className="hidden lg:block absolute inset-0 -z-10">
        {bgStyle === "grid" && <div className="absolute inset-0 medical-grid" />}
        {bgStyle === "clinical-digital" && <div className="absolute inset-0 digital-dots" />}
        {bgStyle === "soft-glow" && <div className="absolute inset-0"><div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-[120px]" /><div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-accent/[0.04] rounded-full blur-[80px]" /></div>}
        <div className="absolute bottom-20 left-0 right-0 w-full h-16 opacity-[0.06]">
          <EcgLine className="w-full h-full text-primary" />
        </div>
      </div>

      <div className="hidden lg:flex container mx-auto px-5 sm:px-6 lg:px-8 py-16 lg:py-20 xl:py-24 min-h-[50vh] lg:min-h-[60vh] items-center">
        <div className="grid grid-cols-12 gap-8 lg:gap-6 w-full">
          {/* Text column */}
          <div className="col-span-7 space-y-5">
            {brand?.heroShowBadge && brand?.heroBadgeText && (
              <div data-hero-status-badge="" className="hero-fade hero-delay-1 inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {brand.heroBadgeText}
              </div>
            )}

            <h1 className="hero-slide-up hero-delay-2 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] text-foreground">
              {profile.displayName}
            </h1>

            <p className="hero-slide-up hero-delay-3 text-lg lg:text-xl font-semibold text-primary">
              {profile.professionalTitle}
            </p>

            {profile.tagline && (
              <p className="hero-slide-up hero-delay-4 text-base text-muted-foreground leading-relaxed max-w-lg">
                {profile.tagline}
              </p>
            )}

            <div className="hero-slide-up hero-delay-4 flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
              {brand?.heroShowWorkplace && profile.currentDesignation && profile.currentOrganization && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary/60" />
                  <span>{profile.currentDesignation}, {profile.currentOrganization}</span>
                </div>
              )}
              {brand?.heroShowLocation && profile.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary/60" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            <div className="hero-slide-up hero-delay-5 flex flex-col sm:flex-row gap-2.5 pt-1">
              <Button size="lg" className="h-11 px-6 text-sm rounded-lg" render={<Link href={brand?.heroPrimaryCtaDest || "/about"} />}>
                {brand?.heroPrimaryCtaLabel || "Profile"} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6 text-sm rounded-lg" render={<Link href={brand?.heroSecondaryCtaDest || "/contact"} />}>
                {brand?.heroSecondaryCtaLabel || "Connect"}
              </Button>
              {brand?.heroShowCvCta && profile.resumeUrl && (
                <Button size="lg" variant="ghost" className="h-11 px-6 text-sm rounded-lg" render={<a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" />}>
                  {brand.heroCvCtaLabel || "View CV"}
                </Button>
              )}
            </div>

            {(brand?.heroShowQualifications || brand?.heroShowInterests) && (
              <div className="hero-slide-up hero-delay-6 flex items-center gap-6 pt-3">
                {brand?.heroShowQualifications && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4 text-primary/60" />
                      <span>{quals.length} Qualifications</span>
                    </div>
                    {brand?.heroShowInterests && <div className="w-px h-3 bg-border" />}
                  </>
                )}
                {brand?.heroShowInterests && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4 text-primary/60" />
                    <span>Internal Medicine</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Portrait column with DB-driven overlays */}
          <div className="col-span-5 flex justify-center lg:justify-end overflow-visible lg:-translate-y-16">
            <HeroPortraitStage
              profileImage={brand?.profileImage}
              displayName={profile.displayName}
              portraitScale={brand?.portraitScale}
              portraitX={brand?.portraitX}
              portraitY={brand?.portraitY}
              portraitFit={brand?.portraitFit}
              className="hero-slide-right hero-delay-3"
            >
              {/* Desktop overlay cards from DB with pocket animation */}
              {overlays.filter((o) => o.desktopVisible).map((o) => {
                const style = overlayStyleMap[o.styleVariant] || overlayStyleMap.glass
                return (
                  <HeroOverlayPocket
                    key={o.key}
                    style={style}
                    x={o.desktopX}
                    y={o.desktopY}
                    width={o.width}
                    opacity={o.opacity}
                    sortOrder={o.sortOrder}
                  >
                    <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary/60">{o.label}</div>
                    <div className="text-xs font-semibold text-foreground mt-0.5">{getOverlayValue(o)}</div>
                  </HeroOverlayPocket>
                )
              })}
            </HeroPortraitStage>
          </div>
        </div>
      </div>
    </section>
  )
}
