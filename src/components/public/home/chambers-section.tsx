import React from "react"
import { prisma } from "@/lib/db"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"
import { ChamberCard } from "@/components/public/shared/chamber-card"

interface Location {
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
  sortOrder: number
  isVisible: boolean
}

export async function ChambersSection() {
  let locations: Location[] = []
  let headingConfig: { eyebrow?: string | null; heading?: string | null; supportingText?: string | null } | null = null
  try {
    ;[locations, headingConfig] = await Promise.all([
      prisma.footerLocation.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
      }) as Promise<Location[]>,
      prisma.footerSetting.findFirst().then((s) => s ? { eyebrow: s.chamberSectionEyebrow, heading: s.chamberSectionHeading, supportingText: s.chamberSectionSupport } : null),
    ])
  } catch {
    return null
  }

  if (locations.length === 0) return null

  return (
    <section className="py-14 md:py-18 lg:py-20 section-feature section-glow">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <SectionHeading
              section={headingConfig ? { eyebrow: headingConfig.eyebrow, heading: headingConfig.heading } : undefined}
              defaultEyebrow="Locations"
              defaultHeading="Chambers & Appointments"
            />
            {headingConfig?.supportingText && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl -mt-6 mb-10">{headingConfig.supportingText}</p>
            )}
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {locations.map((loc) => (
                <ChamberCard key={loc.id} loc={loc} />
              ))}
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  )
}
