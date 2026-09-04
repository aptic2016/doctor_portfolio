"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Save } from "lucide-react"
import { MediaPicker } from "@/components/admin/media/media-picker"

interface SeoSettings {
  id?: string
  templateTitle: string
  templateDescription: string
  ogImage: string | null
  twitterHandle: string | null
}

export function SeoSettingsAdmin({ initialSettings }: { initialSettings: SeoSettings | null }) {
  const [settings, setSettings] = useState<SeoSettings>({
    templateTitle: initialSettings?.templateTitle || "{displayName} | {professionalTitle}",
    templateDescription: initialSettings?.templateDescription || "Professional portfolio of {displayName}, {professionalTitle}.",
    ogImage: initialSettings?.ogImage || null,
    twitterHandle: initialSettings?.twitterHandle || null,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/seo-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("SEO settings saved")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Settings</h1>
          <p className="text-muted-foreground">Configure search engine optimization defaults.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>
              Use tokens: {"{displayName}"}, {"{professionalTitle}"}, {"{organization}"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateTitle">Title Template</Label>
              <Input
                id="templateTitle"
                value={settings.templateTitle}
                onChange={(e) =>
                  setSettings({ ...settings, templateTitle: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateDescription">Description Template</Label>
              <Input
                id="templateDescription"
                value={settings.templateDescription}
                onChange={(e) =>
                  setSettings({ ...settings, templateDescription: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social</CardTitle>
            <CardDescription>Open Graph and Twitter card settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default OG Image</Label>
              <MediaPicker
                value={settings.ogImage || ""}
                onChange={(url) => setSettings({ ...settings, ogImage: url })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterHandle">Twitter Handle</Label>
              <Input
                id="twitterHandle"
                value={settings.twitterHandle || ""}
                onChange={(e) =>
                  setSettings({ ...settings, twitterHandle: e.target.value || null })
                }
                placeholder="@username"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
