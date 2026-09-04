import { Navbar } from "@/components/public/layout/navbar"
import { Footer } from "@/components/public/layout/footer"
import { AiAssistant } from "@/components/public/ai/ai-assistant"
import { MobileBottomDock } from "@/components/public/layout/mobile-bottom-dock"
import { VerticalTimeRail, MobileInfoBar } from "@/components/public/shared/vertical-time-rail"
import { ScrollProgress } from "@/components/public/shared/scroll-progress"
import { BackToTop } from "@/components/public/shared/back-to-top"
import { MedicalCursor } from "@/components/shared/medical-cursor"
import { settingsService } from "@/services/settings/settings.service"
import { aiService } from "@/services/ai/ai.service"
import type { NavigationItem, SocialLink } from "@prisma/client"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let navItems: NavigationItem[] = []
  let brandSettings = null
  let siteSettings = null
  let socialLinks: SocialLink[] = []
  let aiSettings = null
  let profile = null
  try {
    ;[brandSettings, siteSettings, navItems, socialLinks, aiSettings, profile] = await Promise.all([
      settingsService.getBrandSettings(),
      settingsService.getSiteSettings(),
      settingsService.getNavigation(),
      settingsService.getSocialLinks(),
      aiService.getSettings(),
      (await import("@/services/profile/profile.service")).profileService.getPublicProfile().catch(() => null),
    ])
  } catch {
    // Database unavailable
  }

  const showLocalInfo = siteSettings?.showLocalInfo ?? false
  const timezone = showLocalInfo ? (siteSettings?.timezone || "UTC") : undefined
  const location = showLocalInfo ? (profile?.location || undefined) : undefined
  const motionLevel = (siteSettings as Record<string, unknown>)?.motionLevel as string || "subtle"
  const cursorReactive = (siteSettings as Record<string, unknown>)?.cursorReactiveEffect !== false
  const cursorMode = ((siteSettings as Record<string, unknown>)?.cursorMode as string) || "normal"
  const showCustomCursor = motionLevel !== "off" && cursorReactive && cursorMode !== "normal"

  return (
    <>
      {showCustomCursor && (
        <style dangerouslySetInnerHTML={{ __html: "*, *::before, *::after { cursor: none !important; } body { cursor: none !important; }" }} />
      )}
      {showCustomCursor && <MedicalCursor mode={cursorMode as "stethoscope" | "capsule"} />}
      <ScrollProgress />
      {showLocalInfo && <MobileInfoBar timezone={timezone} location={location} />}
      <Navbar
        navItems={navItems}
        brandLogo={brandSettings?.logo ?? undefined}
        siteName={brandSettings?.siteName || "Portfolio"}
      />
      <main className="flex-grow pb-16 lg:pb-0">
        {showLocalInfo && <VerticalTimeRail timezone={timezone} location={location} />}
        {children}
      </main>
      <Footer />
      <BackToTop />
      {aiSettings?.enabled && (
        <AiAssistant
          assistantName={aiSettings.assistantName}
          welcomeMessage={aiSettings.welcomeMessage ?? undefined}
        />
      )}
      <MobileBottomDock navItems={navItems} />
    </>
  )
}
