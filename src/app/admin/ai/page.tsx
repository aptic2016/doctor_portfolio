import { AiSettingsAdmin } from "./ai-settings-admin"
import { aiService } from "@/services/ai/ai.service"
import { prisma } from "@/lib/db"

export default async function AdminAiPage() {
  let settings: Awaited<ReturnType<typeof aiService.getSettings>> = null
  let knowledge: Awaited<ReturnType<typeof prisma.aiAssistantKnowledge.findMany>> = []
  let stats = { total: 0, today: 0, totalMessages: 0, withPhone: 0 }
  let conversations: { id: string; visitorName: string; visitorPhone: string | null; startedAt: string; lastMessageAt: string; messageCount: number }[] = []
  try {
    ;[settings, knowledge] = await Promise.all([
      aiService.getSettings(),
      prisma.aiAssistantKnowledge.findMany({ orderBy: { sortOrder: "asc" } }),
    ])
  } catch {
    settings = null
    knowledge = []
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [total, todayCount, totalMessages, withPhone, recentConversations] = await Promise.all([
      prisma.aiConversation.count(),
      prisma.aiConversation.count({ where: { startedAt: { gte: today } } }),
      prisma.aiConversation.aggregate({ _sum: { messageCount: true } }).then((r) => r._sum.messageCount ?? 0),
      prisma.aiConversation.count({ where: { visitorPhone: { not: null } } }),
      prisma.aiConversation.findMany({
        orderBy: { lastMessageAt: "desc" },
        take: 20,
        select: {
          id: true,
          visitorName: true,
          visitorPhone: true,
          startedAt: true,
          lastMessageAt: true,
          messageCount: true,
        },
      }).then((list) =>
        list.map((c) => ({
          ...c,
          startedAt: c.startedAt.toISOString(),
          lastMessageAt: c.lastMessageAt.toISOString(),
        }))
      ),
    ])

    stats = { total, today: todayCount, totalMessages, withPhone }
    conversations = recentConversations
  } catch {
    stats = { total: 0, today: 0, totalMessages: 0, withPhone: 0 }
    conversations = []
  }

  const apiKeyConfigured = !!process.env.GROQ_API_KEY
  const configuredModel = process.env.AI_MODEL || "llama-3.1-8b-instant"
  const configuredProvider = process.env.AI_PROVIDER || "groq"

  return (
    <AiSettingsAdmin
      initialSettings={settings}
      initialKnowledge={knowledge}
      initialStats={stats}
      initialConversations={conversations}
      apiKeyConfigured={apiKeyConfigured}
      configuredModel={configuredModel}
      configuredProvider={configuredProvider}
    />
  )
}
