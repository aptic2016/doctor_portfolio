import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { knowledgeService } from "./knowledge.service"

export interface AiMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface AiChatResponse {
  content: string
  conversationId: string
}

export class AiService {
  async getSettings() {
    return prisma.aiSettings.findFirst()
  }

  async updateSettings(data: Prisma.AiSettingsCreateInput) {
    const settings = await prisma.aiSettings.findFirst()
    if (settings) {
      return prisma.aiSettings.update({ where: { id: settings.id }, data })
    }
    return prisma.aiSettings.create({ data })
  }

  async chat(
    conversationId: string | null,
    messages: AiMessage[]
  ): Promise<AiChatResponse> {
    const settings = await this.getSettings()

    if (!settings?.enabled) {
      throw new Error("AI assistant is currently disabled")
    }

    let convId = conversationId
    if (!convId) {
      const conv = await prisma.aiConversation.create({ data: {} })
      convId = conv.id
    }

    const userMessage = messages[messages.length - 1]
    if (userMessage?.role === "user") {
      await prisma.aiMessage.create({
        data: {
          conversationId: convId,
          role: "USER",
          content: userMessage.content,
        },
      })
    }

    const knowledgeContext = await knowledgeService.buildKnowledgeContext()

    const systemPrompt = this.buildSystemPrompt(settings, knowledgeContext)

    const aiMessages: AiMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ]

    const response = await this.callProvider(aiMessages, settings)

    await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: "ASSISTANT",
        content: response,
      },
    })

    return { content: response, conversationId: convId }
  }

  async getConversation(conversationId: string) {
    return prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    })
  }

  private buildSystemPrompt(settings: { systemInstruction: string | null }, knowledgeContext: string): string {
    const baseInstruction = settings.systemInstruction || ""

    return `You are a professional AI assistant for a portfolio website.

IMPORTANT RULES:
1. Only answer based on the verified portfolio data provided below.
2. Never fabricate professional facts, qualifications, jobs, dates, publications, or awards.
3. Never expose private or hidden information.
4. If information is not available in the portfolio, say so naturally.
5. Be helpful, professional, and concise.
6. Do not make up contact details that aren't provided.
7. Stay grounded in the provided data at all times.

${baseInstruction ? `\nAdditional Instructions:\n${baseInstruction}\n` : ""}
Verified Portfolio Data:
${knowledgeContext || "No portfolio data available."}`
  }

  private async callProvider(messages: AiMessage[], settings: { temperature: number | null; maxTokens: number | null }): Promise<string> {
    const provider = process.env.AI_PROVIDER || "openai"
    const apiKey = process.env.AI_API_KEY
    const model = process.env.AI_MODEL || "gpt-4o"

    if (!apiKey) {
      throw new Error("AI provider not configured")
    }

    switch (provider) {
      case "openai":
        return this.callOpenAI(messages, apiKey, model, settings)
      case "anthropic":
        return this.callAnthropic(messages, apiKey, model, settings)
      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }
  }

  private async callOpenAI(
    messages: AiMessage[],
    apiKey: string,
    model: string,
    settings: { temperature: number | null; maxTokens: number | null }
  ): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: settings.temperature || 0.7,
        max_tokens: settings.maxTokens || 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "AI request failed")
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || "No response generated."
  }

  private async callAnthropic(
    messages: AiMessage[],
    apiKey: string,
    model: string,
    settings: { temperature: number | null; maxTokens: number | null }
  ): Promise<string> {
    const systemMessage = messages.find((m) => m.role === "system")
    const otherMessages = messages.filter((m) => m.role !== "system")

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: settings.maxTokens || 1000,
        temperature: settings.temperature || 0.7,
        system: systemMessage?.content || "",
        messages: otherMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "AI request failed")
    }

    const data = await response.json()
    return data.content?.[0]?.text || "No response generated."
  }
}

export const aiService = new AiService()
