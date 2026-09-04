import React from "react"
import { Qualification, Certification } from "@prisma/client"
import { CheckCircle2, Award } from "lucide-react"

interface CredentialCardProps {
  title: string
  institution: string
  date: string
  description?: string
  url?: string
  icon: React.ReactNode
}

function CredentialCard({ title, institution, date, description, url, icon }: CredentialCardProps) {
  return (
    <div className="group relative p-6 bg-background border rounded-xl shadow-sm transition-all hover:shadow-md hover:border-primary/50">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="space-y-2 flex-grow">
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm font-medium text-muted-foreground">{institution}</p>
          <p className="text-xs text-muted-foreground/70">{date}</p>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              {description}
            </p>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-medium text-primary hover:underline pt-2"
            >
              Verify Credential →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function QualificationsList({ data }: { data: Qualification[] }) {
  if (!data || data.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((q, idx) => (
        <CredentialCard
          key={idx}
          title={q.title}
          institution={q.issuingOrganization || q.institution || "Verified Institution"}
          date={q.issueDate ? new Date(q.issueDate).getFullYear().toString() : "N/A"}
          description={q.description ?? undefined}
          url={q.credentialUrl ?? undefined}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      ))}
    </div>
  )
}

export function CertificationsList({ data }: { data: Certification[] }) {
  if (!data || data.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((c, idx) => (
        <CredentialCard
          key={idx}
          title={c.title}
          institution={c.issuingOrganization || c.institution || "Certified Provider"}
          date={c.issueDate ? new Date(c.issueDate).getFullYear().toString() : "N/A"}
          description={c.description ?? undefined}
          url={c.credentialUrl ?? undefined}
          icon={<Award className="h-5 w-5" />}
        />
      ))}
    </div>
  )
}
