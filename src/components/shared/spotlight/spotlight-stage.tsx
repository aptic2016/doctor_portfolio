"use client"

import React, { type CSSProperties, type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  SPOTLIGHT_GRADIENT,
  SPOTLIGHT_TEXT,
  getSpotlightStage,
  isOptimizableImage,
  resolveSpotlightGeometry,
  spotlightPhotoSizes,
  spotlightPhotoStyle,
  stageUnit,
  visibleSpotlightImages,
  type SpotlightGeometry,
  type SpotlightImage,
  type SpotlightSetting,
  type SpotlightViewport,
} from "./stage"
import { SpotlightPhotoFrame } from "./spotlight-photo-frame"

/**
 * SPOTLIGHT STAGE — the one renderer for a saved Spotlight composition.
 *
 * Admin mounts it with `sizing="fixed"` (900×500 design pixels, scaled by the
 * editor's own transform) and injects selection handles through `renderPhoto`.
 * Public mounts it with `sizing="responsive"` (width:100% + aspect-ratio), which
 * needs no ResizeObserver and therefore cannot jitter. Geometry, frames and the
 * text block come from the same code in both cases.
 */

export function SpotlightBackdrop({ setting }: { setting: SpotlightSetting }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ backgroundImage: SPOTLIGHT_GRADIENT }} />
      {setting.backgroundImage && (
        <>
          {isOptimizableImage(setting.backgroundImage) ? (
            <Image
              src={setting.backgroundImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              aria-hidden="true"
            />
          ) : (
            <img
              src={setting.backgroundImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 bg-[#0f2847]" style={{ opacity: setting.backgroundOverlayStrength }} />
        </>
      )}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
    </div>
  )
}

/** Text + CTAs, anchored to the stage's top-left inset and sized in stage units. */
function SpotlightTextBlock({
  setting,
  viewport,
  interactive,
}: {
  setting: SpotlightSetting
  viewport: SpotlightViewport
  interactive: boolean
}) {
  const stage = getSpotlightStage(viewport)
  const t = SPOTLIGHT_TEXT[viewport]
  const u = (px: number) => stageUnit(px, stage.width)

  const ctaStyle: CSSProperties = {
    fontSize: u(t.cta),
    paddingLeft: u(18),
    paddingRight: u(18),
    paddingTop: u(9),
    paddingBottom: u(9),
    borderRadius: u(8),
    lineHeight: 1.2,
  }

  const ctas = [
    setting.primaryCtaVisible && {
      key: "primary",
      label: setting.primaryCtaLabel,
      href: setting.primaryCtaDestination,
      className: "inline-flex items-center justify-center font-semibold bg-white text-[#0f2847] whitespace-nowrap",
      style: ctaStyle,
    },
    setting.secondaryCtaVisible && {
      key: "secondary",
      label: setting.secondaryCtaLabel,
      href: setting.secondaryCtaDestination,
      className: "inline-flex items-center justify-center font-medium text-white/90 whitespace-nowrap",
      style: { ...ctaStyle, border: `${u(1)} solid rgba(255,255,255,0.2)` },
    },
  ].filter(Boolean) as { key: string; label: string; href: string; className: string; style: CSSProperties }[]

  return (
    <div
      data-spotlight-text=""
      className={`absolute ${interactive ? "" : "pointer-events-none select-none"}`}
      style={{
        left: u(t.inset),
        top: u(t.inset),
        width: u(t.maxWidth),
        maxWidth: `calc(100% - ${u(t.inset * 2)})`,
      }}
    >
      {setting.eyebrow && (
        <p
          className="font-semibold uppercase text-blue-300/90"
          style={{ fontSize: u(t.eyebrow), letterSpacing: "0.22em", marginBottom: u(8) }}
        >
          {setting.eyebrow}
        </p>
      )}
      <h2
        className="font-bold text-white"
        style={{ fontSize: u(t.heading), lineHeight: 1.12, letterSpacing: "-0.01em", marginBottom: u(12) }}
      >
        {setting.heading}
      </h2>
      {setting.supportingText && (
        <p className="text-blue-100/65" style={{ fontSize: u(t.support), lineHeight: 1.55, marginBottom: u(16) }}>
          {setting.supportingText}
        </p>
      )}
      {ctas.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: u(12) }}>
          {ctas.map((cta) =>
            interactive ? (
              <Link key={cta.key} href={cta.href || "#"} className={cta.className} style={cta.style}>
                {cta.label}
              </Link>
            ) : (
              <span key={cta.key} className={cta.className} style={cta.style}>
                {cta.label}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  )
}

export interface SpotlightPhotoRenderArgs {
  img: SpotlightImage
  geo: SpotlightGeometry
  /** Absolute box for this photo. Use it as-is so Admin and Public stay in sync. */
  style: CSSProperties
  /** The shared frame element for this photo. */
  frame: ReactNode
  index: number
}

export function SpotlightStage({
  setting,
  images,
  viewport,
  sizing = "responsive",
  showBackground = true,
  includeHidden = false,
  interactive = false,
  className,
  style,
  stageRef,
  renderPhoto,
  children,
}: {
  setting: SpotlightSetting
  images: SpotlightImage[]
  viewport: SpotlightViewport
  /** "fixed" = design pixels (Admin canvas). "responsive" = width:100% + aspect-ratio (Public). */
  sizing?: "fixed" | "responsive"
  showBackground?: boolean
  /** Admin renders hidden photos too, so they can be re-enabled. */
  includeHidden?: boolean
  /** Public renders real links; the editor renders inert CTA chips. */
  interactive?: boolean
  className?: string
  style?: CSSProperties
  stageRef?: React.Ref<HTMLDivElement>
  renderPhoto?: (args: SpotlightPhotoRenderArgs) => ReactNode
  children?: ReactNode
}) {
  const stage = getSpotlightStage(viewport)
  const list = includeHidden
    ? images.slice().sort((a, b) => a.sortOrder - b.sortOrder)
    : visibleSpotlightImages(images)

  const sizingStyle: CSSProperties =
    sizing === "fixed"
      ? { width: stage.width, height: stage.height }
      : { width: "100%", aspectRatio: `${stage.width} / ${stage.height}` }

  return (
    <div
      ref={stageRef}
      data-spotlight-stage=""
      data-spotlight-viewport={viewport}
      className={`relative overflow-hidden ${className || ""}`}
      style={{ containerType: "inline-size", ...sizingStyle, ...style }}
    >
      {showBackground && <SpotlightBackdrop setting={setting} />}
      <SpotlightTextBlock setting={setting} viewport={viewport} interactive={interactive} />
      {list.map((img, index) => {
        const geo = resolveSpotlightGeometry(img, viewport)
        const photoStyle = spotlightPhotoStyle(geo, img.zIndex)
        const frame = (
          <SpotlightPhotoFrame
            src={img.mediaUrl}
            alt={img.altText || ""}
            framePreset={img.framePreset}
            shadowPreset={img.shadowPreset}
            frameStyle={setting.frameStyle}
            stageWidth={stage.width}
            sizes={spotlightPhotoSizes(geo.w)}
          />
        )
        if (renderPhoto) {
          return <React.Fragment key={img.id}>{renderPhoto({ img, geo, style: photoStyle, frame, index })}</React.Fragment>
        }
        return (
          <div key={img.id} data-spotlight-photo={img.id} style={photoStyle}>
            {frame}
          </div>
        )
      })}
      {children}
    </div>
  )
}
