"use client"

import React from "react"
import Image from "next/image"

/**
 * VISUAL IMAGE — the one image primitive the three home frames share.
 *
 * Client-side purely so a dead Cloudinary URL degrades to a calm themed plate
 * instead of the browser's broken-image glyph; the frames themselves stay server
 * components. Always rendered into a caller-owned fixed-ratio box with `fill`,
 * so nothing shifts while it loads.
 */
export function VisualImage({
  src,
  alt,
  position,
  sizes,
  priority = false,
}: {
  src: string
  alt: string
  position: string
  sizes: string
  priority?: boolean
}) {
  const [failed, setFailed] = React.useState(false)

  if (failed) {
    return (
      <div className="absolute inset-0 bg-muted">
        <div className="absolute inset-0 medical-grid" aria-hidden="true" />
        <span className="sr-only">{alt}</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      style={{ objectPosition: position }}
      onError={() => setFailed(true)}
      /* A degenerate asset (zero-pixel decode) reports success rather than an
         error, so it would otherwise render as an empty window. Treat it as a
         failure and show the same themed plate. */
      onLoad={(event) => {
        if (event.currentTarget.naturalWidth === 0) setFailed(true)
      }}
    />
  )
}
