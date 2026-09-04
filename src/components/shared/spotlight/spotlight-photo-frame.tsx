"use client"

import React from "react"
import { stageUnit } from "./stage"

/**
 * SPOTLIGHT PHOTO FRAME — the single frame/shadow renderer.
 *
 * Frame metrics are declared once, in design pixels of the stage, and emitted as
 * container-query units so the chrome scales with the stage in exactly the same
 * proportion as the geometry does. Admin (fixed 900px stage) and Public (fluid
 * stage) therefore produce visually identical frames with no JS measurement.
 */

interface FrameSpec {
  pad: number
  padBottom?: number
  border: number
  radius: number
  borderColor: string
}

const FRAMES: Record<string, FrameSpec> = {
  editorial: { pad: 5, border: 3, radius: 8, borderColor: "rgba(255,255,255,0.22)" },
  clean: { pad: 4, border: 2, radius: 6, borderColor: "rgba(255,255,255,0.20)" },
  minimal: { pad: 4, border: 1, radius: 4, borderColor: "rgba(255,255,255,0.15)" },
  polaroid: { pad: 4, padBottom: 20, border: 3, radius: 2, borderColor: "rgba(255,255,255,0.25)" },
  glass: { pad: 4, border: 1, radius: 12, borderColor: "rgba(255,255,255,0.30)" },
  none: { pad: 0, border: 0, radius: 4, borderColor: "transparent" },
}

interface ShadowSpec {
  y: number
  blur: number
  alpha: number
}

const SHADOWS: Record<string, ShadowSpec | null> = {
  none: null,
  soft: { y: 4, blur: 16, alpha: 0.15 },
  medium: { y: 6, blur: 24, alpha: 0.28 },
  editorial: { y: 8, blur: 32, alpha: 0.35 },
}

/** Section-level `frameStyle` is the fallback when a photo has no `framePreset`. */
function resolveFrame(framePreset: string | undefined, frameStyle: string | undefined): FrameSpec {
  if (framePreset && FRAMES[framePreset]) return FRAMES[framePreset]
  if (frameStyle && FRAMES[frameStyle]) return FRAMES[frameStyle]
  return FRAMES.editorial
}

function resolveShadow(shadowPreset: string | undefined, frameStyle: string | undefined): ShadowSpec | null {
  if (shadowPreset && shadowPreset in SHADOWS) return SHADOWS[shadowPreset]
  return frameStyle === "minimal" ? SHADOWS.soft : SHADOWS.medium
}

export function SpotlightPhotoFrame({
  src,
  alt,
  framePreset,
  shadowPreset,
  frameStyle,
  stageWidth,
  className,
}: {
  src: string | null
  alt: string
  framePreset?: string
  shadowPreset?: string
  frameStyle?: string
  stageWidth: number
  className?: string
}) {
  const [failed, setFailed] = React.useState(false)
  const frame = resolveFrame(framePreset, frameStyle)
  const shadow = resolveShadow(shadowPreset, frameStyle)
  const u = (px: number) => stageUnit(px, stageWidth)

  return (
    <div
      className={`w-full h-full bg-white/95 ${className || ""}`}
      style={{
        padding: u(frame.pad),
        paddingBottom: u(frame.padBottom ?? frame.pad),
        borderWidth: u(frame.border),
        borderStyle: "solid",
        borderColor: frame.borderColor,
        borderRadius: u(frame.radius),
        boxShadow: shadow ? `0 ${u(shadow.y)} ${u(shadow.blur)} rgba(0,0,0,${shadow.alpha})` : undefined,
        boxSizing: "border-box",
      }}
    >
      <div className="w-full h-full overflow-hidden" style={{ borderRadius: u(4) }}>
        {!src || failed ? (
          <div
            className="w-full h-full flex items-center justify-center bg-red-500/10 text-red-500 text-center leading-tight px-1"
            style={{ fontSize: u(10) }}
          >
            Image unavailable
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            loading="lazy"
            draggable={false}
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  )
}
