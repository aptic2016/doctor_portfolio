"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ChevronUp, ChevronDown } from "lucide-react"
import { updateHighlightMetricAdmin, moveHighlightMetric } from "../settings/actions"

interface Metric {
  id: string
  key: string
  label: string
  icon: string | null
  isVisible: boolean
  sortOrder: number
  valueMode: string
  manualValue: string | null
}

export function HighlightsAdmin({ initialMetrics }: { initialMetrics: Metric[] }) {
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics)

  const handleUpdate = async (id: string, data: Partial<Metric>) => {
    try {
      await updateHighlightMetricAdmin(id, data)
      setMetrics(metrics.map((m) => m.id === id ? { ...m, ...data } : m))
      toast.success("Updated")
    } catch { toast.error("Failed to update") }
  }

  const handleMove = async (id: string, direction: "up" | "down") => {
    try {
      await moveHighlightMetric(id, direction)
      const sorted = [...metrics].sort((a, b) => a.sortOrder - b.sortOrder)
      const idx = sorted.findIndex((m) => m.id === id)
      const targetIdx = direction === "up" ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= sorted.length) return
      const temp = sorted[idx].sortOrder
      sorted[idx] = { ...sorted[idx], sortOrder: sorted[targetIdx].sortOrder }
      sorted[targetIdx] = { ...sorted[targetIdx], sortOrder: temp }
      setMetrics(sorted)
    } catch { toast.error("Failed to move") }
  }

  const sorted = [...metrics].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Highlights / Metrics</h1>
        <p className="text-sm text-muted-foreground">Configure which metrics appear in the highlights strip, their labels, and values.</p>
      </div>

      <div className="space-y-2">
        {sorted.map((metric, idx) => (
          <div key={metric.id} className={`flex items-center gap-3 p-3 rounded-lg border ${metric.isVisible ? "bg-surface/50 border-border/50" : "bg-muted/20 border-border/30 opacity-60"}`}>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleMove(metric.id, "up")} disabled={idx === 0}><ChevronUp className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleMove(metric.id, "down")} disabled={idx === sorted.length - 1}><ChevronDown className="h-4 w-4" /></Button>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground w-24 shrink-0">{metric.key}</span>
            <Input value={metric.label} onChange={(e) => handleUpdate(metric.id, { label: e.target.value })} className="h-8 text-xs max-w-[140px]" />
            <select value={metric.valueMode} onChange={(e) => handleUpdate(metric.id, { valueMode: e.target.value })} className="h-8 text-xs rounded-md border bg-background px-2">
              <option value="AUTO">Auto Count</option>
              <option value="MANUAL">Manual</option>
            </select>
            {metric.valueMode === "MANUAL" && (
              <Input value={metric.manualValue || ""} onChange={(e) => handleUpdate(metric.id, { manualValue: e.target.value })} placeholder="e.g. 12+" className="h-8 text-xs max-w-[100px]" />
            )}
            <button onClick={() => handleUpdate(metric.id, { isVisible: !metric.isVisible })} className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-colors shrink-0 ${metric.isVisible ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>{metric.isVisible ? "ON" : "OFF"}</button>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No metrics configured.</p>}
      </div>
    </div>
  )
}
