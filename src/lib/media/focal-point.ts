/**
 * FOCAL POINT — the closed set of crop positions any admin-managed image can use.
 *
 * Every one of these values is written verbatim into an inline CSS
 * `object-position`, so the set has to stay closed and every server action that
 * accepts one validates against it. Shared rather than per-feature: the home
 * section visuals, the About portrait and the Contact portrait all offer the
 * same nine choices, and a visitor should not meet three different vocabularies
 * for the same idea.
 */

export const DEFAULT_MEDIA_POSITION = "50% 50%"

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
 * Turns a stored value — possibly null, blank, or written before the set was
 * closed — into a position that is safe to render. Read paths use this so a
 * legacy row can never leave an image un-croppable or a style broken.
 */
export function resolveFocalPosition(value: string | null | undefined): string {
  const trimmed = value?.trim()
  return trimmed && isMediaPosition(trimmed) ? trimmed : DEFAULT_MEDIA_POSITION
}
