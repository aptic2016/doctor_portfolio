"use client"

interface EcgLineProps {
  className?: string
  animate?: boolean
}

export function EcgLine({ className = "", animate = true }: EcgLineProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 20 H80 L90 8 L100 32 L110 5 L120 35 L130 10 L140 28 L150 20 H400"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? "ecg-draw" : ""}
      />
    </svg>
  )
}
