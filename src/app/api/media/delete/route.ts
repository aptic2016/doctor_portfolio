import { NextRequest, NextResponse } from "next/server"
import { mediaService } from "@/services/media/media.service"
import { auth } from "@/lib/auth/auth"

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const permanent = searchParams.get("permanent") === "true"

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 })
    }

    if (permanent) {
      const result = await mediaService.permanentDelete(id)
      return NextResponse.json({ success: true, cloudinaryResult: result.cloudinaryResult })
    }

    await mediaService.trashAsset(id)
    return NextResponse.json({ success: true, action: "trashed" })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
