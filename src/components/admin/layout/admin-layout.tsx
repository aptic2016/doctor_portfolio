"use client"

import React, { useState, useMemo } from "react"
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
  BookOpen,
  BookMarked,
  Trophy,
  Newspaper,
  GalleryHorizontalEnd,
  Mail,
  Brain,
  Globe,
  Navigation,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/shared/theme/theme-toggle"

const ADMIN_MENU = [
  {
    group: "General",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, keywords: ["home", "overview", "stats"] },
      { label: "Profile", href: "/admin/profile", icon: User, keywords: ["doctor", "name", "identity", "bio"] },
    ]
  },
  {
    group: "Website Pages",
    items: [
      { label: "Home", href: "/admin/home", icon: Home, keywords: ["homepage", "sections", "hero", "spotlight"] },
      { label: "About", href: "/admin/about", icon: BookOpen, keywords: ["about", "biography", "portrait", "image"] },
      { label: "Experience", href: "/admin/experience", icon: Briefcase, keywords: ["work", "career", "job"] },
      { label: "Education", href: "/admin/education", icon: GraduationCap, keywords: ["degree", "university", "scholar"] },
      { label: "Qualifications", href: "/admin/qualifications", icon: Award, keywords: ["certification", "credential", "fcps"] },
      { label: "Publications", href: "/admin/publications", icon: BookMarked, keywords: ["paper", "journal", "research"] },
      { label: "Achievements", href: "/admin/achievements", icon: Trophy, keywords: ["award", "honor", "distinction"] },
      { label: "Articles", href: "/admin/articles", icon: Newspaper, keywords: ["blog", "post", "write"] },
      { label: "Gallery", href: "/admin/gallery", icon: GalleryHorizontalEnd, keywords: ["photo", "picture", "lightbox"] },
      { label: "Contact", href: "/admin/contact", icon: Mail, keywords: ["location", "chamber", "map", "form"] },
    ]
  },
  {
    group: "Site Design",
    items: [
      { label: "Navigation", href: "/admin/navigation", icon: Navigation, keywords: ["navbar", "menu", "header"] },
      { label: "Footer", href: "/admin/footer", icon: LayoutTemplate, keywords: ["bottom", "copyright", "social"] },
      { label: "Appearance", href: "/admin/appearance", icon: Palette, keywords: ["theme", "color", "font", "style"] },
    ]
  },
  {
    group: "Communication",
    items: [
      { label: "AI Assistant", href: "/admin/ai", icon: Brain, keywords: ["chat", "groq", "ai", "bot"] },
      { label: "Messages", href: "/admin/messages", icon: MessageSquare, keywords: ["contact", "submission", "inquiry"] },
    ]
  },
  {
    group: "Media",
    items: [
      { label: "Media Library", href: "/admin/media", icon: ImageIcon, keywords: ["upload", "cloudinary", "image"] },
    ]
  },
  {
    group: "System",
    items: [
      { label: "SEO", href: "/admin/seo", icon: Globe, keywords: ["meta", "og", "search engine"] },
      { label: "Site Settings", href: "/admin/settings", icon: Settings, keywords: ["global", "config", "feature"] },
      { label: "Data & Backup", href: "/admin/data", icon: Database, keywords: ["export", "import", "backup", "restore"] },
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

function NavSearch({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  const [query, setQuery] = useState("")

  const allItems = useMemo(() => {
    return ADMIN_MENU.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        group: group.group,
      }))
    )
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
    )
  }, [query, allItems])

  if (!isSidebarOpen) return null

  return (
    <div className="relative px-3 mb-2">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find a page..."
        className="h-8 pl-8 text-xs bg-muted/50 border-0 focus-visible:ring-1"
      />
      {filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
          {filtered.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setQuery("")}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.group}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
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

        {/* Search */}
        <NavSearch isSidebarOpen={isSidebarOpen} />

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
                const isActive = item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/")
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
          <Link
            href="/admin/login"
            className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-muted transition-colors w-full", !isSidebarOpen && "justify-center px-0")}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </Link>
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
