"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  Palette,
  Home,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Database,
  ChevronRight,
  LayoutTemplate,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/shared/theme/theme-toggle"

const ADMIN_MENU = [
  {
    group: "General",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Profile", href: "/admin/profile", icon: User },
      { label: "Hero Editor", href: "/admin/hero-editor", icon: Home },
      { label: "Appearance", href: "/admin/appearance", icon: Palette },
      { label: "Home Page", href: "/admin/home", icon: Home },
      { label: "Footer", href: "/admin/footer", icon: LayoutTemplate },
    ]
  },
  {
    group: "Professional Content",
    items: [
      { label: "Education", href: "/admin/education", icon: GraduationCap },
      { label: "Experience", href: "/admin/experience", icon: Briefcase },
      { label: "Qualifications", href: "/admin/qualifications", icon: Award },
      { label: "Publications", href: "/admin/publications", icon: FileText },
      { label: "Achievements", href: "/admin/achievements", icon: Award },
    ]
  },
  {
    group: "Media & Content",
    items: [
      { label: "Media Library", href: "/admin/media", icon: ImageIcon },
      { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      { label: "Articles", href: "/admin/articles", icon: FileText },
      { label: "Messages", href: "/admin/messages", icon: MessageSquare },
    ]
  },
  {
    group: "System",
    items: [
      { label: "AI Assistant", href: "/admin/ai", icon: Search },
      { label: "SEO", href: "/admin/seo", icon: Settings },
      { label: "Site Settings", href: "/admin/settings", icon: Settings },
      { label: "Data & Backup", href: "/admin/data", icon: Database },
    ]
  }
]

function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const formatLabel = (segment: string) => {
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-hidden">
      {segments.map((segment, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/")
        const isLast = idx === segments.length - 1
        return (
          <React.Fragment key={href}>
            {idx > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
            {isLast ? (
              <span className="text-foreground font-medium truncate">{formatLabel(segment)}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors truncate">
                {formatLabel(segment)}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-background border-r transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-20",
          "-translate-x-full lg:translate-x-0",
          mobileOpen && "translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b shrink-0">
          <Link href="/admin" className={cn("flex items-center gap-3 overflow-hidden", !isSidebarOpen && "justify-center")}>
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            {isSidebarOpen && <span className="font-bold text-lg truncate">Admin</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {ADMIN_MENU.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {isSidebarOpen && (
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t shrink-0">
          <Button
            variant="ghost"
            className={cn("w-full gap-3 text-sm text-muted-foreground hover:text-destructive", !isSidebarOpen && "justify-center px-0")}
            render={<Link href="/admin/login" />}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden transition-all duration-300",
          isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
        )}
      >
        {/* Header */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileOpen(!mobileOpen)
                } else {
                  setIsSidebarOpen(!isSidebarOpen)
                }
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative h-9 w-9 hidden sm:flex">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-muted border flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
