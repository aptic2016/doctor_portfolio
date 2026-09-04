import { auth } from "@/lib/auth/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [treatments, locations, settings, socialLinks] = await Promise.all([
      prisma.footerTreatment.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.footerLocation.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.footerSetting.findFirst(),
      prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } }),
    ])

    return NextResponse.json({ treatments, locations, settings, socialLinks })
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

    if (data.type === "setting") {
      const existing = await prisma.footerSetting.findFirst()
      if (existing) {
        await prisma.footerSetting.update({ where: { id: existing.id }, data: data.payload })
      } else {
        await prisma.footerSetting.create({ data: data.payload })
      }
    }

    revalidatePath("/")
    revalidatePath("/admin/footer")
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
