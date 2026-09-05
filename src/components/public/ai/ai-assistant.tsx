"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, RotateCcw, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface AiMessage {
  role: "user" | "assistant"
  content: string
}

interface AiAssistantProps {
  assistantName?: string
  assistantAvatar?: string | null
  welcomeMessage?: string
  statusText?: string
  suggestedQuestions?: string[]
}

function AvatarDisplay({ size = "sm", avatar, name }: { size?: "sm" | "lg"; avatar?: string | null; name: string }) {
  const sizeClass = size === "lg" ? "h-10 w-10" : "h-7 w-7"
  if (avatar) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden relative shrink-0`}>
        <Image src={avatar} alt={name} fill className="object-cover" sizes="40px" />
      </div>
    )
  }
  return (
    <div className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center shrink-0`}>
      <span className={`font-bold text-primary ${size === "lg" ? "text-sm" : "text-xs"}`}>
        {name?.charAt(0) || "A"}
      </span>
    </div>
  )
}

const SESSION_KEY = "ai_onboarded"

export function AiAssistant({
  assistantName = "Assistant",
  assistantAvatar,
  welcomeMessage,
  statusText = "Online",
  suggestedQuestions,
}: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem(SESSION_KEY) === "true"
    return false
  })
  const [visitorName, setVisitorName] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("ai_visitor_name") || ""
    return ""
  })
  const [visitorPhone, setVisitorPhone] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("ai_visitor_phone") || ""
    return ""
  })
  const [messages, setMessages] = useState<AiMessage[]>(() => {
    const savedName = typeof window !== "undefined" ? sessionStorage.getItem("ai_visitor_name") || "" : ""
    const isOnboarded = typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "true"
    if (isOnboarded) {
      return [
        {
          role: "assistant" as const,
          content:
            welcomeMessage ||
            `Hello${savedName ? ", " + savedName : ""}. I can help with information about the doctor's qualifications, experience, practice locations and professional work.`,
        },
      ]
    }
    return [
      {
        role: "assistant" as const,
        content: welcomeMessage || `Hello. I can help with information about the doctor's qualifications, experience, practice locations and professional work.`,
      },
    ]
  })
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const defaultSuggestions = [
    "What are the doctor's qualifications?",
    "Where does the doctor practice?",
    "Professional experience",
    "How can I make an appointment?",
  ]
  const suggestions = suggestedQuestions?.length ? suggestedQuestions : defaultSuggestions

  useEffect(() => {
    if (isOpen && !onboardingComplete) {
      setTimeout(() => nameInputRef.current?.focus(), 100)
    }
  }, [isOpen, onboardingComplete])

  useEffect(() => {
    if (isOpen && onboardingComplete) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, onboardingComplete])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#ai-assistant-trigger") {
        setIsOpen(true)
      }
    }
    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false)
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [isOpen])

  const handleContinueOnboarding = () => {
    const trimmed = visitorName.trim()
    if (!trimmed) return
    const cleanedName = trimmed.slice(0, 100)
    const cleanedPhone = visitorPhone.trim().slice(0, 20)
    setVisitorName(cleanedName)
    setVisitorPhone(cleanedPhone)
    sessionStorage.setItem(SESSION_KEY, "true")
    sessionStorage.setItem("ai_visitor_name", cleanedName)
    sessionStorage.setItem("ai_visitor_phone", cleanedPhone)
    setOnboardingComplete(true)
    setMessages([
      {
        role: "assistant",
        content:
          welcomeMessage ||
          `Hello, ${cleanedName}. I can help with information about the doctor's qualifications, experience, practice locations and professional work.`,
      },
    ])
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: AiMessage = { role: "user", content: content.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    const isFirstMessage = messages.length === 0 || (messages.length === 1 && messages[0].role === "assistant")

    const body: Record<string, unknown> = {
      conversationId,
      messages: newMessages,
    }
    if (isFirstMessage && !conversationId) {
      body.visitorName = visitorName
      body.visitorPhone = visitorPhone
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      setMessages([...newMessages, { role: "assistant", content: data.content }])
      setConversationId(data.conversationId)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get response"
      toast.error(message)
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const resetConversation = () => {
    setOnboardingComplete(false)
    setVisitorName("")
    setVisitorPhone("")
    setMessages([
      {
        role: "assistant" as const,
        content:
          welcomeMessage ||
          `Hello. I can help with information about the doctor's qualifications, experience, practice locations and professional work.`,
      },
    ])
    setConversationId(null)
    setInput("")
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem("ai_visitor_name")
    sessionStorage.removeItem("ai_visitor_phone")
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const visitorFirstName = visitorName.split(/\s+/)[0] || ""
  const showSuggestions = onboardingComplete && (messages.length <= 1)

  return (
    <>
      {/* Launcher Button */}
      <button
        id="ai-assistant-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 lg:bottom-6 right-6 z-50 group"
        aria-label={isOpen ? "Close assistant" : "Open doctor assistant"}
      >
        <div className="relative">
          {isOpen ? (
            <div className="h-12 w-12 rounded-full bg-foreground flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <X className="h-4 w-4 text-background" />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg ring-2 ring-primary/20 transition-transform group-hover:scale-105 overflow-hidden relative">
              {assistantAvatar ? (
                <Image src={assistantAvatar} alt={assistantName} fill className="object-cover" sizes="48px" />
              ) : (
                <span className="text-base font-bold text-primary-foreground">
                  {assistantName?.charAt(0) || "A"}
                </span>
              )}
            </div>
          )}
          {!isOpen && (
            <span
              className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center"
              role="status"
              aria-label="Assistant available"
            >
              <span className="sr-only">{statusText}</span>
            </span>
          )}
        </div>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-36 lg:bottom-20 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-10rem)] bg-card border border-border/50 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-sm"
          role="dialog"
          aria-label="Doctor Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AvatarDisplay size="lg" avatar={assistantAvatar} name={assistantName} />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {assistantName}
                  {onboardingComplete && visitorFirstName && (
                    <span className="text-muted-foreground font-normal ml-1.5 text-xs">
                      &middot; {visitorFirstName}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                  {statusText}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onboardingComplete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={resetConversation}
                  title="Reset conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Onboarding */}
          {!onboardingComplete && (
            <div className="flex-grow flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-sm space-y-5">
                <div className="text-center space-y-1">
                  <h4 className="text-base font-semibold">
                    আপনার নাম লিখুন
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Please enter your name
                  </p>
                </div>

                <div className="space-y-3">
                  <Input
                    ref={nameInputRef}
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value.slice(0, 100))}
                    placeholder="Name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && visitorName.trim()) {
                        e.preventDefault()
                        handleContinueOnboarding()
                      }
                    }}
                    className="rounded-full px-4"
                  />
                  <Input
                    value={visitorPhone}
                    onChange={(e) => {
                      const val = e.target.value
                      if (/^[0-9+\s\-()]*$/.test(val)) {
                        setVisitorPhone(val.slice(0, 20))
                      }
                    }}
                    placeholder="মোবাইল নম্বর (ঐচ্ছিক) / Mobile number (optional)"
                    className="rounded-full px-4"
                  />
                </div>

                <Button
                  onClick={handleContinueOnboarding}
                  disabled={!visitorName.trim()}
                  className="w-full rounded-full"
                >
                  Continue
                </Button>

                <p className="text-center text-[10px] text-muted-foreground leading-relaxed">
                  By continuing, your inquiry may be stored for follow-up.
                </p>
              </div>
            </div>
          )}

          {/* Chat State */}
          {onboardingComplete && (
            <>
              {/* Messages */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      {msg.role === "assistant" && (
                        <AvatarDisplay avatar={assistantAvatar} name={assistantName} />
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        {msg.role === "assistant" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 mt-1 opacity-40 hover:opacity-100"
                            onClick={() => copyToClipboard(msg.content, idx)}
                          >
                            {copiedIndex === idx ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2">
                      <AvatarDisplay avatar={assistantAvatar} name={assistantName} />
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                          <div className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.15s]" />
                          <div className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.3s]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestion Chips */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {suggestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1.5 rounded-full border-border/50"
                      onClick={() => sendMessage(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-border/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(input)
                  }}
                  className="flex gap-2"
                >
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about the doctor..."
                    disabled={isLoading}
                    className="flex-grow rounded-full px-4"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="h-10 w-10 rounded-full shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
