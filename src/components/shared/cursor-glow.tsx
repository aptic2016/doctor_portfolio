"use client"

import { useEffect, useRef, useCallback } from "react"

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>(undefined)

  const handleMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`
        glowRef.current.style.top = `${e.clientY}px`
        glowRef.current.style.opacity = "1"
      }
    })

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (glowRef.current) {
        glowRef.current.style.opacity = "0"
      }
    }, 1000)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)")
    if (!mq.matches) return

    document.addEventListener("mousemove", handleMove, { passive: true })
    return () => {
      document.removeEventListener("mousemove", handleMove)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [handleMove])

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
}
