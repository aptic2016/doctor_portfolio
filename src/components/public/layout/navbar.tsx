"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, Stethoscope, Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/shared/theme/theme-provider"
import { ConnectCue } from "@/components/shared/connect-cue"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  destination: string
  isVisible: boolean
  isExternal: boolean
  desktopVisible: boolean
  mobileVisible: boolean
}

export function Navbar({ navItems, brandLogo, siteName }: {
  navItems: NavItem[]
  brandLogo?: string
  siteName: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const visibleItems = navItems.filter((i) => i.isVisible)
  const desktopItems = visibleItems.filter((i) => i.desktopVisible)
  const mobileItems = visibleItems.filter((i) => i.mobileVisible)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/40 shadow-[0_1px_20px_-4px_rgba(0,0,0,0.08)]">
        <div className="container mx-auto flex items-center justify-between h-16 px-5 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            {brandLogo ? (
              <Image src={brandLogo} alt={siteName} width={28} height={28} className="object-contain rounded-lg" />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Stethoscope className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="font-bold text-sm sm:text-base tracking-tight leading-tight truncate">{siteName}</div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-tight">Medical Professional</div>
            </div>
          </Link>

          {/* Desktop Nav Capsule */}
          <nav className="hidden lg:flex items-center">
            <div className="nav-capsule rounded-full px-1.5 py-1 flex items-center gap-0.5">
              {desktopItems.map((item, idx) => {
                const isActive = pathname === item.destination || (item.destination !== "/" && pathname.startsWith(item.destination))
                return (
                  <Link
                    key={idx}
                    href={item.destination}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    className={cn(
                      "relative px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-300",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-primary rounded-full shadow-sm" />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Right */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="relative">
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full border bg-surface/50 hover:bg-muted transition-colors"
                title="Theme"
              >
                {theme === "light" && <Sun className="h-3.5 w-3.5" />}
                {theme === "dark" && <Moon className="h-3.5 w-3.5" />}
                {theme === "system" && <Monitor className="h-3.5 w-3.5" />}
              </button>
              {themeOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-36 bg-surface border rounded-xl shadow-xl py-1 z-50">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setTheme(opt.value); setThemeOpen(false) }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors",
                          theme === opt.value ? "text-foreground bg-muted font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <opt.icon className="h-3.5 w-3.5" />
                        {opt.label}
                        {theme === opt.value && <span className="ml-auto text-primary text-[10px]">&#x25CF;</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="relative flex items-center">
              <ConnectCue />
              <Button size="sm" className="h-8 px-3.5 text-sm rounded-full" render={<Link href="/contact" />}>
                Connect
              </Button>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Sheet */}
      <div className={cn(
        "fixed inset-0 z-[55] lg:hidden transition-all duration-500",
        isOpen ? "visible" : "invisible"
      )}>
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsOpen(false)}
        />
        {/* Panel */}
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-background border-l border-border shadow-2xl transition-transform duration-500 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">{siteName}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-lg hover:bg-muted inline-flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {mobileItems.map((item, idx) => {
              const isActive = pathname === item.destination
              return (
                <Link
                  key={idx}
                  href={item.destination}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border/50 space-y-3">
            <div className="flex gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border transition-colors",
                    theme === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <opt.icon className="h-3.5 w-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
            <Button className="w-full rounded-xl" render={<Link href="/contact" onClick={() => setIsOpen(false)} />}>
              Connect
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
