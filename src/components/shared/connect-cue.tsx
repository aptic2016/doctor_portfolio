"use client"

import { useEffect, useRef, useState } from "react"

interface ConnectCueProps {
  style?: string
}

export function ConnectCue({ style = "hand-tap" }: ConnectCueProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)

  useEffect(() => {
    if (hasPlayed || style === "none") return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          setVisible(true)
          setHasPlayed(true)
          setTimeout(() => setVisible(false), 4000)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasPlayed, style])

  if (style === "none") return null

  return (
    <div ref={ref} className="inline-flex items-center gap-1" aria-hidden="true" style={{ minHeight: 16 }}>
      {visible && style === "hand-tap" && (
        <svg
          className="connect-cue h-4 w-4 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8.5V8a1 1 0 0 0-2 0v5a.5.5 0 0 1-.5.5H14m0-4v4m0-4v4m0-4l-2-2m2 2l2-2" />
          <path d="M14 4h2a2 2 0 0 1 2 2v6a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V8a2 2 0 0 1 2-2h2" />
        </svg>
      )}
      {visible && style === "mail-pulse" && (
        <span className="relative flex h-3 w-3">
          <span className="pulse-ring absolute inline-flex h-full w-full rounded-full opacity-75" />
          <svg
            className="relative h-3 w-3 text-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </span>
      )}
    </div>
  )
}
