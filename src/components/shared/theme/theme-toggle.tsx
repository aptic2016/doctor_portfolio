"use client"

import { useTheme } from "@/components/shared/theme/theme-provider"
import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ]

  return (
    <div className={cn("flex items-center gap-1 rounded-lg border bg-muted p-1", className)}>
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(opt.value)}
          className={cn(
            "h-8 w-8 p-0 rounded-md transition-all",
            theme === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={opt.label}
        >
          <opt.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}
