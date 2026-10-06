"use client"

import { useEffect, useState } from "react"

interface HeroOverlayPocketProps {
  children: React.ReactNode
  style?: string
  x: number
  y: number
  width: string
  opacity: number
  sortOrder: number
  animate?: boolean
}

export function HeroOverlayPocket({
  children,
  style,
  x,
  y,
  width,
  opacity,
  sortOrder,
  animate = true,
}: HeroOverlayPocketProps) {
  const [entered, setEntered] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Keep the centered pocket inside its container so it never creates page-level
  // horizontal scroll when the configured width reaches the container edge.
  const widthPx = /^-?\d+(\.\d+)?px$/.test(width.trim()) ? Math.abs(parseFloat(width)) : null
  const left = widthPx
    ? `clamp(${widthPx / 2}px, ${x}%, calc(100% - ${widthPx / 2}px))`
    : `${x}%`

  useEffect(() => {
    if (!animate) {
      setMounted(true)
      setEntered(true)
      return
    }
    const raf = requestAnimationFrame(() => {
      setMounted(true)
      const baseDelay = 400
      const staggerDelay = sortOrder * 750
      const timer = setTimeout(() => setEntered(true), baseDelay + staggerDelay)
      return () => clearTimeout(timer)
    })
    return () => cancelAnimationFrame(raf)
  }, [sortOrder, animate])

  return (
    <div
      className={`absolute ${style || ""} rounded-lg px-3 py-2`}
      style={{
        left,
        top: `${y}%`,
        width,
        opacity: !mounted ? 0 : entered ? opacity : 0,
        transform: !mounted
          ? "translate(-50%, -50%) scale(0.5)"
          : entered
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.65)",
        filter: !mounted ? "blur(8px)" : entered ? "blur(0)" : "blur(6px)",
        transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1), filter 0.9s cubic-bezier(0.16,1,0.3,1)",
        pointerEvents: entered ? "auto" : "none",
        zIndex: 10,
      }}
    >
      {children}
    </div>
  )
}
