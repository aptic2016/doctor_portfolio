import { Metadata } from "next"
import { Profile, Publication } from "@prisma/client"
import { contentService } from "@/services/content/content.service"
import { profileService } from "@/services/profile/profile.service"
import { Calendar, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "Publications",
  description: "Research publications and academic contributions",
}

export default async function PublicationsPage() {
  let profile: Profile | null = null
  let publications: Publication[] = []
  try {
    profile = await profileService.getPublicProfile()
    publications = profile
      ? await contentService.getVisiblePublications(profile.id)
      : []
  } catch {
    profile = null
    publications = []
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Research</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Publications</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Peer-reviewed publications and academic contributions
          </p>
        </div>

        {publications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No publications to display.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {publications.map((pub) => (
              <div key={pub.id} className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{pub.title}</h2>
                  <p className="text-sm text-muted-foreground">{pub.authors}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {pub.journal && <span className="font-medium text-primary">{pub.journal}</span>}
                    {pub.conference && <span className="font-medium text-primary">{pub.conference}</span>}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(pub.publicationDate).getFullYear()}
                    </span>
                  </div>
                  {pub.abstract && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{pub.abstract}</p>
                  )}
                  <div className="flex items-center gap-3">
                    {pub.doi && (
                      <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        DOI <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {pub.externalUrl && (
                      <a href={pub.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        View Publication <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
