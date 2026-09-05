"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { toast } from "sonner"
import {
  Save, RefreshCw, Plus, Trash2, GripVertical, Search, MessageSquare,
  ChevronLeft, ChevronRight, X, ChevronDown, Calendar, Phone, User,
  Loader2, AlertTriangle, CheckCircle2, XCircle, Wifi,
  WifiOff, Settings, BarChart3, Eye, ArrowUpDown,
} from "lucide-react"

interface AiSettings {
  id?: string
  enabled: boolean
  assistantName: string
  assistantAvatar?: string | null
  welcomeMessage: string | null
  statusText: string
  systemInstruction: string | null
  temperature: number
  maxTokens: number
  rateLimit: number
  doctorOnlyScope: boolean
  lastSuccessfulRequest?: string | null
  lastFailedRequest?: string | null
  lastErrorType?: string | null
  lastLatency?: number | null
}

interface KnowledgeEntry {
  id: string
  title: string
  content: string
  category: string
  isEnabled: boolean
  sortOrder: number
}

interface ConversationEntry {
  id: string
  visitorName: string | null
  visitorPhone: string | null
  startedAt: string
  lastMessageAt: string
  messageCount: number
  lastMessage?: string
}

interface ConversationStats {
  total: number
  today: number
  totalMessages: number
  withPhone: number
}

interface ConversationMessage {
  id: string
  role: string
  content: string
  createdAt: string
}

const CATEGORIES = ["General", "Practice", "Appointments", "Services", "Education", "Experience", "Qualifications", "Publications", "Other"]
type DateFilter = "all" | "today" | "7d" | "30d" | "90d" | "custom"
function formatDate(d: string | Date) {
  const date = new Date(d)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined })
}

export function AiSettingsAdmin({
  initialSettings,
  initialKnowledge,
  initialStats,
  initialConversations,
  apiKeyConfigured,
  configuredModel,
  configuredProvider,
}: {
  initialSettings: AiSettings | null
  initialKnowledge: KnowledgeEntry[]
  initialStats: ConversationStats
  initialConversations: ConversationEntry[]
  apiKeyConfigured: boolean
  configuredModel: string
  configuredProvider: string
}) {
  // Tab state
  const [activeTab, setActiveTab] = useState<"settings" | "conversations">("settings")

  // Settings state
  const [settings, setSettings] = useState<AiSettings>({
    enabled: initialSettings?.enabled ?? true,
    assistantName: initialSettings?.assistantName ?? "Assistant",
    assistantAvatar: initialSettings?.assistantAvatar ?? null,
    welcomeMessage: initialSettings?.welcomeMessage ?? "",
    statusText: initialSettings?.statusText ?? "Online",
    systemInstruction: initialSettings?.systemInstruction ?? "",
    temperature: initialSettings?.temperature ?? 0.7,
    maxTokens: initialSettings?.maxTokens ?? 1000,
    rateLimit: initialSettings?.rateLimit ?? 100,
    doctorOnlyScope: initialSettings?.doctorOnlyScope ?? true,
  })
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>(initialKnowledge)
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Provider health
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [providerHealth, setProviderHealth] = useState({
    status: initialSettings?.lastSuccessfulRequest ? "connected" : "not_configured",
    lastSuccessfulRequest: initialSettings?.lastSuccessfulRequest ?? null,
    lastFailedRequest: initialSettings?.lastFailedRequest ?? null,
    lastErrorType: initialSettings?.lastErrorType ?? null,
    lastLatency: initialSettings?.lastLatency ?? null,
  })

  // Conversations state
  const [conversations, setConversations] = useState<ConversationEntry[]>(initialConversations)
  const [conversationStats, setConversationStats] = useState<ConversationStats>(initialStats)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [conversationPage, setConversationPage] = useState(0)
  const [conversationTotal, setConversationTotal] = useState(initialStats.total)
  const [hasMore, setHasMore] = useState(initialConversations.length >= 20)
  const conversationPageSize = 20

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [customDateFrom, setCustomDateFrom] = useState("")
  const [customDateTo, setCustomDateTo] = useState("")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  // Conversation detail
  const [viewingConversation, setViewingConversation] = useState<string | null>(null)
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  const fetchConversations = useCallback(async (page: number, search: string, dateF: DateFilter, from: string, to: string, sort: string) => {
    setIsLoadingConversations(true)
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        pageSize: String(conversationPageSize),
        sort,
      })
      if (search) params.set("search", search)
      if (dateF !== "all") {
        const now = new Date()
        if (dateF === "today") {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          params.set("dateFrom", today.toISOString())
        } else if (dateF === "7d") {
          const d = new Date(now); d.setDate(d.getDate() - 7)
          params.set("dateFrom", d.toISOString())
        } else if (dateF === "30d") {
          const d = new Date(now); d.setDate(d.getDate() - 30)
          params.set("dateFrom", d.toISOString())
        } else if (dateF === "90d") {
          const d = new Date(now); d.setDate(d.getDate() - 90)
          params.set("dateFrom", d.toISOString())
        } else if (dateF === "custom" && from) {
          params.set("dateFrom", from)
          if (to) params.set("dateTo", to)
        }
      }

      const res = await fetch(`/api/admin/ai-conversations?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()

      setConversations(data.conversations || [])
      setConversationTotal(data.total || 0)
      setHasMore((data.conversations?.length || 0) >= conversationPageSize)
      setConversationStats(data.stats || { total: 0, today: 0, totalMessages: 0, withPhone: 0 })
      setSelectedIds(new Set())
    } catch {
      toast.error("Failed to load conversations")
    } finally {
      setIsLoadingConversations(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations(conversationPage, searchQuery, dateFilter, customDateFrom, customDateTo, sortOrder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationPage, sortOrder, dateFilter])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setConversationPage(0)
      fetchConversations(0, searchQuery, dateFilter, customDateFrom, customDateTo, sortOrder)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, customDateFrom, customDateTo])

  const handleSearchChange = (val: string) => setSearchQuery(val)
  const handleDateFilterChange = (val: DateFilter) => {
    setDateFilter(val)
    setConversationPage(0)
    fetchConversations(0, searchQuery, val, customDateFrom, customDateTo, sortOrder)
  }
  const handleSortChange = (val: "desc" | "asc") => {
    setSortOrder(val)
    setConversationPage(0)
    fetchConversations(0, searchQuery, dateFilter, customDateFrom, customDateTo, val)
  }
  const handleCustomDateApply = () => {
    setConversationPage(0)
    fetchConversations(0, searchQuery, "custom", customDateFrom, customDateTo, sortOrder)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === conversations.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(conversations.map((c) => c.id)))
    }
  }
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      const res = await fetch("/api/admin/ai-conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error("Failed to delete")
      setDeleteConfirmId(null)
      fetchConversations(conversationPage, searchQuery, dateFilter, customDateFrom, customDateTo, sortOrder)
      toast.success("Conversation deleted")
    } catch {
      toast.error("Failed to delete conversation")
    }
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      const res = await fetch("/api/admin/ai-conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) throw new Error("Failed to delete")
      setBulkDeleteConfirm(false)
      fetchConversations(conversationPage, searchQuery, dateFilter, customDateFrom, customDateTo, sortOrder)
      toast.success(`${ids.length} conversation(s) deleted`)
    } catch {
      toast.error("Failed to delete conversations")
    }
  }

  const handleViewConversation = async (id: string) => {
    setViewingConversation(id)
    setIsLoadingMessages(true)
    try {
      const res = await fetch(`/api/admin/ai-conversations/${id}/messages`)
      if (!res.ok) throw new Error("Failed to load messages")
      const data = await res.json()
      setConversationMessages(data.messages || [])
    } catch {
      toast.error("Failed to load conversation messages")
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Settings handlers
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("AI settings saved")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRebuildKnowledge = async () => {
    try {
      const res = await fetch("/api/admin/ai-settings", { method: "PATCH" })
      if (!res.ok) throw new Error("Failed to rebuild")
      toast.success("Website knowledge base rebuilt")
    } catch {
      toast.error("Failed to rebuild knowledge")
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "test-connection" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Connection failed")
      setProviderHealth({
        status: "connected",
        lastSuccessfulRequest: new Date().toISOString(),
        lastFailedRequest: providerHealth.lastFailedRequest,
        lastErrorType: null,
        lastLatency: data.latency ?? null,
      })
      toast.success(`Connected successfully${data.latency ? ` (${data.latency}ms)` : ""}`)
    } catch (err) {
      setProviderHealth((prev) => ({
        ...prev,
        status: "error",
        lastFailedRequest: new Date().toISOString(),
        lastErrorType: err instanceof Error ? err.message : "Unknown error",
      }))
      toast.error("Connection test failed")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveKnowledge = async () => {
    if (!editingKnowledge) return
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "knowledge", ...editingKnowledge }),
      })
      if (!res.ok) throw new Error("Failed to save")
      const saved = await res.json()
      if (editingKnowledge.id) {
        setKnowledge(knowledge.map((k) => (k.id === saved.id ? saved : k)))
      } else {
        setKnowledge([...knowledge, saved])
      }
      setEditingKnowledge(null)
      toast.success("Knowledge entry saved")
    } catch {
      toast.error("Failed to save knowledge entry")
    }
  }

  const handleDeleteKnowledge = async (id: string) => {
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "knowledge-delete", id }),
      })
      if (!res.ok) throw new Error("Failed to delete")
      setKnowledge(knowledge.filter((k) => k.id !== id))
      toast.success("Knowledge entry deleted")
    } catch {
      toast.error("Failed to delete knowledge entry")
    }
  }

  const handleToggleKnowledge = async (entry: KnowledgeEntry) => {
    const updated = { ...entry, isEnabled: !entry.isEnabled }
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "knowledge", ...updated }),
      })
      if (!res.ok) throw new Error("Failed to update")
      const saved = await res.json()
      setKnowledge(knowledge.map((k) => (k.id === saved.id ? saved : k)))
    } catch {
      toast.error("Failed to toggle knowledge entry")
    }
  }

  const providerStatusColor = {
    connected: "text-green-600",
    error: "text-red-600",
    not_configured: "text-muted-foreground",
  }[providerHealth.status] || "text-muted-foreground"

  const providerStatusIcon = {
    connected: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    error: <XCircle className="h-4 w-4 text-red-600" />,
    not_configured: <WifiOff className="h-4 w-4 text-muted-foreground" />,
  }[providerHealth.status] || <WifiOff className="h-4 w-4 text-muted-foreground" />

  const startIdx = conversationPage * conversationPageSize + 1
  const endIdx = Math.min((conversationPage + 1) * conversationPageSize, conversationTotal)

  // Conversation detail view
  if (viewingConversation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setViewingConversation(null); setConversationMessages([]) }}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-xl font-bold">Conversation</h2>
        </div>

        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              {conversationMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No messages found.</p>
              ) : (
                conversationMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">Configure the doctor-specific AI assistant.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["settings", "conversations"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "settings" ? <Settings className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
            {tab === "settings" ? "Settings" : "Conversations"}
          </button>
        ))}
      </div>

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <>
          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" onClick={handleRebuildKnowledge}>
              <RefreshCw className="h-4 w-4 mr-2" /> Rebuild Website Knowledge
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General */}
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>Basic assistant configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable AI Assistant</Label>
                    <p className="text-xs text-muted-foreground">Show the chat widget to visitors.</p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assistantName">Assistant Name</Label>
                  <Input
                    id="assistantName"
                    value={settings.assistantName}
                    onChange={(e) => setSettings({ ...settings, assistantName: e.target.value })}
                    placeholder="e.g. Dr. Rahman's Assistant"
                  />
                  <p className="text-xs text-muted-foreground">Dynamic default: uses current doctor&apos;s display name.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={settings.welcomeMessage ?? ""}
                    onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                    rows={3}
                    placeholder="Leave empty for dynamic default based on current doctor profile."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Assistant avatar and status display</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="statusText">Status Text</Label>
                  <Input
                    id="statusText"
                    value={settings.statusText}
                    onChange={(e) => setSettings({ ...settings, statusText: e.target.value })}
                    placeholder="Online"
                  />
                  <p className="text-xs text-muted-foreground">Shown next to the green status dot.</p>
                </div>
                <MediaPicker
                  value={settings.assistantAvatar || undefined}
                  onChange={(url) => setSettings({ ...settings, assistantAvatar: url || null })}
                  label="Assistant Avatar"
                  purpose="GENERAL"
                />
              </CardContent>
            </Card>

            {/* Provider Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Provider
                  {providerStatusIcon}
                </CardTitle>
                <CardDescription>AI provider configuration and health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Provider</span>
                  <span className="text-sm font-medium">{configuredProvider}</span>
                </div>
                <p className="text-[11px] text-muted-foreground -mt-2">The service used to generate AI responses. This project uses Groq.</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm">API Key</span>
                  <span className={`text-sm font-medium ${apiKeyConfigured ? "text-green-600" : "text-red-600"}`}>
                    {apiKeyConfigured ? "Configured" : "Missing"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Configured Model</span>
                  <span className="text-sm font-medium">{configuredModel}</span>
                </div>
                <p className="text-[11px] text-muted-foreground -mt-2">The AI model used inside the selected provider.</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <span className={`text-sm font-medium flex items-center gap-1 ${providerStatusColor}`}>
                    {providerHealth.status === "connected" && "Connected"}
                    {providerHealth.status === "error" && "Error"}
                    {providerHealth.status === "not_configured" && "Not Configured"}
                  </span>
                </div>

                {providerHealth.lastSuccessfulRequest && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Successful Request</span>
                    <span className="text-sm text-muted-foreground">{formatDate(providerHealth.lastSuccessfulRequest)}</span>
                  </div>
                )}
                {providerHealth.lastFailedRequest && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Failed Request</span>
                    <span className="text-sm text-muted-foreground">{formatDate(providerHealth.lastFailedRequest)}</span>
                  </div>
                )}
                {providerHealth.lastErrorType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Error</span>
                    <span className="text-sm text-red-600">{providerHealth.lastErrorType}</span>
                  </div>
                )}
                {providerHealth.lastLatency && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Latency</span>
                    <span className="text-sm text-muted-foreground">{providerHealth.lastLatency}ms</span>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="w-full mt-2"
                >
                  {isTestingConnection ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testing...</>
                  ) : (
                    <><Wifi className="h-4 w-4 mr-2" /> Test Connection</>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={settings.temperature}
                      onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) || 0.7 })}
                    />
                    <p className="text-[11px] text-muted-foreground">Controls response creativity. Lower values are more factual. Recommended: 0.1-0.3</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="100"
                      max="4000"
                      value={settings.maxTokens}
                      onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) || 1000 })}
                    />
                    <p className="text-[11px] text-muted-foreground">Maximum length of one AI response. Recommended: ~600</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    min="10"
                    max="1000"
                    value={settings.rateLimit}
                    onChange={(e) => setSettings({ ...settings, rateLimit: parseInt(e.target.value) || 100 })}
                  />
                  <p className="text-[11px] text-muted-foreground">Limits messages per IP per hour. Recommended: ~30</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label>Doctor-Only Scope</Label>
                    <p className="text-xs text-muted-foreground">Restrict AI knowledge to doctor-specific data.</p>
                  </div>
                  <Switch
                    checked={settings.doctorOnlyScope}
                    onCheckedChange={(checked) => setSettings({ ...settings, doctorOnlyScope: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>System Instructions</CardTitle>
                <CardDescription>Custom instructions added to the system prompt.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.systemInstruction ?? ""}
                  onChange={(e) => setSettings({ ...settings, systemInstruction: e.target.value })}
                  rows={5}
                  placeholder="Additional instructions for the AI behavior..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Knowledge */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assistant Knowledge</CardTitle>
                  <CardDescription>
                    Doctor-specific information for the AI. Enabled entries may be disclosed in public responses.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditingKnowledge({
                      id: "",
                      title: "",
                      content: "",
                      category: "General",
                      isEnabled: true,
                      sortOrder: knowledge.length,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingKnowledge && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={editingKnowledge.title}
                        onChange={(e) => setEditingKnowledge({ ...editingKnowledge, title: e.target.value })}
                        placeholder="e.g. Follow-up consultation hours"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select
                        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                        value={editingKnowledge.category}
                        onChange={(e) => setEditingKnowledge({ ...editingKnowledge, category: e.target.value })}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      value={editingKnowledge.content}
                      onChange={(e) => setEditingKnowledge({ ...editingKnowledge, content: e.target.value })}
                      rows={3}
                      placeholder="Detailed information that the AI assistant may share..."
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingKnowledge.isEnabled}
                        onCheckedChange={(checked) => setEditingKnowledge({ ...editingKnowledge, isEnabled: checked })}
                      />
                      <Label className="text-sm">{editingKnowledge.isEnabled ? "Enabled" : "Disabled"}</Label>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      <Button variant="outline" size="sm" onClick={() => setEditingKnowledge(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveKnowledge}>
                        Save Entry
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {knowledge.length === 0 && !editingKnowledge && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No assistant knowledge entries yet. Add entries to give the AI doctor-specific information.
                </p>
              )}

              <div className="space-y-2">
                {knowledge.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${entry.isEnabled ? "bg-background" : "bg-muted/50 opacity-60"}`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{entry.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {entry.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{entry.content}</p>
                    </div>
                    <Switch
                      checked={entry.isEnabled}
                      onCheckedChange={() => handleToggleKnowledge(entry)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingKnowledge(entry)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKnowledge(entry.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* CONVERSATIONS TAB */}
      {activeTab === "conversations" && (
        <>
          {/* Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Conversations", value: conversationStats.total, icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
              { label: "Today", value: conversationStats.today, icon: <Calendar className="h-4 w-4 text-muted-foreground" /> },
              { label: "Total Messages", value: conversationStats.totalMessages, icon: <BarChart3 className="h-4 w-4 text-muted-foreground" /> },
              { label: "With Phone", value: conversationStats.withPhone, icon: <Phone className="h-4 w-4 text-muted-foreground" /> },
            ].map((m) => (
              <Card key={m.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  {m.icon}
                  <div>
                    <p className="text-2xl font-bold">{m.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, or message..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <select
                    className="appearance-none border rounded-md px-3 py-2 pr-8 text-sm bg-background"
                    value={dateFilter}
                    onChange={(e) => handleDateFilterChange(e.target.value as DateFilter)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="custom">Custom</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-muted-foreground" />
                </div>
                <div className="relative">
                  <select
                    className="appearance-none border rounded-md px-3 py-2 pr-8 text-sm bg-background"
                    value={sortOrder}
                    onChange={(e) => handleSortChange(e.target.value as "desc" | "asc")}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                  <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-muted-foreground" />
                </div>
              </div>
              {dateFilter === "custom" && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="w-auto"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="w-auto"
                  />
                  <Button variant="outline" size="sm" onClick={handleCustomDateApply}>
                    Apply
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete Selected ({selectedIds.size})
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
          )}

          {/* Conversation List */}
          <Card>
            <CardContent className="p-0">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations found.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-muted-foreground bg-muted/30">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === conversations.length && conversations.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-muted-foreground/50"
                    />
                    <span className="flex-1">Visitor</span>
                    <span className="w-24 text-center hidden md:block">Messages</span>
                    <span className="w-28 text-center hidden md:block">Date</span>
                    <span className="w-20 text-center">Actions</span>
                  </div>

                  {conversations.map((conv) => (
                    <div key={conv.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(conv.id)}
                        onChange={() => toggleSelect(conv.id)}
                        className="h-4 w-4 rounded border-muted-foreground/50"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-sm truncate">
                            {conv.visitorName || "Anonymous"}
                          </span>
                          {conv.visitorPhone && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {conv.visitorPhone}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="w-24 text-center text-sm text-muted-foreground hidden md:block">
                        {conv.messageCount}
                      </span>
                      <span className="w-28 text-center text-sm text-muted-foreground hidden md:block">
                        {formatDate(conv.lastMessageAt)}
                      </span>
                      <div className="w-20 flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewConversation(conv.id)}
                          title="View conversation"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(conv.id)}
                          title="Delete conversation"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {conversationTotal > conversationPageSize && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIdx}-{endIdx} of {conversationTotal}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={conversationPage === 0}
                      onClick={() => setConversationPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasMore}
                      onClick={() => setConversationPage((p) => p + 1)}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirm Dialog */}
          {deleteConfirmId && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="max-w-sm w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" /> Delete Conversation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete this conversation? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => handleDeleteConversation(deleteConfirmId)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bulk Delete Confirm Dialog */}
          {bulkDeleteConfirm && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="max-w-sm w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" /> Delete {selectedIds.size} Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete {selectedIds.size} conversation(s)? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setBulkDeleteConfirm(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleBulkDelete}>Delete All</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
