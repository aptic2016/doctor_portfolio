import { auth } from "@/lib/auth/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { HOME_GALLERY_LIMIT } from "@/components/public/gallery/gallery-photos"

/** Widest home teaser we allow, so the section can never swallow the page. */
const MAX_HOME_GALLERY_LIMIT = 12

/**
 * Accepts whatever the form sends (number, numeric string, empty, junk) and
 * returns a whole number inside the supported range, falling back to the
 * shared default the home section itself uses.
 */
function clampHomeLimit(value: unknown) {
  const parsed = Math.trunc(Number(value))
  if (!Number.isFinite(parsed) || parsed < 1) return HOME_GALLERY_LIMIT
  return Math.min(parsed, MAX_HOME_GALLERY_LIMIT)
}

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const settings = await prisma.siteSettings.findFirst()
    return NextResponse.json(settings || {})
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const data = await req.json()
    const existing = await prisma.siteSettings.findFirst()

    /* The home gallery teaser count is the one numeric field here, and it comes
       from a text input, so it is coerced and clamped server-side: a bad value
       must never reach Prisma (type error) or make the home page unbounded. */
    const galleryHomeLimit = clampHomeLimit(data.galleryHomeLimit)

    if (existing) {
      await prisma.siteSettings.update({
        where: { id: existing.id },
        data: {
          siteUrl: data.siteUrl ?? undefined,
          siteTitle: data.siteTitle ?? undefined,
          siteDescription: data.siteDescription ?? undefined,
          defaultLanguage: data.defaultLanguage ?? undefined,
          timezone: data.timezone ?? undefined,
          contactVisibility: data.contactVisibility ?? undefined,
          analyticsId: data.analyticsId ?? undefined,
          aiEnabled: data.aiEnabled ?? undefined,
          galleryEnabled: data.galleryEnabled ?? undefined,
          galleryLabel: data.galleryLabel ?? undefined,
          galleryHomeLimit,
          blogEnabled: data.blogEnabled ?? undefined,
          maintenanceMode: data.maintenanceMode ?? undefined,
          footerText: data.footerText ?? undefined,
          copyrightText: data.copyrightText ?? undefined,
          showLocalInfo: data.showLocalInfo ?? undefined,
          showAgencyBranding: data.showAgencyBranding ?? undefined,
          agencyName: data.agencyName ?? undefined,
          agencyUrl: data.agencyUrl ?? undefined,
          agencyLabel: data.agencyLabel ?? undefined,
          showDemoBadge: data.showDemoBadge ?? undefined,
          motionLevel: data.motionLevel ?? undefined,
          cursorReactiveEffect: data.cursorReactiveEffect ?? undefined,
          cursorMode: data.cursorMode ?? undefined,
          heroOverlayEntrance: data.heroOverlayEntrance ?? undefined,
          connectCue: data.connectCue ?? undefined,
          connectCueStyle: data.connectCueStyle ?? undefined,
        },
      })
    } else {
      await prisma.siteSettings.create({ data: { ...data, galleryHomeLimit } })
    }

    revalidatePath("/")
    revalidatePath("/admin/settings")
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
