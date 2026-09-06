"use client"

import React from "react"
import { MEDIA_POSITIONS } from "@/lib/media/focal-point"

/**
 * FOCAL POINT PICKER — the 3×3 grid used wherever an admin chooses which part
 * of a photo survives a crop.
 *
 * One control, three consumers (home section visuals, About portrait, Contact
 * portrait), so the nine choices and their keyboard/labelling behaviour cannot
 * drift apart. Each cell is a real button carrying the position's plain-English
 * label, and `aria-pressed` tells assistive tech which one is active — the dot
 * inside is decoration only.
 */
export function FocalPointPicker({
  value,
  onChange,
  label,
  hint = "Which part of the photo stays in view when it is cropped.",
}: {
  value: string
  onChange: (value: string) => void
  /** Names the group, e.g. "About portrait image focal point". */
  label: string
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">Focal point</p>
      <div className="grid w-max grid-cols-3 gap-1" role="group" aria-label={label}>
        {MEDIA_POSITIONS.map((p) => {
          const active = value === p.value
          return (
            <button
              key={p.value}
              type="button"
              aria-label={p.label}
              aria-pressed={active}
              onClick={() => onChange(p.value)}
              className={`flex h-6 w-6 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary bg-primary/15" : "border-border hover:bg-muted"}`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${active ? "bg-primary" : "bg-muted-foreground/40"}`}
              />
            </button>
          )
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}
