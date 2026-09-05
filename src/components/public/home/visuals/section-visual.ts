/**
 * HOME SECTION VISUAL — shared data contract for the three editorial frames.
 *
 * Professional Journey, Education and Achievements each carry one admin-managed
 * editorial image. All three read the same four `HomeSection` columns, so the
 * visibility/fallback rules and the frame geometry constants live here once
 * rather than being restated (and drifting) inside each frame.
 */

/** The `HomeSection` fields the public home page hands to a section component. */
export interface HomeSectionConfig {
  eyebrow?: string | null
  heading?: string | null
  supportingText?: string | null
  sectionNumber?: string | null
  showSectionNumber?: boolean
  mediaUrl?: string | null
  mediaAltText?: string | null
  mediaPosition?: string | null
  showMedia?: boolean
}

/** A visual confirmed renderable: it has a source and the admin has not hidden it. */
export interface SectionVisual {
  src: string
  alt: string
  position: string
}

export const DEFAULT_MEDIA_POSITION = "50% 50%"

/**
 * Focal presets. Stored verbatim as a CSS `object-position` value, so the set is
 * closed — the server action rejects anything outside it.
 */
export const MEDIA_POSITIONS: { value: string; label: string }[] = [
  { value: "0% 0%", label: "Top left" },
  { value: "50% 0%", label: "Top" },
  { value: "100% 0%", label: "Top right" },
  { value: "0% 50%", label: "Left" },
  { value: DEFAULT_MEDIA_POSITION, label: "Center" },
  { value: "100% 50%", label: "Right" },
  { value: "0% 100%", label: "Bottom left" },
  { value: "50% 100%", label: "Bottom" },
  { value: "100% 100%", label: "Bottom right" },
]

export function isMediaPosition(value: string): boolean {
  return MEDIA_POSITIONS.some((p) => p.value === value)
}

/**
 * Resolves the visual for a section, or `null` when the section must fall back
 * to its content-only layout — no image chosen, or the admin turned it off.
 * This is the single gate every frame goes through; there is no other path that
 * can render an empty frame.
 */
export function resolveSectionVisual(
  section: HomeSectionConfig | undefined,
  fallbackAlt: string,
): SectionVisual | null {
  if (!section || section.showMedia === false) return null
  const src = section.mediaUrl?.trim()
  if (!src) return null
  const position = section.mediaPosition?.trim()
  return {
    src,
    alt: section.mediaAltText?.trim() || fallbackAlt,
    position: position && isMediaPosition(position) ? position : DEFAULT_MEDIA_POSITION,
  }
}

/**
 * Frame silhouettes. Each is driven by one CSS custom property so the cut scales
 * per breakpoint from a Tailwind arbitrary property (`[--cut:22px] lg:[--cut:30px]`)
 * instead of duplicating the polygon. Admin frame previews import the same
 * constants, which is what keeps the thumbnails honest.
 */

/** Chronicle Rail — a single raked cut on the top-left corner, where the rail arrives. */
export const CHRONICLE_CLIP =
  "polygon(var(--cut) 0%, 100% 0%, 100% 100%, 0% 100%, 0% var(--cut))"

/** Distinction Prism — opposite corners faceted, giving a plaque silhouette. */
export const PRISM_CLIP =
  "polygon(0% 0%, calc(100% - var(--notch)) 0%, 100% var(--notch), 100% 100%, var(--notch) 100%, 0% calc(100% - var(--notch)))"

/** Scholar Folio — ruled academic reference, visible only in the mat margin. */
export const FOLIO_RULED =
  "repeating-linear-gradient(to bottom, transparent 0 11px, var(--border) 11px 12px)"

/** Image window ratios. Deliberately different per frame, not just restyled. */
export const FRAME_RATIO = {
  chronicle: "4 / 5",
  folio: "1 / 1",
  prism: "5 / 4",
} as const

/**
 * Frame caption typography. The three frames are deliberately different objects,
 * but they speak with one voice — so the two text roles inside them are declared
 * once here instead of being retyped (and drifting) in each frame.
 *
 * Both use full-strength tokens rather than the site's decorative `.section-number`
 * opacity: these markers carry real information (era, counts), so they are held to
 * body-text contrast in both themes.
 */
export const FRAME_LABEL = "text-[10px] font-bold uppercase tracking-[0.18em] text-primary"
export const FRAME_META = "font-mono text-[11px] font-bold tracking-[0.15em] text-muted-foreground"
