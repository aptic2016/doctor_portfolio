import React from "react"
import { CHRONICLE_CLIP, FRAME_LABEL, FRAME_META, type SectionVisual } from "./section-visual"
import { VisualImage } from "./visual-image"

/**
 * CHRONICLE RAIL FRAME — Professional Journey.
 *
 * Structure: the section's timeline rail is carried into the visual. A hairline
 * rail runs the height of the figure, a node sits on it, and a spur crosses into
 * the plate's raked top-left corner — so the photograph reads as a station on the
 * career line rather than a picture parked next to it. Depth comes from a single
 * offset shell behind the plate, not from a stack or a glow.
 *
 * Recomposes on mobile: the rail turns horizontal and runs beneath a wide
 * editorial band instead of the desktop portrait column.
 */
export function JourneyVisual({
  visual,
  label,
  era,
}: {
  visual: SectionVisual
  label: string
  era: string | null
}) {
  return (
    <figure data-frame="chronicle" className="relative m-0 [--cut:26px] lg:[--cut:32px]">
      {/* Rail — horizontal beneath the band on mobile, vertical alongside on desktop. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 bottom-3 h-px bg-border/70 lg:left-3 lg:right-auto lg:top-0 lg:bottom-0 lg:h-auto lg:w-px"
      />
      {/* Node seated on the rail. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1 bottom-3 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-primary/70 bg-background lg:left-3 lg:top-11 lg:bottom-auto lg:-translate-x-1/2 lg:translate-y-0"
      />
      {/* Spur — carries the rail into the raked corner of the plate. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 bottom-3 h-4 w-px bg-border/70 lg:left-3 lg:top-11 lg:bottom-auto lg:h-px lg:w-5"
      />

      <div className="relative lg:ml-8">
        {/* Offset shell — the one intentional offset edge, echoing the raked cut. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 translate-x-[7px] translate-y-[7px] bg-primary/[0.07] dark:bg-primary/15"
          style={{ clipPath: CHRONICLE_CLIP }}
        />
        <div
          className="relative aspect-[16/10] overflow-hidden bg-muted shadow-[0_10px_30px_-14px_rgba(10,22,40,0.35)] sm:aspect-[2/1] lg:aspect-[4/5]"
          style={{ clipPath: CHRONICLE_CLIP }}
        >
          <VisualImage
            src={visual.src}
            alt={visual.alt}
            position={visual.position}
            sizes="(min-width: 1280px) 340px, (min-width: 1024px) 280px, 100vw"
          />
          {/* Inner stroke — same print bevel language as the Spotlight frames. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
          />
        </div>
      </div>

      {/* Station marker — a timeline detail, not a caption on a photo. */}
      <figcaption className="mt-4 mb-6 flex items-center gap-2 lg:ml-8 lg:mb-0">
        <span aria-hidden="true" className="h-px w-4 bg-primary/40" />
        {era && <span className={FRAME_META}>{era}</span>}
        <span className={`${FRAME_LABEL} truncate`}>{label}</span>
      </figcaption>
    </figure>
  )
}
