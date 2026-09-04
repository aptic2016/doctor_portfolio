import React from "react"
import { Education, Experience } from "@prisma/client"
import { GraduationCap, Briefcase, MapPin } from "lucide-react"

interface TimelineItemProps {
  title: string
  subtitle: string
  date: string
  location?: string
  description?: string
  icon: React.ReactNode
}

function TimelineItem({ title, subtitle, date, location, description, icon }: TimelineItemProps) {
  return (
    <div className="relative pl-8 pb-12 last:pb-0">
      {/* Connector line */}
      <div className="absolute left-0 top-0 h-full w-px bg-border last:h-0" />

      {/* Icon point */}
      <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary z-10">
        {icon}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{date}</span>
          {location && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {location}
              </span>
            </>
          )}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-lg text-muted-foreground font-medium">{subtitle}</p>
        {description && (
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

export function EducationList({ data }: { data: Education[] }) {
  if (!data || data.length === 0) return null

  return (
    <div className="space-y-0">
      {data.map((edu, idx) => (
        <TimelineItem
          key={idx}
          title={edu.degree}
          subtitle={edu.institution}
          date={`${new Date(edu.startDate).getFullYear()} - ${edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}`}
          location={edu.department ?? undefined}
          description={edu.description ?? undefined}
          icon={<GraduationCap className="h-4 w-4" />}
        />
      ))}
    </div>
  )
}

export function ExperienceList({ data }: { data: Experience[] }) {
  if (!data || data.length === 0) return null

  return (
    <div className="space-y-0">
      {data.map((exp, idx) => (
        <TimelineItem
          key={idx}
          title={exp.jobTitle}
          subtitle={exp.organization}
          date={`${new Date(exp.startDate).getFullYear()} - ${exp.endDate ? new Date(exp.endDate).getFullYear() : "Present"}`}
          location={exp.location ?? undefined}
          description={exp.description ?? exp.responsibilities ?? undefined}
          icon={<Briefcase className="h-4 w-4" />}
        />
      ))}
    </div>
  )
}
