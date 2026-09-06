"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SectionVisualEditor, VISUAL_SECTIONS, type SectionVisualRow } from "@/components/admin/shared/section-visual-editor"

export type { SectionVisualRow }

export function SectionVisualsPanel({ sections }: { sections: SectionVisualRow[] }) {
  const editors = VISUAL_SECTIONS.flatMap((meta) => {
    const row = sections.find((s) => s.sectionId === meta.sectionId)
    return row ? [{ meta, row }] : []
  })
  if (editors.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Visuals</CardTitle>
        <CardDescription>
          One editorial image for each of these three home sections. The frame is fixed by design — you choose the
          image, its focal point, and whether it shows. Remove or hide an image and the section falls back to its
          content-only layout.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {editors.map(({ meta, row }) => (
          <SectionVisualEditor key={row.id} row={row} meta={meta} />
        ))}
      </CardContent>
    </Card>
  )
}
