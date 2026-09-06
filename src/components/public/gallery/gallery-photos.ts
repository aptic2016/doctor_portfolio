/**
 * GALLERY PHOTO CONTRACT — the one shape the gallery grid, the home preview
 * grid and the shared lightbox all agree on.
 *
 * Deliberately framework-free (no "use client") so server components can map
 * database rows here and hand plain data to the client leaves.
 */

/**
 * Photos the home teaser shows when site settings carry no configured value —
 * the admin control in Site Settings overrides this per site.
 */
export const HOME_GALLERY_LIMIT = 6

/** Used when a media asset has no stored dimensions, so tiles never collapse. */
export const GALLERY_FALLBACK_RATIO = 4 / 3

export interface GalleryPhoto {
  id: string
  src: string
  alt: string
  caption: string | null
  location: string | null
  /** Intrinsic pixel size when Cloudinary reported it; null otherwise. */
  width: number | null
  height: number | null
}

/** The subset of a GalleryItem row this module needs. */
export interface GalleryPhotoSource {
  id: string
  caption: string | null
  location?: string | null
  mediaAsset?: {
    secureUrl: string | null
    altText: string | null
    width: number | null
    height: number | null
  } | null
}

/**
 * Maps visible gallery rows to photos, dropping any row whose media asset is
 * gone. Order is preserved, so the caller's sortOrder stays the navigation
 * order in the lightbox.
 */
export function toGalleryPhotos(items: GalleryPhotoSource[]): GalleryPhoto[] {
  return items.flatMap((item, index) => {
    const src = item.mediaAsset?.secureUrl
    if (!src) return []
    return [
      {
        id: item.id,
        src,
        alt: item.mediaAsset?.altText || item.caption || `Gallery photograph ${index + 1}`,
        caption: item.caption,
        location: item.location ?? null,
        width: item.mediaAsset?.width ?? null,
        height: item.mediaAsset?.height ?? null,
      },
    ]
  })
}

/** Ratio for the tile box, so `fill` images always have a height to fill. */
export function photoAspectRatio(photo: GalleryPhoto): number {
  if (photo.width && photo.height) return photo.width / photo.height
  return GALLERY_FALLBACK_RATIO
}

/** Label for the tile button — captions are the most useful thing to announce. */
export function photoOpenLabel(photo: GalleryPhoto, index: number, total: number): string {
  return photo.caption
    ? `Open photo: ${photo.caption}`
    : `Open photo ${index + 1} of ${total}`
}
