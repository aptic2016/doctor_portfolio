import { Certification, Profile, Qualification } from "@prisma/client"
import { profileService } from "@/services/profile/profile.service"
import { contentService } from "@/services/content/content.service"
import { Award } from "lucide-react"

export default async function QualificationsPage() {
  let profile: Profile | null = null
  let qualifications: Qualification[] = []
  let certifications: Certification[] = []
  try {
    profile = await profileService.getPublicProfile()
    if (profile) {
      qualifications = await contentService.getQualifications(profile.id)
      certifications = await contentService.getCertifications(profile.id)
    }
  } catch {
    profile = null
    qualifications = []
    certifications = []
  }

  if (!profile) return <div>Profile not found</div>

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Credentials</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Qualifications & Certifications</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional credentials and certified expertise in cardiology
          </p>
        </div>

        <div className="space-y-16">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Core Qualifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qualifications.map((q) => (
                <div key={q.id} className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 shrink-0 mt-0.5">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{q.title}</h3>
                      <p className="text-sm font-medium text-primary">{q.issuingOrganization || q.institution}</p>
                      {q.credential && <p className="text-xs text-muted-foreground font-mono">{q.credential}</p>}
                      {q.issueDate && (
                        <p className="text-xs text-muted-foreground">
                          Issued: {new Date(q.issueDate).getFullYear()}
                          {q.expiryDate && ` · Expires: ${new Date(q.expiryDate).getFullYear()}`}
                        </p>
                      )}
                      {q.description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{q.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {qualifications.length === 0 && <p className="text-center text-muted-foreground py-10">No core qualifications listed.</p>}
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((c) => (
                <div key={c.id} className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 shrink-0 mt-0.5">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{c.title}</h3>
                      <p className="text-sm font-medium text-primary">{c.issuingOrganization || c.institution}</p>
                      {c.issueDate && (
                        <p className="text-xs text-muted-foreground">
                          Issued: {new Date(c.issueDate).getFullYear()}
                          {c.expiryDate && ` · Expires: ${new Date(c.expiryDate).getFullYear()}`}
                        </p>
                      )}
                      {c.description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{c.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {certifications.length === 0 && <p className="text-center text-muted-foreground py-10">No certifications listed.</p>}
          </section>
        </div>
      </div>
    </div>
  )
}
