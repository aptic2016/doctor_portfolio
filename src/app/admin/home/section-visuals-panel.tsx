"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Check, ImageIcon, Loader2, Trash2 } from "lucide-react"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { updateHomeSectionVisualAdmin } from "@/app/admin/settings/actions"
import {
  CHRONICLE_CLIP,
  DEFAULT_MEDIA_POSITION,
  FOLIO_RULED,
  FRAME_RATIO,
  MEDIA_POSITIONS,
  PRISM_CLIP,
  isMediaPosition,
} from "@/components/public/home/visuals/section-visual"

/**
 * SECTION VISUALS — the one place the three home editorial images are managed.
 *
 * Lives inside Admin → Home Page rather than a new route, because these images are
 * per-section presentation settings and `HomeSection` already owns that. The frame
 * previews import the same geometry constants the public frames use, so what Admin
 * sees is the shape that will actually render.
 */

/** The `HomeSection` columns this panel reads and writes. */
export interface SectionVisualRow {
  id: string
  sectionId: string
  heading: string | null
  mediaUrl: string | null
  mediaAltText: string | null
  mediaPosition: string
  showMedia: boolean
}

type FrameKind = "chronicle" | "folio" | "prism"

interface FrameMeta {
  sectionId: string
  title: string
  frame: string
  kind: FrameKind
  note: string
}

const VISUAL_SECTIONS: FrameMeta[] = [
  {
    sectionId: "EXPERIENCE_HIGHLIGHTS",
    title: "Professional Journey",
    frame: "Chronicle Rail",
    kind: "chronicle",
    note: "Portrait plate seated on the timeline — a tall crop works best.",
  },
  {
    sectionId: "EDUCATION_HIGHLIGHTS",
    title: "Education",
    frame: "Scholar Folio",
    kind: "folio",
    note: "Square window in a mat board — a centred subject works best.",
  },
  {
    sectionId: "ACHIEVEMENTS",
    title: "Achievements",
    frame: "Distinction Prism",
    kind: "prism",
    note: "Faceted plaque — a landscape crop works best.",
  },
]

/** Scaled-down build of the real frame, so the preview cannot drift from the page. */
function FramePreview({ kind, url, position }: { kind: FrameKind; url: string; position: string }) {
  const media = url ? (
    <Image src={url} alt="" fill sizes="160px" className="object-cover" style={{ objectPosition: position }} />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-muted">
      <ImageIcon className="h-5 w-5 text-muted-foreground/50" aria-hidden="true" />
    </div>
  )

  if (kind === "chronicle") {
    return (
      <div className="relative w-[132px] [--cut:14px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-primary/[0.12] dark:bg-primary/20"
          style={{ clipPath: CHRONICLE_CLIP }}
        />
        <div
          className="relative overflow-hidden bg-muted"
          style={{ clipPath: CHRONICLE_CLIP, aspectRatio: FRAME_RATIO.chronicle }}
        >
          {media}
        </div>
      </div>
    )
  }

  if (kind === "folio") {
    return (
      <div className="relative w-[132px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-[3px] border border-border/60 bg-surface/50"
        />
        <div className="relative rounded-[3px] border border-border/70 bg-surface p-2 pb-6">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[3px] opacity-[0.35]"
            style={{ backgroundImage: FOLIO_RULED }}
          />
          <div className="relative">
            <span aria-hidden="true" className="absolute -inset-[3px] border border-primary/20" />
            <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: FRAME_RATIO.folio }}>
              {media}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[132px] [--notch:12px]">
      <div
        className="bg-gradient-to-b from-primary/40 via-border/70 to-primary/25 p-px"
        style={{ clipPath: PRISM_CLIP }}
      >
        <div className="bg-surface" style={{ clipPath: PRISM_CLIP }}>
          <div
            aria-hidden="true"
            className="h-2.5 w-full border-b border-border/50 bg-gradient-to-r from-primary/20 to-transparent"
          />
          <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: FRAME_RATIO.prism }}>
            {media}
          </div>
          <div aria-hidden="true" className="h-4 border-t border-border/50" />
        </div>
      </div>
    </div>
  )
}

function SectionVisualEditor({ row, meta }: { row: SectionVisualRow; meta: FrameMeta }) {
  const router = useRouter()
  const initial = {
    mediaUrl: row.mediaUrl ?? "",
    mediaAltText: row.mediaAltText ?? "",
    mediaPosition: isMediaPosition(row.mediaPosition) ? row.mediaPosition : DEFAULT_MEDIA_POSITION,
    showMedia: row.showMedia,
  }
  const [form, setForm] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)

  const dirty =
    form.mediaUrl !== saved.mediaUrl ||
    form.mediaAltText !== saved.mediaAltText ||
    form.mediaPosition !== saved.mediaPosition ||
    form.showMedia !== saved.showMedia

  async function handleSave() {
    setSaving(true)
    try {
      await updateHomeSectionVisualAdmin(row.id, {
        mediaUrl: form.mediaUrl || null,
        mediaAltText: form.mediaAltText || null,
        mediaPosition: form.mediaPosition,
        showMedia: form.showMedia,
      })
      setSaved(form)
      setHasSaved(true)
      toast.success(`${meta.title} visual saved`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save section visual")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-visual-section={row.sectionId} className="rounded-xl border bg-background p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{meta.title}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">{meta.frame}</span> &middot; {meta.note}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span id={`show-media-${row.id}`} className="text-xs font-medium">Show image</span>
          <Switch
            aria-labelledby={`show-media-${row.id}`}
            checked={form.showMedia}
            onCheckedChange={(checked) => setForm({ ...form, showMedia: checked })}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div className="space-y-2">
          <FramePreview kind={meta.kind} url={form.mediaUrl} position={form.mediaPosition} />
          <p className="text-[11px] text-muted-foreground">Frame preview</p>
        </div>

        <div className="space-y-4">
          <MediaPicker
            value={form.mediaUrl}
            label="Section image"
            onChange={(url, asset) =>
              setForm((f) => ({
                ...f,
                mediaUrl: url,
                mediaAltText: f.mediaAltText || (url ? asset?.altText ?? "" : ""),
              }))
            }
          />

          <div className="space-y-1.5">
            <Label htmlFor={`alt-${row.id}`}>Alt text</Label>
            <Input
              id={`alt-${row.id}`}
              value={form.mediaAltText}
              maxLength={300}
              placeholder={row.heading || meta.title}
              onChange={(e) => setForm({ ...form, mediaAltText: e.target.value })}
            />
            <p className="text-[11px] text-muted-foreground">
              Read out by screen readers. Left blank, it falls back to the section heading.
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Focal point</p>
            <div className="grid w-max grid-cols-3 gap-1" role="group" aria-label={`${meta.title} image focal point`}>
              {MEDIA_POSITIONS.map((p) => {
                const active = form.mediaPosition === p.value
                return (
                  <button
                    key={p.value}
                    type="button"
                    aria-label={p.label}
                    aria-pressed={active}
                    onClick={() => setForm({ ...form, mediaPosition: p.value })}
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
            <p className="text-[11px] text-muted-foreground">Which part of the photo stays in view when it is cropped.</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-3">
        <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
          ) : (
            "Save"
          )}
        </Button>
        {form.mediaUrl && (
          <Button
            size="sm"
            variant="outline"
            disabled={saving}
            onClick={() => setForm({ ...form, mediaUrl: "", mediaAltText: "" })}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />Remove image
          </Button>
        )}
        <span className="text-xs" aria-live="polite">
          {dirty ? (
            <span className="font-medium text-amber-600 dark:text-amber-400">Unsaved changes</span>
          ) : hasSaved ? (
            <span className="inline-flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" aria-hidden="true" />Saved
            </span>
          ) : (
            <span className="text-muted-foreground">No changes</span>
          )}
        </span>
      </div>
    </div>
  )
}

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

