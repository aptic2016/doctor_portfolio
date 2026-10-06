"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Sun, Moon, Monitor, Home, User, Briefcase, Award, BookOpen, GraduationCap, Mail, ArrowRight } from "lucide-react"
import { useTheme } from "@/components/shared/theme/theme-provider"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, User, Briefcase, Award, BookOpen, GraduationCap, Mail, ArrowRight,
}

interface NavItem {
  label: string
  destination: string
  isVisible: boolean
  isExternal: boolean
  desktopVisible: boolean
  mobileVisible: boolean
}

export function MobileBottomDock({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname()
  const { theme, setTheme, mounted } = useTheme()
  const [moreOpen, setMoreOpen] = useState(false)
  const visibleItems = navItems.filter((i) => i.isVisible && i.mobileVisible)
  const dockItems = visibleItems.slice(0, 4)
  const moreItems = visibleItems.slice(4)

  return (
    <>
      {/* Bottom Dock */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/40 safe-area-bottom">
        <nav className="flex items-center justify-around h-14 px-2">
          {dockItems.map((item, idx) => {
            const isActive = pathname === item.destination || (item.destination !== "/" && pathname.startsWith(item.destination))
            const Icon = ICON_MAP[item.label] || ArrowRight
            return (
              <Link
                key={idx}
                href={item.destination}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-16 h-full rounded-lg transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </Link>
            )
          })}
          {moreItems.length > 0 && (
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full rounded-lg text-muted-foreground"
            >
              {moreOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
              <span className="text-[10px] font-medium leading-tight">More</span>
            </button>
          )}
        </nav>
      </div>

      {/* More Panel */}
      <div className={cn(
        "lg:hidden fixed inset-0 z-[55] transition-all duration-300",
        moreOpen ? "visible" : "invisible"
      )}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
        <div className={cn(
          "absolute bottom-14 left-0 right-0 bg-background border-t border-border shadow-2xl transition-transform duration-300 ease-out max-h-[60vh] overflow-y-auto",
          moreOpen ? "translate-y-0" : "translate-y-full"
        )}>
          <div className="p-3 space-y-1">
            {moreItems.map((item, idx) => {
              const isActive = pathname === item.destination
              return (
                <Link
                  key={idx}
                  href={item.destination}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setMoreOpen(false)}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              )
            })}
            <div className="flex gap-2 pt-2 border-t border-border/50">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg border transition-colors capitalize",
                    mounted && theme === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {t === "light" && <Sun className="h-3.5 w-3.5" />}
                  {t === "dark" && <Moon className="h-3.5 w-3.5" />}
                  {t === "system" && <Monitor className="h-3.5 w-3.5" />}
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
