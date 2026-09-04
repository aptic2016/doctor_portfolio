"use client"

import React, { useState, useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

function useCurrentTime(timezone?: string | null) {
  const [timeStr, setTimeStr] = useState("--:--")
  const [period, setPeriod] = useState("")
  const [day, setDay] = useState("")
  const [dateNum, setDateNum] = useState("")
  const [month, setMonth] = useState("")
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    function update() {
      if (!mounted.current) return
      const now = new Date()
      const tz = timezone || "UTC"
      const opts: Intl.DateTimeFormatOptions = { timeZone: tz }
      const time = now.toLocaleTimeString("en-US", { ...opts, hour: "2-digit", minute: "2-digit", hour12: true })
      const [hm, p] = time.split(" ")
      setTimeStr(hm)
      setPeriod(p)
      setDay(now.toLocaleDateString("en-US", { ...opts, weekday: "short" }).toUpperCase())
      setDateNum(now.toLocaleDateString("en-US", { ...opts, day: "2-digit" }))
      setMonth(now.toLocaleDateString("en-US", { ...opts, month: "short" }).toUpperCase())
    }
    update()
    const interval = setInterval(update, 30000)
    return () => { mounted.current = false; clearInterval(interval) }
  }, [timezone])

  return { time: timeStr, period, day, date: dateNum, month }
}

export function VerticalTimeRail({ timezone, location }: { timezone?: string | null; location?: string | null }) {
  const { time, period, date, month } = useCurrentTime(timezone)
  const locationParts = location?.split(",") || []

  return (
    <div className="hidden xl:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-0 py-5 px-2.5 rounded-xl border border-border/40 bg-surface/60 backdrop-blur-xl">
      {/* Live indicator */}
      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mb-3 animate-pulse" />

      {/* Time */}
      <div className="text-center mb-3">
        <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-primary/50 mb-0.5">Local</div>
        <div className="text-xs font-bold tabular-nums text-foreground leading-tight">{time}</div>
        <div className="text-[9px] font-bold text-primary/60 uppercase">{period}</div>
      </div>

      <div className="w-5 h-px bg-border/60 mb-3" />

      {/* Date */}
      <div className="text-center mb-3">
        <div className="text-[18px] font-bold text-foreground leading-none">{date}</div>
        <div className="text-[9px] font-bold tracking-[0.1em] text-muted-foreground mt-0.5">{month}</div>
      </div>

      <div className="w-5 h-px bg-border/60 mb-3" />

      {/* Location */}
      {location && (
        <div className="text-center">
          <MapPin className="h-2.5 w-2.5 text-primary/50 mx-auto mb-0.5" />
          {locationParts.slice(0, 2).map((part, i) => (
            <div key={i} className="text-[8px] font-bold tracking-[0.08em] uppercase text-muted-foreground leading-tight">{part.trim()}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export function MobileInfoBar({ timezone, location }: { timezone?: string | null; location?: string | null }) {
  const { time, period, day, date, month } = useCurrentTime(timezone)

  return (
    <div className="xl:hidden flex items-center justify-center gap-3 py-1.5 px-4 bg-surface/80 border-b border-border/30 text-[10px] font-medium text-muted-foreground overflow-hidden whitespace-nowrap text-ellipsis">
      <span className="inline-flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-green-500" /><span className="font-bold text-foreground tabular-nums">{time} {period}</span></span>
      <span className="text-border">·</span>
      <span>{day} {date} {month}</span>
      {location && (
        <>
          <span className="text-border">·</span>
          <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{location.split(",")[0]}</span>
        </>
      )}
    </div>
  )
}
