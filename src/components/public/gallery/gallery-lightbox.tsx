"use client"

import React from "react"
import Image from "next/image"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { type GalleryPhoto } from "./gallery-photos"

/**
 * GALLERY LIGHTBOX — the single fullscreen viewer shared by the gallery page
 * and the home teaser.
 *
 * Built on the project's Base UI dialog primitive, which supplies the parts
 * that are easy to get wrong by hand: focus trap, page scroll lock, inert
 * background and Escape-to-close. What this component adds is the image stage,
 * wrap-around navigation and arrow-key handling.
 *
 * Controlled by the grid that owns it, so the tile that opened the viewer can
 * also be handed focus back on close via `returnFocusRef`.
 */

/** One chrome treatment for every control, so the viewer reads as one object. */
const CHROME =
  "inline-flex items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/25 supports-backdrop-filter:backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-0 outline-none"

/** Fade/scale only, and only when the visitor has not asked for less motion. */
const ENTRANCE =
  "motion-safe:duration-200 motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0 motion-safe:data-closed:animate-out motion-safe:data-closed:fade-out-0"

export function GalleryLightbox({
  photos,
  index,
  open,
  onClose,
  onIndexChange,
  returnFocusRef,
}: {
  photos: GalleryPhoto[]
  index: number
  open: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
  returnFocusRef?: React.RefObject<HTMLElement | null>
}) {
  const total = photos.length
  const photo = photos[index]

  const step = React.useCallback(
    (delta: number) => {
      if (total < 2) return
      onIndexChange((index + delta + total) % total)
    },
    [index, onIndexChange, total],
  )

  /* Arrow keys are bound to the popup rather than to window: the dialog traps
     focus, so they work the moment it opens without clicking a control first,
     and nothing stays subscribed while the viewer is closed. */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      step(-1)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      step(1)
    }
  }

  /* A press on the empty chrome around the photo closes the viewer — that is
     the whole dark surface, not just the strip beside the image. A press on the
     photo, on a control or on the caption text never does, so nothing closes
     accidentally while reading or navigating. */
  const handleSurfacePress = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("img, button, a, figcaption")) return
    onClose()
  }

  if (!photo) return null

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={`fixed inset-0 z-50 bg-black/92 supports-backdrop-filter:backdrop-blur-sm ${ENTRANCE}`}
        />
        <DialogPrimitive.Popup
          aria-modal="true"
          tabIndex={-1}
          finalFocus={returnFocusRef}
          onKeyDown={handleKeyDown}
          onClick={handleSurfacePress}
          className={`fixed inset-0 z-50 flex flex-col outline-none ${ENTRANCE} motion-safe:data-open:zoom-in-95 motion-safe:data-closed:zoom-out-95`}
        >
          <DialogPrimitive.Title className="sr-only">
            {photo.caption
              ? `Gallery photo: ${photo.caption}`
              : `Gallery photo ${index + 1} of ${total}`}
          </DialogPrimitive.Title>

          {/* Top bar — counter stays secondary, close stays reachable on every size. */}
          <div className="flex h-14 shrink-0 items-center justify-between px-3 sm:h-16 sm:px-5">
            {total > 1 ? (
              <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-white/55">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </p>
            ) : (
              <span />
            )}
            <DialogPrimitive.Close aria-label="Close image preview" className={`${CHROME} size-11`}>
              <X className="size-5" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          <figure className="m-0 flex min-h-0 flex-1 flex-col">
            {/* Stage — sized by the flex column, with size containment so the
                image can contain-fit against it in pure CSS. */}
            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-16 lg:px-20"
              style={{ containerType: "size" }}
            >
              <LightboxImage key={photo.id} photo={photo} />

              {total > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() => step(-1)}
                    className={`${CHROME} absolute top-1/2 left-1 size-11 -translate-y-1/2 sm:left-4 sm:size-12`}
                  >
                    <ChevronLeft className="size-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => step(1)}
                    className={`${CHROME} absolute top-1/2 right-1 size-11 -translate-y-1/2 sm:right-4 sm:size-12`}
                  >
                    <ChevronRight className="size-6" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            {/* Caption band — never rendered as an empty box. */}
            {(photo.caption || photo.location) && (
              <figcaption className="shrink-0 px-6 pt-3 pb-5 text-center sm:pb-8">
                {photo.caption && (
                  <p className="text-pretty text-sm text-white italic sm:text-base">
                    &ldquo;{photo.caption}&rdquo;
                  </p>
                )}
                {photo.location && (
                  <p className="mt-1.5 font-mono text-[11px] tracking-[0.15em] text-white/55">
                    {photo.location}
                  </p>
                )}
              </figcaption>
            )}
          </figure>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/**
 * The large image. Remounted per photo (keyed by id) so its failure state
 * resets without an effect, and constrained by the stage so a portrait and a
 * panorama both fit without distortion or layout shift.
 */
function LightboxImage({ photo }: { photo: GalleryPhoto }) {
  const [failed, setFailed] = React.useState(false)
  const sizes = "(min-width: 1024px) 80vw, 100vw"
  const shell = "max-h-full max-w-full rounded-lg object-contain shadow-2xl shadow-black/60"

  if (failed) {
    return (
      <div className="flex aspect-[4/3] w-full max-w-lg items-center justify-center rounded-lg bg-white/[0.06] px-8 ring-1 ring-white/15">
        <p className="text-center text-sm text-white/60">{photo.alt}</p>
      </div>
    )
  }

  /* A degenerate asset (zero-pixel decode) reports success rather than an
     error, so treat it as a failure too instead of showing an empty frame. */
  const guards = {
    onError: () => setFailed(true),
    onLoad: (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (event.currentTarget.naturalWidth === 0) setFailed(true)
    },
  }

  if (photo.width && photo.height) {
    /* Contain-fit against the stage in CSS rather than letting the intrinsic
       file size decide: take the width that makes the photo exactly as tall as
       the stage, then cap it by the stage width and by a 2x upscale so a small
       asset is never blown up into mush. Width definite + height auto keeps the
       natural ratio, so the box hugs the photo and the area around it stays
       click-to-close. */
    const ratio = (photo.width / photo.height).toFixed(4)
    return (
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        style={{ width: `min(100cqw, ${ratio} * 100cqh, ${photo.width * 2}px)`, height: "auto" }}
        className={shell}
        {...guards}
      />
    )
  }

  /* No stored dimensions: let the stage define the box and contain inside it. */
  return (
    <div className="relative h-full w-full">
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} className={shell} {...guards} />
    </div>
  )
}
