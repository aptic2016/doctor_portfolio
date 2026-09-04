import { auth } from "@/lib/auth/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

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
      await prisma.siteSettings.create({ data })
    }

    revalidatePath("/")
    revalidatePath("/admin/settings")
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
