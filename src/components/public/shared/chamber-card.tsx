import { MapPin, Phone, Clock, Navigation } from "lucide-react"
import { DefaultChamberIcon } from "@/components/public/shared/default-chamber-icon"

interface ChamberLocation {
  id: string
  title: string
  hospitalName: string | null
  address: string | null
  visitingDays: string | null
  visitingHours: string | null
  appointmentPhone: string | null
  mapsUrl: string | null
  ctaLabel: string | null
  icon: string | null
  isPrimary: boolean
}

export function ChamberCard({ loc }: { loc: ChamberLocation }) {
  return (
    <div className="group p-6 rounded-2xl border border-border/50 bg-surface/50 hover:border-primary/20 hover:shadow-md transition-all flex flex-col h-full">
      {/* Header: icon + identity */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
          {loc.icon ? (
            <img src={loc.icon} alt="" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
          ) : (
            <DefaultChamberIcon className="w-10 h-10 sm:w-11 sm:h-11" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold uppercase tracking-wide text-foreground leading-tight">{loc.title}</h3>
          {loc.hospitalName && (
            <p className="text-base font-medium text-foreground/80 mt-0.5 leading-snug">{loc.hospitalName}</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-2.5">
        {loc.address && (
          <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary/50 mt-0.5 shrink-0" />
            <span>{loc.address}</span>
          </p>
        )}

        {loc.visitingDays && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary/50 mt-0.5 shrink-0" />
            <span>{loc.visitingDays}{loc.visitingHours ? `, ${loc.visitingHours}` : ""}</span>
          </div>
        )}

        {loc.appointmentPhone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-primary/50 shrink-0" />
            <a href={`tel:${loc.appointmentPhone}`} className="hover:text-primary transition-colors font-medium">{loc.appointmentPhone}</a>
          </div>
        )}
      </div>

      {/* CTA */}
      {loc.mapsUrl && (
        <div className="pt-3 mt-3 border-t border-border/30">
          <a href={loc.mapsUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            <Navigation className="h-4 w-4" /> {loc.ctaLabel || "View on Map"}
          </a>
        </div>
      )}
    </div>
  )
}
