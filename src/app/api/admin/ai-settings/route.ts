import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { aiService } from "@/services/ai/ai.service"
import { knowledgeService } from "@/services/ai/knowledge.service"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const settings = await aiService.updateSettings(data)
    return NextResponse.json(settings)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await knowledgeService.rebuildKnowledgeFromContent()
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
