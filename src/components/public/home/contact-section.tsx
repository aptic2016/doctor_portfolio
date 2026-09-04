import React from "react"
import Link from "next/link"
import { profileService } from "@/services/profile/profile.service"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"

export async function ContactSection({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean } }) {
  let profile = null
  try { profile = await profileService.getPublicProfile() } catch { return null }
  if (!profile) return null

  return (
    <section className="py-14 md:py-18 lg:py-20 section-elevated">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <SectionHeading section={section} defaultEyebrow="Connect" defaultHeading="Get in Touch" />
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="group p-5 rounded-xl border border-border/50 bg-surface/50 hover:border-primary/20 hover:shadow-sm transition-all text-center">
                  <div className="inline-flex p-3 rounded-xl bg-primary/5 border border-primary/10 mb-3"><Mail className="h-5 w-5 text-primary" /></div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-xs text-primary font-medium">{profile.email}</p>
                </a>
              )}
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="group p-5 rounded-xl border border-border/50 bg-surface/50 hover:border-primary/20 hover:shadow-sm transition-all text-center">
                  <div className="inline-flex p-3 rounded-xl bg-primary/5 border border-primary/10 mb-3"><Phone className="h-5 w-5 text-primary" /></div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Phone</h3>
                  <p className="text-xs text-primary font-medium">{profile.phone}</p>
                </a>
              )}
              {profile.location && (
                <div className="group p-5 rounded-xl border border-border/50 bg-surface/50 hover:border-primary/20 hover:shadow-sm transition-all text-center">
                  <div className="inline-flex p-3 rounded-xl bg-primary/5 border border-primary/10 mb-3"><MapPin className="h-5 w-5 text-primary" /></div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Location</h3>
                  <p className="text-xs text-primary font-medium">{profile.location}</p>
                </div>
              )}
            </div>
          </RevealSection>
          <RevealSection>
            <div className="mt-6 text-center">
              <Button size="lg" className="h-10 px-5 text-sm rounded-lg" render={<Link href="/contact" />}>
                Contact Page <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  )
}
