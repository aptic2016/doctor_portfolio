"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, ArrowRight, LayoutGrid, BarChart3, Palette } from "lucide-react"

interface Section {
  id: string
  sectionId: string
  label: string | null
  isVisible: boolean
  sortOrder: number
  eyebrow: string | null
  heading: string | null
  sectionNumber: string | null
  showSectionNumber: boolean
  mediaUrl: string | null
  mediaAltText: string | null
  mediaPosition: string
  showMedia: boolean
}

interface Brand {
  heroBadgeText?: string
  heroPrimaryCtaLabel?: string
}

interface Profile {
  displayName?: string
  professionalTitle?: string
}

interface Highlight {
  id: string
  key: string
  label: string
  isVisible: boolean
}

const SECTION_LABELS: Record<string, string> = {
  HERO: "Hero",
  INTRO: "Introduction",
  POSITION: "Position",
  EXPERIENCE_HIGHLIGHTS: "Experience Highlights",
  EDUCATION_HIGHLIGHTS: "Education Highlights",
  QUALIFICATIONS: "Qualifications",
  EXPERTISE: "Expertise",
  ACHIEVEMENTS: "Achievements",
  PUBLICATIONS: "Publications",
  GALLERY: "Gallery",
  ARTICLES: "Articles",
  AI_CTA: "AI CTA",
  CONTACT_CTA: "Contact CTA",
  PROFESSIONAL_SPOTLIGHT: "Professional Spotlight",
}

export function HomeAdmin({
  initialSections,
  initialProfile,
  initialHighlights,
}: {
  initialSections: Section[]
  initialBrand: Brand | null
  initialProfile: Profile | null
  initialHighlights: Highlight[]
}) {
  const [sections] = useState(initialSections)
  const visibleCount = sections.filter((s) => s.isVisible).length
  const visibleHighlights = initialHighlights.filter((h) => h.isVisible).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Home Page</h1>
        <p className="text-sm text-muted-foreground">
          Manage your homepage sections, layout, and content visibility.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sections</p>
                <p className="text-2xl font-bold">{visibleCount}/{sections.length}</p>
                <p className="text-xs text-muted-foreground">visible</p>
              </div>
              <LayoutGrid className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highlights</p>
                <p className="text-2xl font-bold">{visibleHighlights}</p>
                <p className="text-xs text-muted-foreground">metrics shown</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profile</p>
                <p className="text-2xl font-bold truncate max-w-[120px]">{initialProfile?.displayName || "—"}</p>
                <p className="text-xs text-muted-foreground">{initialProfile?.professionalTitle || "Not set"}</p>
              </div>
              <Palette className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sections Overview</CardTitle>
            <CardDescription>Your homepage sections in order</CardDescription>
          </div>
          <Link href="/admin/home-sections" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Manage Sections <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-muted-foreground w-6">
                    {section.sortOrder + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {section.heading || section.label || SECTION_LABELS[section.sectionId] || section.sectionId}
                    </p>
                    <p className="text-xs text-muted-foreground">{section.sectionId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.isVisible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground/30" />
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editorial images — managed in their content admin pages */}
      <Card>
        <CardHeader>
          <CardTitle>Section Visuals</CardTitle>
          <CardDescription>
            Editorial images for the three home sections. Each image is managed in its content area admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Professional Journey", href: "/admin/experience", note: "Chronicle Rail" },
              { label: "Education", href: "/admin/education", note: "Scholar Folio" },
              { label: "Achievements", href: "/admin/achievements", note: "Distinction Prism" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="block">
                <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">Manage <ArrowRight className="h-3 w-3" /></p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/spotlight" className="block">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Professional Spotlight</p>
                  <p className="text-xs text-muted-foreground">Configure top spotlight section content and photos</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/hero-editor" className="block">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Hero Visual Editor</p>
                  <p className="text-xs text-muted-foreground">Configure hero portrait and overlay cards</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/highlights" className="block">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Highlights & Metrics</p>
                  <p className="text-xs text-muted-foreground">Configure metrics displayed on homepage</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
