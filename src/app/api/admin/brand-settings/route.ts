import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.brandSettings.findFirst()
    return NextResponse.json(settings || {})
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const existing = await prisma.brandSettings.findFirst()

    if (existing) {
      const settings = await prisma.brandSettings.update({
        where: { id: existing.id },
        data,
      })
      revalidatePath("/")
      return NextResponse.json(settings)
    } else {
      const settings = await prisma.brandSettings.create({ data })
      revalidatePath("/")
      return NextResponse.json(settings)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
