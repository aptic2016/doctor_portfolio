import React from "react"
import { FRAME_LABEL, FRAME_META, PRISM_CLIP, type SectionVisual } from "./section-visual"
import { VisualImage } from "./visual-image"

/**
 * DISTINCTION PRISM FRAME — Achievements.
 *
 * Structure: a plaque. Opposite corners are faceted away, and the whole silhouette
 * is traced by a single hairline produced by a two-shell construction — an outer
 * clipped shell one pixel larger than the inner one, so the highlight follows the
 * facets instead of stopping at them. A bevel strip caps the top and a seated
 * recognition band closes the bottom, both inside the clip, so they are part of the
 * silhouette rather than plates laid on it.
 *
 * Recomposes on mobile: the plaque widens, the facets shrink with it, and the band
 * stays legible at full width.
 */
export function AchievementVisual({
  visual,
  label,
  count,
}: {
  visual: SectionVisual
  label: string
  count: string | null
}) {
  return (
    <figure data-frame="prism" className="relative m-0 [--notch:20px] lg:[--notch:26px]">
      {/* Outer shell — one hairline wide, tracing every facet. */}
      <div
        className="relative bg-gradient-to-b from-primary/40 via-border/70 to-primary/25 p-px shadow-[0_12px_34px_-16px_rgba(10,22,40,0.40)]"
        style={{ clipPath: PRISM_CLIP }}
      >
        <div className="relative bg-surface" style={{ clipPath: PRISM_CLIP }}>
          {/* Bevel strip — the plaque's polished top edge. */}
          <div
            aria-hidden="true"
            className="h-5 w-full border-b border-border/50 bg-gradient-to-r from-primary/20 via-primary/[0.06] to-transparent lg:h-6"
          />

          <div className="relative aspect-[16/10] overflow-hidden bg-muted sm:aspect-[2/1] lg:aspect-[5/4]">
            <VisualImage
              src={visual.src}
              alt={visual.alt}
              position={visual.position}
              sizes="(min-width: 1280px) 380px, (min-width: 1024px) 300px, 100vw"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]"
            />
          </div>

          {/* Recognition band, seated inside the faceted bottom edge — the extra
              left inset keeps the label clear of the bottom-left facet. */}
          <figcaption className="flex h-9 items-center justify-between gap-3 pl-7 pr-4 lg:h-10 lg:pl-9 border-t border-border/50">
            <span className={`${FRAME_LABEL} truncate`}>{label}</span>
            {count && <span className={`${FRAME_META} shrink-0`}>{count}</span>}
          </figcaption>
        </div>
      </div>
    </figure>
  )
}
