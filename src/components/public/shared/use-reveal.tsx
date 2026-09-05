"use client"

import React, { useRef, useEffect, useState, useSyncExternalStore } from "react"

interface RevealSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  stagger?: number
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

/**
 * The global reduced-motion block in globals.css only covers class-based
 * animations, so this inline-style reveal has to read the preference itself.
 * Subscribed rather than read in an effect, so it stays SSR-safe and also
 * follows the setting if it changes while the page is open.
 */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION)
      query.addEventListener("change", onChange)
      return () => query.removeEventListener("change", onChange)
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )
}

export function RevealSection({ children, className = "", delay = 0, stagger = 0.12 }: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const reduceMotion = usePrefersReducedMotion()
  const staggerMs = delay * stagger

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsInView(true)
          setHasAnimated(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasAnimated])

  return (
    <div
      ref={ref}
      className={className}
      style={
        reduceMotion
          ? { opacity: 1 }
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "translateY(0)" : "translateY(40px)",
              transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${staggerMs}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${staggerMs}s`,
            }
      }
    >
      {children}
    </div>
  )
}
