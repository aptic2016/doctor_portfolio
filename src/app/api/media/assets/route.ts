import { NextRequest, NextResponse } from "next/server"
import { mediaService } from "@/services/media/media.service"
import { auth } from "@/lib/auth/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const includeMissing = searchParams.get("includeMissing") === "true"

    let assets
    if (includeMissing) {
      assets = await mediaService.getAllAssets()
      const missing = await mediaService.getMissingAssets()
      assets = [...assets, ...missing]
    } else {
      assets = await mediaService.getAllAssets()
    }

    return NextResponse.json(assets)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
