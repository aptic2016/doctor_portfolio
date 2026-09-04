import type { CSSProperties } from "react"

/**
 * SPOTLIGHT DESIGN STAGE — single source of truth for Spotlight geometry.
 *
 * Every saved coordinate (xPercent / yPercent / widthPercent / heightPercent) is a
 * percentage of ONE logical stage that owns the whole section: background, text,
 * CTAs and collage photos. The Admin editor authors against this stage and the
 * public page renders against the same stage, so a saved composition is
 * reproduced exactly instead of being re-mapped into a narrower column.
 *
 * Stage dimensions are FIXED per viewport on purpose. A stage that grew with its
 * content would change the denominator of every percentage, so moving one photo
 * would silently move all the others.
 */

export type SpotlightViewport = "desktop" | "mobile"

export interface SpotlightImage {
  id: string
  mediaUrl: string | null
  altText: string | null
  caption: string | null
  isVisible: boolean
  isLocked: boolean
  sortOrder: number
  rotation: number
  sizeVariant: string
  frameWidth: string
  frameHeight: string
  offsetX: string
  offsetY: string
  xPercent: number
  yPercent: number
  widthPercent: number
  heightPercent: number
  zIndex: number
  framePreset: string
  shadowPreset: string
  mobileXPercent: number | null
  mobileYPercent: number | null
  mobileWidthPercent: number | null
  mobileHeightPercent: number | null
  mobileRotation: number | null
}

export interface SpotlightSetting {
  eyebrow: string
  heading: string
  supportingText: string
  primaryCtaLabel: string
  primaryCtaDestination: string
  primaryCtaVisible: boolean
  secondaryCtaLabel: string
  secondaryCtaDestination: string
  secondaryCtaVisible: boolean
  backgroundImage: string | null
  backgroundOverlayStrength: number
  collageStyle: string
  frameStyle: string
  collageHeight: string
}

/** Logical stage size in design pixels. Public + Admin both resolve against these. */
export const SPOTLIGHT_STAGE: Record<SpotlightViewport, { width: number; height: number }> = {
  desktop: { width: 900, height: 500 },
  mobile: { width: 375, height: 500 },
}

/** Breakpoint (px) at which the public page switches from the mobile to the desktop stage. */
export const SPOTLIGHT_MOBILE_BREAKPOINT = 768

/**
 * Prefix for photos that exist only in the editor. Add / duplicate stay local until
 * Save, so a local id is what tells the save transaction to create a row.
 */
export const SPOTLIGHT_LOCAL_ID_PREFIX = "new:"

export function isLocalSpotlightId(id: string): boolean {
  return id.startsWith(SPOTLIGHT_LOCAL_ID_PREFIX)
}

export function getSpotlightStage(viewport: SpotlightViewport) {
  return SPOTLIGHT_STAGE[viewport]
}

export const SPOTLIGHT_GRADIENT =
  "linear-gradient(to bottom right, #0f2847 0%, #153561 50%, #0d2240 100%)"

export interface SpotlightGeometry {
  x: number
  y: number
  w: number
  h: number
  rotation: number
}

/**
 * Resolve the geometry for one photo on one stage. Mobile values are used when
 * present and fall back to the desktop value field-by-field when null.
 */
export function resolveSpotlightGeometry(
  img: SpotlightImage,
  viewport: SpotlightViewport,
): SpotlightGeometry {
  if (viewport === "mobile") {
    return {
      x: img.mobileXPercent ?? img.xPercent,
      y: img.mobileYPercent ?? img.yPercent,
      w: img.mobileWidthPercent ?? img.widthPercent,
      h: img.mobileHeightPercent ?? img.heightPercent,
      rotation: img.mobileRotation ?? img.rotation,
    }
  }
  return {
    x: img.xPercent,
    y: img.yPercent,
    w: img.widthPercent,
    h: img.heightPercent,
    rotation: img.rotation,
  }
}

/** The ONE place a photo's box is turned into CSS. Used by Admin and Public alike. */
export function spotlightPhotoStyle(geo: SpotlightGeometry, zIndex: number): CSSProperties {
  return {
    position: "absolute",
    left: `${geo.x}%`,
    top: `${geo.y}%`,
    width: `${geo.w}%`,
    height: `${geo.h}%`,
    transform: `rotate(${geo.rotation}deg)`,
    zIndex,
  }
}

/** Renderable photos, in a stable order. */
export function visibleSpotlightImages(images: SpotlightImage[]): SpotlightImage[] {
  return images
    .filter((img) => img.isVisible && img.mediaUrl)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Express a design pixel as a container-query unit of the stage.
 *
 * The stage declares `container-type: inline-size`, so 1cqw is 1% of the stage's
 * laid-out width. Chrome (frame padding, borders, type) therefore scales with the
 * stage exactly the way the geometry does — identical proportions in the fixed-size
 * Admin canvas and the fluid public stage, with no JavaScript measurement.
 */
export function stageUnit(px: number, stageWidth: number): string {
  return `${((px / stageWidth) * 100).toFixed(4)}cqw`
}

/** Text/CTA block layout, in design pixels of the desktop stage. */
export const SPOTLIGHT_TEXT = {
  desktop: { inset: 40, maxWidth: 430, eyebrow: 11, heading: 30, support: 14, cta: 12 },
  mobile: { inset: 20, maxWidth: 335, eyebrow: 10, heading: 21, support: 12, cta: 11 },
} as const satisfies Record<SpotlightViewport, Record<string, number>>
