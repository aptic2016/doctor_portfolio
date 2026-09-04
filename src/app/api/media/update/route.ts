import { NextRequest, NextResponse } from "next/server"
import { mediaService } from "@/services/media/media.service"
import { auth } from "@/lib/auth/auth"

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 })
    }

    const asset = await mediaService.updateAsset(id, data)
    return NextResponse.json(asset)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
