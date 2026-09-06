"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Save } from "lucide-react"
import { MediaPicker } from "@/components/admin/media/media-picker"

interface BrandSettings {
  id?: string
  siteName: string
  logo: string | null
  favicon: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  backgroundColor: string
  surfaceColor: string
  borderColor: string
  borderRadiusButton: string
  borderRadiusCard: string
  containerWidth: string
  baseFont: string
  headingFont: string
  headingWeight: string
  sectionSpacing: string
  baseFontSize?: string
  navFontSize?: string
  headingScale?: string
  typographyPreset?: string
  heroBadgeText?: string
  heroShowBadge?: boolean
  heroPrimaryCtaLabel?: string
  heroPrimaryCtaDest?: string
  heroSecondaryCtaLabel?: string
  heroSecondaryCtaDest?: string
  heroShowCvCta?: boolean
  heroCvCtaLabel?: string
  heroShowWorkplace?: boolean
  heroShowLocation?: boolean
  heroShowQualifications?: boolean
  heroShowInterests?: boolean
  footerNavTitle?: string | null
  footerContactTitle?: string | null
  footerDescription?: string | null
}

interface ThemeSettings {
  id?: string
  currentTheme: string
  presetName: string | null
  isManualOverride: boolean
}

interface SiteSettingsPartial {
  id?: string
  showLocalInfo?: boolean
  timezone?: string
}

const THEME_PRESETS = {
  "Professional Blue": {
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    accentColor: "#3b82f6",
    textColor: "#0f172a",
    backgroundColor: "#ffffff",
    surfaceColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  "Executive Dark": {
    primaryColor: "#f8fafc",
    secondaryColor: "#1e293b",
    accentColor: "#60a5fa",
    textColor: "#f8fafc",
    backgroundColor: "#0f172a",
    surfaceColor: "#1e293b",
    borderColor: "#334155",
  },
  "Minimal Neutral": {
    primaryColor: "#18181b",
    secondaryColor: "#f4f4f5",
    accentColor: "#71717a",
    textColor: "#18181b",
    backgroundColor: "#ffffff",
    surfaceColor: "#fafafa",
    borderColor: "#e4e4e7",
  },
  "Elegant Slate": {
    primaryColor: "#475569",
    secondaryColor: "#f1f5f9",
    accentColor: "#64748b",
    textColor: "#1e293b",
    backgroundColor: "#f8fafc",
    surfaceColor: "#ffffff",
    borderColor: "#cbd5e1",
  },
  "Clean Professional": {
    primaryColor: "#0f766e",
    secondaryColor: "#f0fdfa",
    accentColor: "#14b8a6",
    textColor: "#0f172a",
    backgroundColor: "#ffffff",
    surfaceColor: "#f8fafc",
    borderColor: "#ccfbf1",
  },
}

export function AppearanceAdmin({
  initialBrandSettings,
  initialThemeSettings,
  initialSiteSettings,
}: {
  initialBrandSettings: BrandSettings | null
  initialThemeSettings: ThemeSettings | null
  initialSiteSettings?: SiteSettingsPartial | null
}) {
  const [brand, setBrand] = useState<BrandSettings>({
    siteName: initialBrandSettings?.siteName || "Portfolio",
    logo: initialBrandSettings?.logo || null,
    favicon: initialBrandSettings?.favicon || null,
    primaryColor: initialBrandSettings?.primaryColor || "#000000",
    secondaryColor: initialBrandSettings?.secondaryColor || "#f1f5f9",
    accentColor: initialBrandSettings?.accentColor || "#000000",
    textColor: initialBrandSettings?.textColor || "#0f172a",
    backgroundColor: initialBrandSettings?.backgroundColor || "#ffffff",
    surfaceColor: initialBrandSettings?.surfaceColor || "#ffffff",
    borderColor: initialBrandSettings?.borderColor || "#e2e8f0",
    borderRadiusButton: initialBrandSettings?.borderRadiusButton || "0.5rem",
    borderRadiusCard: initialBrandSettings?.borderRadiusCard || "0.75rem",
    containerWidth: initialBrandSettings?.containerWidth || "1280px",
    baseFont: initialBrandSettings?.baseFont || "Inter",
    headingFont: initialBrandSettings?.headingFont || "Inter",
    headingWeight: initialBrandSettings?.headingWeight || "700",
    sectionSpacing: initialBrandSettings?.sectionSpacing || "4rem",
    baseFontSize: initialBrandSettings?.baseFontSize || "16px",
    navFontSize: initialBrandSettings?.navFontSize || "14px",
    headingScale: initialBrandSettings?.headingScale || "1.25",
    typographyPreset: initialBrandSettings?.typographyPreset || "balanced",
    heroBadgeText: initialBrandSettings?.heroBadgeText || "Currently Practicing",
    heroShowBadge: initialBrandSettings?.heroShowBadge ?? true,
    heroPrimaryCtaLabel: initialBrandSettings?.heroPrimaryCtaLabel || "Profile",
    heroPrimaryCtaDest: initialBrandSettings?.heroPrimaryCtaDest || "/about",
    heroSecondaryCtaLabel: initialBrandSettings?.heroSecondaryCtaLabel || "Connect",
    heroSecondaryCtaDest: initialBrandSettings?.heroSecondaryCtaDest || "/contact",
    heroShowCvCta: initialBrandSettings?.heroShowCvCta ?? false,
    heroCvCtaLabel: initialBrandSettings?.heroCvCtaLabel || "View CV",
    heroShowWorkplace: initialBrandSettings?.heroShowWorkplace ?? true,
    heroShowLocation: initialBrandSettings?.heroShowLocation ?? true,
    heroShowQualifications: initialBrandSettings?.heroShowQualifications ?? true,
    heroShowInterests: initialBrandSettings?.heroShowInterests ?? false,
    footerNavTitle: initialBrandSettings?.footerNavTitle || "Navigation",
    footerContactTitle: initialBrandSettings?.footerContactTitle || "Connect",
    footerDescription: initialBrandSettings?.footerDescription || "",
  })

  const [theme, setTheme] = useState<ThemeSettings>({
    currentTheme: initialThemeSettings?.currentTheme || "SYSTEM",
    presetName: initialThemeSettings?.presetName || null,
    isManualOverride: initialThemeSettings?.isManualOverride || false,
  })

  const [isSaving, setIsSaving] = useState(false)

  const applyPreset = (name: string) => {
    const preset = THEME_PRESETS[name as keyof typeof THEME_PRESETS]
    if (preset) {
      setBrand({ ...brand, ...preset })
      setTheme({ ...theme, presetName: name, isManualOverride: false })
      toast.success(`Applied "${name}" preset`)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const [brandRes, themeRes] = await Promise.all([
        fetch("/api/admin/brand-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(brand),
        }),
        fetch("/api/admin/theme-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(theme),
        }),
      ])

      if (!brandRes.ok || !themeRes.ok) throw new Error("Failed to save")

      toast.success("Appearance settings saved")
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
          <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
          <p className="text-muted-foreground">Customize the look and feel of your portfolio.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Presets</CardTitle>
          <CardDescription>Quick-start with a polished preset, then customize.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.keys(THEME_PRESETS).map((name) => (
              <button
                key={name}
                onClick={() => applyPreset(name)}
                className={`p-3 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                  theme.presetName === name
                    ? "border-primary shadow-md"
                    : "border-transparent hover:border-border"
                }`}
              >
                <div className="flex gap-1 mb-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: THEME_PRESETS[name as keyof typeof THEME_PRESETS].primaryColor }}
                  />
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: THEME_PRESETS[name as keyof typeof THEME_PRESETS].accentColor }}
                  />
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: THEME_PRESETS[name as keyof typeof THEME_PRESETS].backgroundColor }}
                  />
                </div>
                <p className="text-xs font-medium">{name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Brand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={brand.siteName}
                onChange={(e) => setBrand({ ...brand, siteName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <MediaPicker
                value={brand.logo || ""}
                onChange={(url) => setBrand({ ...brand, logo: url })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {["LIGHT", "DARK", "SYSTEM"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTheme({ ...theme, currentTheme: mode })}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    theme.currentTheme === mode
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="text-sm font-medium capitalize">{mode.toLowerCase()}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {([
              { key: "primaryColor", label: "Primary" },
              { key: "secondaryColor", label: "Secondary" },
              { key: "accentColor", label: "Accent" },
              { key: "textColor", label: "Text" },
              { key: "backgroundColor", label: "Background" },
              { key: "surfaceColor", label: "Surface" },
              { key: "borderColor", label: "Border" },
            ] as { key: keyof BrandSettings; label: string }[]).map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <Input
                  type="color"
                  className="w-10 h-10 p-1 cursor-pointer"
                  value={brand[key] as string}
                  onChange={(e) =>
                    setBrand({ ...brand, [key]: e.target.value })
                  }
                />
                <div className="flex-grow">
                  <Label className="text-sm">{label}</Label>
                </div>
                <Input
                  className="w-28 font-mono text-xs"
                  value={brand[key] as string}
                  onChange={(e) =>
                    setBrand({ ...brand, [key]: e.target.value })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Container Width</Label>
              <Input
                value={brand.containerWidth}
                onChange={(e) => setBrand({ ...brand, containerWidth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Section Spacing</Label>
              <Input
                value={brand.sectionSpacing}
                onChange={(e) => setBrand({ ...brand, sectionSpacing: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Button Radius</Label>
                <Input
                  value={brand.borderRadiusButton}
                  onChange={(e) =>
                    setBrand({ ...brand, borderRadiusButton: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Card Radius</Label>
                <Input
                  value={brand.borderRadiusCard}
                  onChange={(e) =>
                    setBrand({ ...brand, borderRadiusCard: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Configure fonts, sizes, and heading scale. Changes update the public site instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Typography Preset</Label>
            <div className="flex gap-2">
              {(["compact", "balanced", "large"] as const).map((p) => (
                <button key={p} onClick={() => {
                  const presets = { compact: { baseFontSize: "14px", headingScale: "1.2" }, balanced: { baseFontSize: "16px", headingScale: "1.25" }, large: { baseFontSize: "18px", headingScale: "1.33" } }
                  setBrand({ ...brand, typographyPreset: p, ...presets[p] })
                }} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${brand.typographyPreset === p ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1"><Label className="text-xs">Body Font</Label><Input value={brand.baseFont} onChange={(e) => setBrand({ ...brand, baseFont: e.target.value })} className="h-8 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs">Heading Font</Label><Input value={brand.headingFont} onChange={(e) => setBrand({ ...brand, headingFont: e.target.value })} className="h-8 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs">Base Font Size</Label><Input value={brand.baseFontSize} onChange={(e) => setBrand({ ...brand, baseFontSize: e.target.value, typographyPreset: "custom" })} className="h-8 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs">Nav Font Size</Label><Input value={brand.navFontSize} onChange={(e) => setBrand({ ...brand, navFontSize: e.target.value })} className="h-8 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs">Heading Scale</Label><Input value={brand.headingScale} onChange={(e) => setBrand({ ...brand, headingScale: e.target.value, typographyPreset: "custom" })} className="h-8 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs">Heading Weight</Label><Input value={brand.headingWeight} onChange={(e) => setBrand({ ...brand, headingWeight: e.target.value })} className="h-8 text-xs" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Hero */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Configure the main hero area content and visibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Primary CTA Label</Label><Input value={brand.heroPrimaryCtaLabel || ""} onChange={(e) => setBrand({ ...brand, heroPrimaryCtaLabel: e.target.value })} className="h-8 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs">Primary CTA Link</Label><Input value={brand.heroPrimaryCtaDest || ""} onChange={(e) => setBrand({ ...brand, heroPrimaryCtaDest: e.target.value })} className="h-8 text-xs font-mono" /></div>
            <div className="space-y-1"><Label className="text-xs">Secondary CTA Label</Label><Input value={brand.heroSecondaryCtaLabel || ""} onChange={(e) => setBrand({ ...brand, heroSecondaryCtaLabel: e.target.value })} className="h-8 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs">Secondary CTA Link</Label><Input value={brand.heroSecondaryCtaDest || ""} onChange={(e) => setBrand({ ...brand, heroSecondaryCtaDest: e.target.value })} className="h-8 text-xs font-mono" /></div>
            <div className="space-y-1"><Label className="text-xs">CV CTA Label</Label><Input value={brand.heroCvCtaLabel || ""} onChange={(e) => setBrand({ ...brand, heroCvCtaLabel: e.target.value })} className="h-8 text-xs" /></div>
          </div>
          <div className="flex flex-wrap gap-4">
            {([["heroShowWorkplace", "Show Workplace"], ["heroShowLocation", "Show Location"], ["heroShowQualifications", "Show Qualifications"], ["heroShowInterests", "Show Interests"], ["heroShowCvCta", "Show CV CTA"]] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!brand[key]} onChange={(e) => setBrand({ ...brand, [key]: e.target.checked })} className="rounded" />{label}</label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
