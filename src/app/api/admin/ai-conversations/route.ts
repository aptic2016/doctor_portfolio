import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { aiService } from "@/services/ai/ai.service"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || undefined
    const dateFrom = searchParams.get("dateFrom") || undefined
    const dateTo = searchParams.get("dateTo") || undefined
    const sort = (searchParams.get("sort") as "newest" | "oldest") || "newest"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const pageSize = parseInt(searchParams.get("pageSize") || "25")

    const [result, stats] = await Promise.all([
      aiService.getConversations({
        search,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        sort,
        page,
        pageSize,
      }),
      aiService.getConversationStats(),
    ])

    return NextResponse.json({ ...result, stats })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    if (body.ids && Array.isArray(body.ids)) {
      await aiService.deleteConversations(body.ids)
    } else if (body.id) {
      await aiService.deleteConversation(body.id)
    } else {
      return NextResponse.json({ error: "Missing id or ids" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
