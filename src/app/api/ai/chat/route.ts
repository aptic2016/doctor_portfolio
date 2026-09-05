import { NextRequest, NextResponse } from "next/server"
import { aiService } from "@/services/ai/ai.service"
import { z } from "zod"

const chatSchema = z.object({
  conversationId: z.string().nullable().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().max(2000),
    })
  ).min(1).max(20),
  visitorName: z.string().min(1).max(100).optional(),
  visitorPhone: z.string().max(20).optional(),
})

const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

function checkRateLimit(ip: string, maxRequests: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now - record.lastReset > 60 * 60 * 1000) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return true
  }

  if (record.count >= maxRequests) return false
  record.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const settings = await aiService.getSettings()
    if (!settings?.enabled) {
      return NextResponse.json(
        { error: "AI assistant is currently disabled" },
        { status: 503 }
      )
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const rateLimit = settings.rateLimit || 100

    if (!checkRateLimit(ip, rateLimit)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    const body = await req.json()
    const result = chatSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { conversationId, messages, visitorName, visitorPhone } = result.data

    if (!conversationId && !visitorName) {
      return NextResponse.json(
        { error: "visitorName is required for new conversations" },
        { status: 400 }
      )
    }

    const response = await aiService.chat({
      conversationId: conversationId || null,
      messages,
      visitorName,
      visitorPhone,
    })

    return NextResponse.json(response)
  } catch (error: unknown) {
    console.error("AI chat error:", error)
    const message = error instanceof Error ? error.message : "Failed to process your request"

    if (message.includes("not configured") || message.includes("API key")) {
      return NextResponse.json(
        { error: "The assistant is temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: "The assistant is temporarily unavailable. Please try again later." },
      { status: 500 }
    )
  }
}
