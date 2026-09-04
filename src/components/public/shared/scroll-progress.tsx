"use client"

import React, { useEffect, useRef } from "react"

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function update() {
      if (!bar.current) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      bar.current.style.transform = `scaleY(${progress})`
    }
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
      <div ref={bar} className="h-full bg-gradient-to-r from-primary via-accent to-primary origin-top" style={{ transform: "scaleY(0)" }} />
    </div>
  )
}
