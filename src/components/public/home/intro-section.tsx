import React from "react"
import { profileService } from "@/services/profile/profile.service"
import { Heart, BookOpen, Users, Quote } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"

export async function IntroSection({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean; supportingText?: string | null } }) {
  let profile = null
  try { profile = await profileService.getPublicProfile() } catch { return null }
  if (!profile?.shortBio && !profile?.philosophy) return null

  return (
    <section className="py-14 md:py-18 lg:py-20 relative section-surface">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              <div className="lg:col-span-8 space-y-6">
                <SectionHeading section={section} defaultEyebrow="Profile" defaultHeading="More Than Credentials" />
                <div className="pl-4 sm:pl-10 lg:pl-12 space-y-5">
                  {profile.shortBio && (
                    <p className="text-base text-muted-foreground leading-relaxed">{profile.shortBio}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-border/50 bg-surface/50 text-center">
                      <Heart className="h-4 w-4 text-primary mx-auto mb-1.5" />
                      <div className="text-xs font-semibold text-muted-foreground">Patient Care</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border/50 bg-surface/50 text-center">
                      <BookOpen className="h-4 w-4 text-primary mx-auto mb-1.5" />
                      <div className="text-xs font-semibold text-muted-foreground">Research</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border/50 bg-surface/50 text-center">
                      <Users className="h-4 w-4 text-primary mx-auto mb-1.5" />
                      <div className="text-xs font-semibold text-muted-foreground">Education</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4">
                {profile.philosophy && (
                  <div className="relative p-6 rounded-xl border border-border/50 bg-surface/50 overflow-hidden">
                    <Quote className="absolute top-3 right-3 h-8 w-8 text-primary/10" />
                    <div className="relative space-y-3">
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">Philosophy</p>
                      <p className="text-base italic text-foreground leading-relaxed">
                        &ldquo;{profile.philosophy}&rdquo;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  )
}
