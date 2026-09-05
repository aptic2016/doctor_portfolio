import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { aiService } from "@/services/ai/ai.service"
import { knowledgeService } from "@/services/ai/knowledge.service"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    if (data.type === "knowledge") {
      const { id, title, content, category, isEnabled, sortOrder } = data
      if (id) {
        const updated = await prisma.aiAssistantKnowledge.update({
          where: { id },
          data: { title, content, category, isEnabled, sortOrder },
        })
        return NextResponse.json(updated)
      } else {
        const created = await prisma.aiAssistantKnowledge.create({
          data: { title, content, category, isEnabled: isEnabled ?? true, sortOrder: sortOrder ?? 0 },
        })
        return NextResponse.json(created)
      }
    }

    if (data.type === "knowledge-delete") {
      await prisma.aiAssistantKnowledge.delete({ where: { id: data.id } })
      return NextResponse.json({ success: true })
    }

    if (data.type === "test-connection") {
      const result = await aiService.testConnection()
      return NextResponse.json(result)
    }

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
