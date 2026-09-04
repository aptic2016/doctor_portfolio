"use client"

import React from "react"
import { motion } from "motion/react"

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

const FRAME_PRESETS: Record<string, { padding: string; border: string; radius: string }> = {
  none: { padding: "p-0", border: "", radius: "rounded" },
  clean: { padding: "p-1", border: "border-2 border-white/20", radius: "rounded-md" },
  editorial: { padding: "p-[7px]", border: "border-[3px] border-white/22", radius: "rounded-lg" },
  polaroid: { padding: "p-1 pb-6", border: "border-[3px] border-white/25", radius: "rounded-sm" },
  glass: { padding: "p-1", border: "border border-white/30", radius: "rounded-xl" },
}

const SHADOW_PRESETS: Record<string, string> = {
  none: "",
  soft: "shadow-[0_4px_16px_rgba(0,0,0,0.15)]",
  medium: "shadow-[0_6px_24px_rgba(0,0,0,0.28)]",
  editorial: "shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
}

function resolveFrameStyle(frameStyle: string) {
  const padding = frameStyle === "minimal" ? "p-1" : frameStyle === "clean" ? "p-1.5" : "p-[7px]"
  const border = frameStyle === "minimal"
    ? "border border-white/15"
    : frameStyle === "clean"
    ? "border-2 border-white/18"
    : "border-[3px] border-white/22"
  const shadow = frameStyle === "minimal"
    ? "shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
    : "shadow-[0_6px_24px_rgba(0,0,0,0.28)]"
  const innerRadius = frameStyle === "minimal" ? "rounded" : "rounded-[6px]"
  return { padding, border, shadow, innerRadius }
}

function MergeWrap({ animated, delay, className, style, children }: {
  animated: boolean; delay: number; className?: string; style?: React.CSSProperties; children: React.ReactNode
}) {
  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay, ease: "easeOut" }}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    )
  }
  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}

function ImageFrame({ src, alt, frameStyle, framePreset, shadowPreset, className }: { src: string; alt: string; frameStyle: string; framePreset?: string; shadowPreset?: string; className?: string }) {
  const preset = framePreset && FRAME_PRESETS[framePreset] ? FRAME_PRESETS[framePreset] : null
  const padding = preset?.padding ?? (frameStyle === "minimal" ? "p-1" : frameStyle === "clean" ? "p-1.5" : "p-[7px]")
  const border = preset?.border ?? (frameStyle === "minimal" ? "border border-white/15" : frameStyle === "clean" ? "border-2 border-white/18" : "border-[3px] border-white/22")
  const radius = preset?.radius ?? (frameStyle === "minimal" ? "rounded" : "rounded-[6px]")
  const shadow = shadowPreset && SHADOW_PRESETS[shadowPreset] !== undefined ? SHADOW_PRESETS[shadowPreset] : (frameStyle === "minimal" ? "shadow-[0_4px_16px_rgba(0,0,0,0.2)]" : "shadow-[0_6px_24px_rgba(0,0,0,0.28)]")
  const [imgError, setImgError] = React.useState(false)
  return (
    <div className={`relative bg-white/95 ${padding} ${border} ${shadow} rounded-lg w-full h-full ${className || ""}`}>
      <div className={`overflow-hidden ${radius} w-full h-full`}>
        {imgError ? (
          <div className="w-full h-full bg-red-500/10 flex items-center justify-center text-red-400 text-[10px] text-center px-2">Image unavailable — replace this photo</div>
        ) : (
          <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" onError={() => setImgError(true)} />
        )}
      </div>
    </div>
  )
}

/* ─── FREEFORM MODE ─── */
function FreeformCollage({ images, frameStyle, animated }: { images: SpotlightImage[]; frameStyle: string; animated: boolean }) {
  return (
    <div className="relative w-full" style={{ paddingBottom: "55.55%" }}>
      {images.map((img, i) => {
        const rot = img.rotation || 0
        return (
          <MergeWrap
            key={img.id}
            animated={animated}
            delay={0.1 + i * 0.08}
            className="absolute"
            style={{
              left: `${img.xPercent}%`,
              top: `${img.yPercent}%`,
              width: `${img.widthPercent}%`,
              height: `${img.heightPercent}%`,
              transform: `rotate(${rot}deg)`,
              zIndex: img.zIndex,
            }}
          >
            <ImageFrame src={img.mediaUrl!} alt={img.altText || ""} frameStyle={frameStyle} framePreset={img.framePreset} shadowPreset={img.shadowPreset} />
          </MergeWrap>
        )
      })}
    </div>
  )
}

/* ─── EDITORIAL ─── */
function EditorialCollage({ images, frameStyle, animated }: { images: SpotlightImage[]; frameStyle: string; animated: boolean }) {
  const slots = [images[0], images[1], images[2], images[3]].filter(Boolean)
  const { padding, border, shadow, innerRadius } = resolveFrameStyle(frameStyle)
  const defaultRotations = [-2.5, 1.8, -1.2, 2.2]
  const sizes = ["aspect-[4/5]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]"]

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 relative">
      {slots.map((img, i) => {
        const rot = img!.rotation || defaultRotations[i]
        const w = img!.frameWidth && img!.frameWidth !== "auto" ? img!.frameWidth : undefined
        const h = img!.frameHeight && img!.frameHeight !== "auto" ? img!.frameHeight : undefined
        const ox = img!.offsetX && img!.offsetX !== "0" ? img!.offsetX : undefined
        const oy = img!.offsetY && img!.offsetY !== "0" ? img!.offsetY : undefined
        return (
          <MergeWrap
            key={img!.id}
            animated={animated}
            delay={0.15 + i * 0.1}
            className={`relative group ${i === 0 ? "mt-0" : i === 1 ? "mt-3" : i === 2 ? "mt-[-6px]" : "mt-1"}`}
            style={{ transform: `rotate(${rot}deg) translateX(${ox || "0"}) translateY(${oy || "0"})`, zIndex: i + 1, ...(w ? { width: w } : {}), ...(h ? { height: h } : {}) }}
          >
            <div className={`relative bg-white/95 ${padding} ${border} ${shadow} rounded-lg transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1 group-hover:shadow-[0_10px_36px_rgba(0,0,0,0.4)]`}>
              <div className={`overflow-hidden ${innerRadius}`}>
                <img src={img!.mediaUrl!} alt={img!.altText || ""} className={`w-full object-cover ${sizes[i]}`} loading="lazy" />
              </div>
              {frameStyle === "editorial" && i < 2 && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white/35 rounded-b-[2px] rotate-[0.5deg]" />
              )}
            </div>
          </MergeWrap>
        )
      })}
    </div>
  )
}

/* ─── CLEAN GRID ─── */
function CleanGrid({ images, frameStyle, animated }: { images: SpotlightImage[]; frameStyle: string; animated: boolean }) {
  const slots = [images[0], images[1], images[2], images[3]].filter(Boolean)
  const borderClass = frameStyle === "minimal" ? "border border-white/12" : "border-2 border-white/15"

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
      {slots.map((img, i) => {
        const w = img!.frameWidth && img!.frameWidth !== "auto" ? img!.frameWidth : undefined
        const h = img!.frameHeight && img!.frameHeight !== "auto" ? img!.frameHeight : undefined
        const ox = img!.offsetX && img!.offsetX !== "0" ? img!.offsetX : undefined
        const oy = img!.offsetY && img!.offsetY !== "0" ? img!.offsetY : undefined
        return (
          <MergeWrap
            key={img!.id}
            animated={animated}
            delay={0.12 + i * 0.08}
            className="group"
            style={{ transform: `translateX(${ox || "0"}) translateY(${oy || "0"})`, ...(w ? { width: w } : {}), ...(h ? { height: h } : {}) }}
          >
            <div className={`bg-white/95 p-1.5 ${borderClass} rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:scale-[1.03]`}>
              <img src={img!.mediaUrl!} alt={img!.altText || ""} className="w-full aspect-square object-cover rounded-[5px]" loading="lazy" />
            </div>
          </MergeWrap>
        )
      })}
    </div>
  )
}

/* ─── LAYERED ─── */
function LayeredCollage({ images, frameStyle, animated }: { images: SpotlightImage[]; frameStyle: string; animated: boolean }) {
  const slots = [images[0], images[1], images[2], images[3]].filter(Boolean)
  const frameShadow = frameStyle === "minimal" ? "shadow-[0_4px_16px_rgba(0,0,0,0.2)]" : "shadow-[0_6px_24px_rgba(0,0,0,0.28)]"

  return (
    <div className="relative min-h-[300px] sm:min-h-[360px]">
      {slots.map((img, i) => {
        const defaultOffsets = [
          "top-0 left-0 z-10 w-[52%]",
          "top-2 right-0 z-20 w-[48%]",
          "bottom-[8%] left-[4%] z-30 w-[46%]",
          "bottom-0 right-[2%] z-40 w-[50%]",
        ]
        const defaultRotations = [0, 2.5, -1.8, 1.2]
        const rot = img!.rotation || defaultRotations[i]
        const ox = img!.offsetX && img!.offsetX !== "0" ? img!.offsetX : undefined
        const oy = img!.offsetY && img!.offsetY !== "0" ? img!.offsetY : undefined
        return (
          <MergeWrap
            key={img!.id}
            animated={animated}
            delay={0.15 + i * 0.1}
            className={`absolute ${defaultOffsets[i]} group`}
            style={{ transform: `rotate(${rot}deg) translateX(${ox || "0"}) translateY(${oy || "0"})` }}
          >
            <div className={`bg-white/95 p-[6px] border-[2.5px] border-white/20 ${frameShadow} rounded-lg transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_10px_36px_rgba(0,0,0,0.4)]`}>
              <img src={img!.mediaUrl!} alt={img!.altText || ""} className="w-full aspect-[4/5] object-cover rounded-[5px]" loading="lazy" />
            </div>
          </MergeWrap>
        )
      })}
    </div>
  )
}

/* ─── MINIMAL ─── */
function MinimalCollage({ images, frameStyle, animated }: { images: SpotlightImage[]; frameStyle: string; animated: boolean }) {
  const slots = [images[0], images[1], images[2], images[3]].filter(Boolean)
  const borderClass = frameStyle === "minimal" ? "border border-white/12" : "border-2 border-white/15"

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
      {slots.map((img, i) => {
        const w = img!.frameWidth && img!.frameWidth !== "auto" ? img!.frameWidth : undefined
        const h = img!.frameHeight && img!.frameHeight !== "auto" ? img!.frameHeight : undefined
        const ox = img!.offsetX && img!.offsetX !== "0" ? img!.offsetX : undefined
        const oy = img!.offsetY && img!.offsetY !== "0" ? img!.offsetY : undefined
        return (
          <MergeWrap
            key={img!.id}
            animated={animated}
            delay={0.12 + i * 0.08}
            className="group"
            style={{ transform: `translateX(${ox || "0"}) translateY(${oy || "0"})`, ...(w ? { width: w } : {}), ...(h ? { height: h } : {}) }}
          >
            <div className={`bg-white/95 p-1.5 ${borderClass} rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:scale-[1.03]`}>
              <img src={img!.mediaUrl!} alt={img!.altText || ""} className="w-full aspect-square object-cover rounded-[5px]" loading="lazy" />
            </div>
          </MergeWrap>
        )
      })}
    </div>
  )
}

/* ─── MAIN COLLAGE COMPONENT ─── */
export function SpotlightCollage({
  images,
  collageStyle,
  frameStyle,
  collageHeight,
  animated = true,
}: {
  images: SpotlightImage[]
  collageStyle: string
  frameStyle: string
  collageHeight?: string
  animated?: boolean
}) {
  const containerStyle: React.CSSProperties = {}
  if (collageHeight && collageHeight !== "auto") {
    containerStyle.minHeight = collageHeight
  }

  return (
    <div className="relative" style={containerStyle}>
      {collageStyle === "freeform" && <FreeformCollage images={images} frameStyle={frameStyle} animated={animated} />}
      {collageStyle === "clean-grid" && <CleanGrid images={images} frameStyle={frameStyle} animated={animated} />}
      {collageStyle === "layered" && <LayeredCollage images={images} frameStyle={frameStyle} animated={animated} />}
      {collageStyle === "editorial" && <EditorialCollage images={images} frameStyle={frameStyle} animated={animated} />}
      {collageStyle === "minimal" && <MinimalCollage images={images} frameStyle={frameStyle} animated={animated} />}
      {!["freeform", "clean-grid", "layered", "editorial", "minimal"].includes(collageStyle) && <FreeformCollage images={images} frameStyle={frameStyle} animated={animated} />}
    </div>
  )
}
