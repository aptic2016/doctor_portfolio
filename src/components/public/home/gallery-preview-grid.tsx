"use client"

import React from "react"
import Image from "next/image"
import { Maximize2 } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { GalleryLightbox } from "@/components/public/gallery/gallery-lightbox"
import { photoOpenLabel, type GalleryPhoto } from "@/components/public/gallery/gallery-photos"

/**
 * HOME GALLERY TEASER GRID — the interactive part of the home gallery section.
 *
 * Receives the already-sliced preview set from its server parent, so the section
 * itself stays server-rendered and only this grid ships to the browser. Opens
 * the same lightbox the gallery page uses, navigating the preview set.
 *
 * Column spans adapt to the photo count so the last row is never left ragged:
 * an odd photo runs full width on mobile, and a trailing pair takes half the
 * row on desktop.
 */
export function GalleryPreviewGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [open, setOpen] = React.useState(false)
  const [index, setIndex] = React.useState(0)
  const returnFocusRef = React.useRef<HTMLElement | null>(null)

  const total = photos.length
  const oddLast = total % 2 === 1

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-[1080px] mx-auto">
        {photos.map((photo, i) => {
          const wide = oddLast && i === total - 1 ? "md:col-span-1" : ""
          return (
            <RevealSection key={photo.id} delay={i < 3 ? 1 : 2} className={wide}>
              <button
                type="button"
                aria-label={photoOpenLabel(photo, i, total)}
                onClick={(event) => {
                  returnFocusRef.current = event.currentTarget
                  setIndex(i)
                  setOpen(true)
                }}
                className="group relative block aspect-[3/2] w-full overflow-hidden rounded-xl border border-border/30 bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 ring-1 ring-white/25 transition-opacity duration-300 supports-backdrop-filter:backdrop-blur-sm group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <Maximize2 className="size-3" />
                </span>
                {photo.caption && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 line-clamp-2 translate-y-full px-3 pt-6 pb-2.5 text-center text-xs text-white italic transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none"
                  >
                    &ldquo;{photo.caption}&rdquo;
                  </span>
                )}
              </button>
            </RevealSection>
          )
        })}
      </div>

      <GalleryLightbox
        photos={photos}
        index={index}
        open={open}
        onClose={() => setOpen(false)}
        onIndexChange={setIndex}
        returnFocusRef={returnFocusRef}
      />
    </>
  )
}
