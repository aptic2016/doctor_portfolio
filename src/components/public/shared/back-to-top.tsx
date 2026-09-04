"use client"

import React, { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollUp = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, 0)
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollUp}
      aria-label="Back to top"
      className="fixed bottom-36 lg:bottom-20 right-6 z-50 w-10 h-10 rounded-full bg-surface border border-border/50 shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-lg transition-all duration-300"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}
