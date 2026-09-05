import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { aiService } from "@/services/ai/ai.service"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const messages = await aiService.getConversationMessages(id)
    return NextResponse.json(messages)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
