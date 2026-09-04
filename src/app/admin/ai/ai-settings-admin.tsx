"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Save, RefreshCw } from "lucide-react"

interface AiSettings {
  id?: string
  enabled: boolean
  assistantName: string
  assistantAvatar?: string | null
  welcomeMessage: string | null
  systemInstruction: string | null
  temperature: number
  maxTokens: number
  rateLimit: number
}

export function AiSettingsAdmin({ initialSettings }: { initialSettings: AiSettings | null }) {
  const [settings, setSettings] = useState<AiSettings>({
    enabled: initialSettings?.enabled ?? true,
    assistantName: initialSettings?.assistantName ?? "Assistant",
    welcomeMessage: initialSettings?.welcomeMessage ?? "",
    systemInstruction: initialSettings?.systemInstruction ?? "",
    temperature: initialSettings?.temperature ?? 0.7,
    maxTokens: initialSettings?.maxTokens ?? 1000,
    rateLimit: initialSettings?.rateLimit ?? 100,
  })
  const [isSaving, setIsSaving] = useState(false)

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
      const res = await fetch("/api/admin/ai-settings", {
        method: "PATCH",
      })
      if (!res.ok) throw new Error("Failed to rebuild")
      toast.success("Knowledge base rebuilt")
    } catch {
      toast.error("Failed to rebuild knowledge")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">Configure the AI assistant settings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRebuildKnowledge}>
            <RefreshCw className="h-4 w-4 mr-2" /> Rebuild Knowledge
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic assistant configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable AI Assistant</Label>
                <p className="text-xs text-muted-foreground">
                  Show the chat widget to visitors.
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enabled: checked })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assistantName">Assistant Name</Label>
              <Input
                id="assistantName"
                value={settings.assistantName}
                onChange={(e) =>
                  setSettings({ ...settings, assistantName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Textarea
              id="welcomeMessage"
              value={settings.welcomeMessage ?? ""}
              onChange={(e) =>
                setSettings({ ...settings, welcomeMessage: e.target.value })
                }
                rows={2}
                placeholder="Leave empty for default greeting"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
            <CardDescription>Fine-tune the AI behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={settings.temperature}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      temperature: parseFloat(e.target.value) || 0.7,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  value={settings.maxTokens}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxTokens: parseInt(e.target.value) || 1000,
                    })
                  }
                />
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
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    rateLimit: parseInt(e.target.value) || 100,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Instructions</CardTitle>
            <CardDescription>
              Custom instructions to guide the AI behavior. These are added to the system prompt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={settings.systemInstruction ?? ""}
              onChange={(e) =>
                setSettings({ ...settings, systemInstruction: e.target.value })
              }
              rows={6}
              placeholder="e.g. Always respond in a professional tone. Focus on technical expertise. Never discuss personal life."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
