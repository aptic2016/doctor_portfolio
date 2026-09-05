"use client"

import React from "react"
import Image from "next/image"
import { Maximize2 } from "lucide-react"
import { GalleryLightbox } from "./gallery-lightbox"
import {
  photoAspectRatio,
  photoOpenLabel,
  toGalleryPhotos,
  type GalleryPhotoSource,
} from "./gallery-photos"

/**
 * PUBLIC GALLERY GRID — the full collection, in admin sort order.
 *
 * A masonry column layout where every tile carries its own stored aspect ratio,
 * so images keep their natural shape and the grid reserves the right space
 * before they load. Tiles are real buttons: clicking or activating one opens the
 * shared lightbox at that index and returns focus to the tile on close.
 */
export function PublicGallery({ items }: { items: GalleryPhotoSource[] }) {
  const photos = React.useMemo(() => toGalleryPhotos(items), [items])
  const [open, setOpen] = React.useState(false)
  const [index, setIndex] = React.useState(0)
  /* The tile that opened the viewer, so the dialog can hand focus back to it. */
  const returnFocusRef = React.useRef<HTMLElement | null>(null)

  return (
    <>
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {photos.map((photo, i) => (
          <figure key={photo.id} className="m-0 mb-4 break-inside-avoid">
            <button
              type="button"
              aria-label={photoOpenLabel(photo, i, photos.length)}
              style={{ aspectRatio: photoAspectRatio(photo) }}
              onClick={(event) => {
                returnFocusRef.current = event.currentTarget
                setIndex(i)
                setOpen(true)
              }}
              className="group relative block w-full overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/25 group-focus-visible:bg-black/25"
              />
              {/* Quiet affordance: this tile opens a larger view. */}
              <span
                aria-hidden="true"
                className="absolute right-2.5 bottom-2.5 flex size-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 ring-1 ring-white/25 transition-opacity duration-300 supports-backdrop-filter:backdrop-blur-sm group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Maximize2 className="size-3.5" />
              </span>
            </button>
            {photo.caption && (
              <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">
                &ldquo;{photo.caption}&rdquo;
              </figcaption>
            )}
          </figure>
        ))}
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
