"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  Globe,
  Save,
  Loader2,
  Building2,
  Zap,
  Layers,
  Mail,
} from "lucide-react"

interface SiteSettingsData {
  id?: string
  siteUrl?: string | null
  siteTitle?: string | null
  siteDescription?: string | null
  defaultLanguage?: string
  timezone?: string
  contactVisibility?: boolean
  analyticsId?: string | null
  aiEnabled?: boolean
  galleryEnabled?: boolean
  galleryLabel?: string
  galleryHomeLimit?: number
  blogEnabled?: boolean
  maintenanceMode?: boolean
  footerText?: string | null
  copyrightText?: string | null
  showLocalInfo?: boolean
  showAgencyBranding?: boolean
  agencyName?: string
  agencyUrl?: string | null
  agencyLabel?: string
  showDemoBadge?: boolean
  motionLevel?: string
  cursorReactiveEffect?: boolean
  cursorMode?: string
  heroOverlayEntrance?: boolean
  connectCue?: boolean
  connectCueStyle?: string
}

interface SiteSettingsClientProps {
  initialSettings: SiteSettingsData | null
}

export function SiteSettingsClient({ initialSettings }: SiteSettingsClientProps) {
  const [settings, setSettings] = useState<SiteSettingsData>(initialSettings || {})
  const [saving, setSaving] = useState(false)

  const update = (key: keyof SiteSettingsData, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error("Save failed")
      toast.success("Site settings saved successfully")
    } catch {
      toast.error("Failed to save site settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">
            Configure general site settings, branding, and motion preferences.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General
          </CardTitle>
          <CardDescription>Basic site configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteTitle">Site Title</Label>
              <Input
                id="siteTitle"
                value={settings.siteTitle || ""}
                onChange={(e) => update("siteTitle", e.target.value)}
                placeholder="Dr. Ayman Rahman"
              />
            </div>
            <div>
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                value={settings.siteUrl || ""}
                onChange={(e) => update("siteUrl", e.target.value)}
                placeholder="https://aymanrahman.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription || ""}
              onChange={(e) => update("siteDescription", e.target.value)}
              placeholder="Professional medical portfolio"
              rows={2}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <Input
                id="defaultLanguage"
                value={settings.defaultLanguage || "en"}
                onChange={(e) => update("defaultLanguage", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={settings.timezone || "UTC"}
                onChange={(e) => update("timezone", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="analyticsId">Analytics ID</Label>
            <Input
              id="analyticsId"
              value={settings.analyticsId || ""}
              onChange={(e) => update("analyticsId", e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Features
          </CardTitle>
          <CardDescription>Enable or disable site features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            AI Assistant is managed in <a href="/admin/ai" className="text-primary hover:underline">AI Assistant</a>.
          </p>
          <div className="flex items-center justify-between">
            <div>
              <Label>Gallery</Label>
              <p className="text-sm text-muted-foreground">Enable photo gallery section</p>
            </div>
            <Switch
              checked={settings.galleryEnabled ?? true}
              onCheckedChange={(v) => update("galleryEnabled", v)}
            />
          </div>
          {settings.galleryEnabled && (
            <div className="ml-4 grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="galleryLabel">Gallery Label</Label>
                <Input
                  id="galleryLabel"
                  value={settings.galleryLabel || "Gallery"}
                  onChange={(e) => update("galleryLabel", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="galleryHomeLimit">Photos on Home Page</Label>
                <Input
                  id="galleryHomeLimit"
                  type="number"
                  min={1}
                  max={12}
                  value={settings.galleryHomeLimit ?? 6}
                  onChange={(e) =>
                    update(
                      "galleryHomeLimit",
                      e.target.value === "" ? undefined : Number(e.target.value),
                    )
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">
                  How many photos the home teaser shows (1–12). The full collection
                  always stays on the Gallery page.
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <Label>Blog / Articles</Label>
              <p className="text-sm text-muted-foreground">Enable articles section</p>
            </div>
            <Switch
              checked={settings.blogEnabled ?? true}
              onCheckedChange={(v) => update("blogEnabled", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Contact Form</Label>
              <p className="text-sm text-muted-foreground">Show contact section</p>
            </div>
            <Switch
              checked={settings.contactVisibility ?? true}
              onCheckedChange={(v) => update("contactVisibility", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Local Info</Label>
              <p className="text-sm text-muted-foreground">Display local contact details</p>
            </div>
            <Switch
              checked={settings.showLocalInfo ?? false}
              onCheckedChange={(v) => update("showLocalInfo", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Show maintenance page to visitors</p>
            </div>
            <Switch
              checked={settings.maintenanceMode ?? false}
              onCheckedChange={(v) => update("maintenanceMode", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer & Copyright */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Footer
          </CardTitle>
          <CardDescription>Footer text and copyright</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="footerText">Footer Text</Label>
            <Textarea
              id="footerText"
              value={settings.footerText || ""}
              onChange={(e) => update("footerText", e.target.value)}
              placeholder="Dedicated to advancing patient care..."
              rows={2}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Copyright text and brand text are managed in <a href="/admin/footer" className="text-primary hover:underline">Footer → Settings</a>.
          </p>
        </CardContent>
      </Card>

      {/* Agency Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Agency Branding
          </CardTitle>
          <CardDescription>
            Display developer/agency credit in the footer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Agency Branding</Label>
              <p className="text-sm text-muted-foreground">
                Display &quot;Designed &amp; Developed by&quot; credit
              </p>
            </div>
            <Switch
              checked={settings.showAgencyBranding ?? false}
              onCheckedChange={(v) => update("showAgencyBranding", v)}
            />
          </div>
          {settings.showAgencyBranding && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agencyLabel">Label</Label>
                  <Input
                    id="agencyLabel"
                    value={settings.agencyLabel || "Designed & Developed by"}
                    onChange={(e) => update("agencyLabel", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="agencyName">Agency Name</Label>
                  <Input
                    id="agencyName"
                    value={settings.agencyName || "AS"}
                    onChange={(e) => update("agencyName", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="agencyUrl">Agency URL</Label>
                <Input
                  id="agencyUrl"
                  value={settings.agencyUrl || ""}
                  onChange={(e) => update("agencyUrl", e.target.value)}
                  placeholder="https://astechnologies.ltd"
                />
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Demo Badge</Label>
              <p className="text-sm text-muted-foreground">
                Admin-only indicator that demo content is loaded
              </p>
            </div>
            <Switch
              checked={settings.showDemoBadge ?? false}
              onCheckedChange={(v) => update("showDemoBadge", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Motion & Animation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Motion & Animation
          </CardTitle>
          <CardDescription>Control animation intensity across the portfolio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Motion Level</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Controls how much animation visitors see across the site
            </p>
            <div className="flex gap-2">
              {["off", "subtle", "enhanced"].map((level) => (
                <Button
                  key={level}
                  variant={settings.motionLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("motionLevel", level)}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Medical Cursor Effect</Label>
              <p className="text-sm text-muted-foreground">
                Show a custom cursor that follows the pointer on desktop
              </p>
            </div>
            <Switch
              checked={settings.cursorReactiveEffect ?? true}
              onCheckedChange={(v) => update("cursorReactiveEffect", v)}
            />
          </div>
          {settings.cursorReactiveEffect && (
            <div className="ml-4">
              <Label>Cursor Mode</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Choose which custom cursor style to display
              </p>
              <div className="flex gap-3">
                {[
                  { value: "normal", label: "Normal", desc: "Use the browser's default cursor", icon: (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 1L3 12L6.5 8.5L10 13L12 11.5L8.5 7L13 6L3 1Z" fill="currentColor" /></svg>
                  )},
                  { value: "stethoscope", label: "Stethoscope", desc: "Medical stethoscope cursor", icon: (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="2.5" r="1" fill="currentColor"/><circle cx="10" cy="2.5" r="1" fill="currentColor"/><line x1="6" y1="3.5" x2="6" y2="6" stroke="currentColor" strokeWidth="0.8"/><line x1="10" y1="3.5" x2="10" y2="6" stroke="currentColor" strokeWidth="0.8"/><path d="M6 6C6 8 7 8.5 8 9" stroke="currentColor" strokeWidth="0.8" fill="none"/><path d="M10 6C10 8 9 8.5 8 9" stroke="currentColor" strokeWidth="0.8" fill="none"/><circle cx="8" cy="11" r="2" stroke="currentColor" strokeWidth="0.8" fill="none"/><circle cx="8" cy="11" r="0.8" fill="currentColor"/></svg>
                  )},
                  { value: "capsule", label: "Capsule", desc: "Medical capsule/tablet cursor", icon: (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="5.5" width="12" height="5" rx="2.5" stroke="currentColor" strokeWidth="0.8" fill="none"/><rect x="2" y="5.5" width="6" height="5" rx="2.5" fill="currentColor" opacity="0.2"/><line x1="8" y1="5.5" x2="8" y2="10.5" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/></svg>
                  )},
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => update("cursorMode", mode.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                      settings.cursorMode === mode.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {mode.icon}
                      <span className="text-sm font-medium">{mode.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <Label>Hero Overlay Entrance</Label>
              <p className="text-sm text-muted-foreground">
                Animates hero information cards out from the doctor portrait
              </p>
            </div>
            <Switch
              checked={settings.heroOverlayEntrance ?? true}
              onCheckedChange={(v) => update("heroOverlayEntrance", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Connect Attention Cue</Label>
              <p className="text-sm text-muted-foreground">
                Briefly draws attention to the Contact button
              </p>
            </div>
            <Switch
              checked={settings.connectCue ?? true}
              onCheckedChange={(v) => update("connectCue", v)}
            />
          </div>
          {settings.connectCue && (
            <div className="ml-4">
              <Label>Cue Style</Label>
              <div className="flex gap-2 mt-1">
                {["hand-tap", "mail-pulse", "none"].map((style) => (
                  <Button
                    key={style}
                    variant={settings.connectCueStyle === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => update("connectCueStyle", style)}
                    className="capitalize"
                  >
                    {style.replace("-", " ")}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
