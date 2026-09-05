import React from "react"
import { FOLIO_RULED, FRAME_LABEL, FRAME_META, type SectionVisual } from "./section-visual"
import { VisualImage } from "./visual-image"

/**
 * SCHOLAR FOLIO FRAME — Education.
 *
 * Structure: a mounted archival plate. The image is a square window recessed into
 * a mat board with an intentionally deeper bottom margin, an inset rule around the
 * window, registration brackets on opposing corners, and two sheet edges peeking
 * behind — so it reads as a curated academic folio. No cut silhouette and no
 * traced luminous edge; the character here is layering and institutional order.
 *
 * Recomposes on mobile: the plate widens and the window becomes a landscape band,
 * keeping the mat, the rule and the brackets proportionate.
 */
export function EducationVisual({
  visual,
  label,
  count,
}: {
  visual: SectionVisual
  label: string
  count: string | null
}) {
  return (
    <figure data-frame="folio" className="relative m-0 mb-1.5">
      {/* Sheet edges — the folio is a stack, one plate deep. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[3px] border border-border/60 bg-surface/50"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 rounded-[3px] border border-border/35"
      />

      {/* Mat board. */}
      <div className="relative rounded-[3px] border border-border/70 bg-surface p-3 pb-11 shadow-[0_6px_20px_-12px_rgba(10,22,40,0.30)] sm:p-4 sm:pb-12">
        {/* Ruled academic reference — painted under the window, so it shows only in the mat. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[3px] opacity-[0.35]"
          style={{ backgroundImage: FOLIO_RULED }}
        />

        <div className="relative">
          {/* Inset rule around the window. */}
          <span aria-hidden="true" className="pointer-events-none absolute -inset-[6px] border border-primary/20" />
          <div className="relative aspect-[16/10] overflow-hidden bg-muted sm:aspect-[2/1] lg:aspect-square">
            <VisualImage
              src={visual.src}
              alt={visual.alt}
              position={visual.position}
              sizes="(min-width: 1280px) 320px, (min-width: 1024px) 280px, 100vw"
            />
          </div>
        </div>

        {/* Registration brackets on opposing corners. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1.5 top-1.5 h-4 w-4 border-l border-t border-primary/45"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1.5 right-1.5 h-4 w-4 border-b border-r border-primary/45"
        />

        {/* Folio line, set in the deeper bottom mat. */}
        <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 sm:inset-x-4 sm:bottom-4">
          <span className={`${FRAME_LABEL} truncate`}>{label}</span>
          {count && <span className={`${FRAME_META} shrink-0`}>{count}</span>}
        </figcaption>
      </div>
    </figure>
  )
}
