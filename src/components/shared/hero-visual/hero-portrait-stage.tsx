"use client"

import Image from "next/image"
import { ReactNode } from "react"

interface HeroPortraitStageProps {
  profileImage?: string | null
  displayName: string
  portraitScale?: string
  portraitX?: string
  portraitY?: string
  portraitFit?: string
  width?: string
  height?: string
  className?: string
  children?: ReactNode
}

export function HeroPortraitStage({
  profileImage,
  displayName,
  portraitScale,
  portraitX,
  portraitY,
  portraitFit,
  width = "380px",
  height = "500px",
  className = "",
  children,
}: HeroPortraitStageProps) {
  return (
    <div
      className={`relative overflow-visible ${className}`}
      style={{ width, height }}
    >
      {/* Portrait layer */}
      <div
        className="relative w-full h-full flex items-end justify-center"
        style={{
          transform: `translate(${portraitX || 0}%, ${portraitY || 0}%) scale(${portraitScale || 1})`,
        }}
      >
        {profileImage ? (
          <Image
            src={profileImage}
            alt={displayName}
            fill
            sizes="380px"
            className={`object-${portraitFit || "contain"} object-bottom`}
            priority
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
            <span className="text-sm font-medium">Professional Portrait</span>
          </div>
        )}
      </div>

      {/* Overlay layer */}
      {children}
    </div>
  )
}
