"use client"

import { Stethoscope, Heart, Activity, Award } from "lucide-react"

interface MedicalIconProps {
  icon: "stethoscope" | "heart" | "activity" | "award"
  className?: string
  animate?: boolean
}

export function MedicalIcon({ icon, className = "", animate = true }: MedicalIconProps) {
  const Icon = { stethoscope: Stethoscope, heart: Heart, activity: Activity, award: Award }[icon]

  return (
    <span className={`inline-flex ${animate ? "micro-pulse" : ""}`}>
      <Icon className={className} />
    </span>
  )
}
