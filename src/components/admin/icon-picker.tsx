"use client"

import React, { useState } from "react"
import { SOCIAL_ICON_MAP, SOCIAL_ICON_KEYS } from "@/components/public/shared/social-icon"
import { Input } from "@/components/ui/input"

const DEFAULT_HOVER_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  youtube: "#FF0000",
  linkedin: "#0A66C2",
  twitter: "#000000",
  researchgate: "#00CCBB",
  orcid: "#A6CE39",
  github: "#333333",
  email: "#EA4335",
  whatsapp: "#25D366",
  website: "#0891B2",
}

export function getDefaultHoverColor(key: string): string | null {
  return DEFAULT_HOVER_COLORS[key.toLowerCase()] || null
}

export function IconPicker({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (key: string | null) => void
}) {
  const [search, setSearch] = useState("")

  const filtered = SOCIAL_ICON_KEYS.filter((key) =>
    key.toLowerCase().includes(search.toLowerCase()) ||
    SOCIAL_ICON_MAP[key].label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Icon</div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons..."
        className="h-8 text-sm"
      />
      <div className="grid grid-cols-6 gap-1.5">
        {filtered.map((key) => {
          const icon = SOCIAL_ICON_MAP[key]
          const isActive = selected === key
          return (
            <button
              key={key}
              type="button"
              title={icon.label}
              onClick={() => onSelect(isActive ? null : key)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border text-xs transition-all duration-150 ${
                isActive
                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:border-border/60"
              }`}
            >
              <span className="h-4 w-4">{icon.svg}</span>
              <span className="text-[9px] leading-none truncate w-full text-center">{icon.label}</span>
            </button>
          )
        })}
      </div>
      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">No icons found</p>
      )}
    </div>
  )
}

export function IconPreview({
  iconKey,
  hoverColor,
}: {
  iconKey?: string | null
  hoverColor?: string | null
}) {
  if (!iconKey) return null
  const brand = SOCIAL_ICON_MAP[iconKey]
  if (!brand) return null

  const bg = hoverColor || getDefaultHoverColor(iconKey) || brand.color

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-9 h-9 rounded-full border border-border/40 bg-muted/30 flex items-center justify-center text-muted-foreground transition-all duration-200"
        style={{
          backgroundColor: bg,
          borderColor: bg,
          color: "#ffffff",
        }}
      >
        <span className="h-4 w-4">{brand.svg}</span>
      </div>
      <span className="text-sm">{brand.label}</span>
    </div>
  )
}
