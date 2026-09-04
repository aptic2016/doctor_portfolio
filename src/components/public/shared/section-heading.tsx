import React from "react"

interface SectionConfig {
  eyebrow?: string | null
  heading?: string | null
  sectionNumber?: string | null
  showSectionNumber?: boolean
  supportingText?: string | null
}

export function SectionHeading({ section, defaultEyebrow, defaultHeading }: { section?: SectionConfig; defaultEyebrow?: string; defaultHeading?: string }) {
  const eyebrow = section?.eyebrow || defaultEyebrow
  const heading = section?.heading || defaultHeading
  const showNumber = section?.showSectionNumber ?? true
  const number = section?.sectionNumber

  if (!eyebrow && !heading) return null

  return (
    <div className="flex items-start gap-4 mb-10">
      {showNumber && number && <div className="section-number mt-1.5">{number}</div>}
      <div className="space-y-1">
        {eyebrow && <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">{eyebrow}</p>}
        {heading && <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{heading}</h2>}
      </div>
    </div>
  )
}
