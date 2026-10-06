"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useSyncExternalStore } from "react"
import { BrandSettings, ThemeSettings } from "@prisma/client"

interface ThemeContextType {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  mounted: false,
})

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyBrandSettings(brandSettings: BrandSettings, root: HTMLElement) {
  if (brandSettings.baseFont) {
    root.style.setProperty("--font-sans", brandSettings.baseFont)
  }
  if (brandSettings.headingFont) {
    root.style.setProperty("--font-heading", brandSettings.headingFont)
  }
  if (brandSettings.borderRadiusCard) {
    root.style.setProperty("--radius", brandSettings.borderRadiusCard)
  }
  // Typography tokens
  if (brandSettings.baseFontSize) {
    root.style.setProperty("--text-base", brandSettings.baseFontSize)
  }
}

export function ThemeProvider({
  children,
  brandSettings,
  themeSettings,
}: {
  children: React.ReactNode
  brandSettings?: BrandSettings
  themeSettings?: ThemeSettings
}) {
  const [theme, setThemeState] = useState<"light" | "dark" | "system">(() => {
    if (typeof window === "undefined") return "system"
    const saved = localStorage.getItem("theme-preference") as "light" | "dark" | "system" | null
    if (saved) return saved
    if (themeSettings?.currentTheme) return themeSettings.currentTheme.toLowerCase() as "light" | "dark" | "system"
    return "system"
  })
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    const effectiveTheme = theme === "system" ? getSystemTheme() : theme

    root.classList.remove("light", "dark")
    root.classList.add(effectiveTheme)

    if (brandSettings) {
      applyBrandSettings(brandSettings, root)
    }
  }, [theme, brandSettings, mounted])

  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") {
        const root = document.documentElement
        const effectiveTheme = getSystemTheme()
        root.classList.remove("light", "dark")
        root.classList.add(effectiveTheme)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, mounted])

  const setTheme = useCallback((newTheme: "light" | "dark" | "system") => {
    setThemeState(newTheme)
    localStorage.setItem("theme-preference", newTheme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
