import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const existing = await prisma.seoSettings.findFirst()

    if (existing) {
      const settings = await prisma.seoSettings.update({
        where: { id: existing.id },
        data,
      })
      return NextResponse.json(settings)
    } else {
      const settings = await prisma.seoSettings.create({ data })
      return NextResponse.json(settings)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
