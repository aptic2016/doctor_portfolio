import { NextRequest, NextResponse } from "next/server"
import { mediaService } from "@/services/media/media.service"
import { auth } from "@/lib/auth/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { assetIds, action } = await req.json()
    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: "No assets selected" }, { status: 400 })
    }
    if (assetIds.length > 50) {
      return NextResponse.json({ error: "Maximum 50 assets per batch" }, { status: 400 })
    }
    if (!["trash", "restore", "permanent-delete", "remove-missing"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    let successCount = 0
    let failedCount = 0
    const failedIds: string[] = []

    if (action === "trash") {
      for (const id of assetIds) {
        try {
          await mediaService.trashAsset(id)
          successCount++
        } catch {
          failedCount++
          failedIds.push(id)
        }
      }
    } else if (action === "restore") {
      for (const id of assetIds) {
        try {
          await mediaService.restoreAsset(id)
          successCount++
        } catch {
          failedCount++
          failedIds.push(id)
        }
      }
    } else if (action === "permanent-delete") {
      for (const id of assetIds) {
        try {
          await mediaService.permanentDelete(id)
          successCount++
        } catch {
          failedCount++
          failedIds.push(id)
        }
      }
    } else if (action === "remove-missing") {
      for (const id of assetIds) {
        try {
          await mediaService.removeRecordOnly(id)
          successCount++
        } catch {
          failedCount++
          failedIds.push(id)
        }
      }
    }

    return NextResponse.json({ successCount, failedCount, failedIds })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
