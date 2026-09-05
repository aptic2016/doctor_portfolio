import { settingsService } from "@/services/settings/settings.service"
import { Hero } from "@/components/public/home/hero"
import { IntroSection } from "@/components/public/home/intro-section"
import { ExperiencePreview } from "@/components/public/home/experience-preview"
import { EducationPreview } from "@/components/public/home/education-preview"
import { QualificationsPreview } from "@/components/public/home/qualifications-preview"
import { PublicationsPreview } from "@/components/public/home/publications-preview"
import { AchievementsPreview } from "@/components/public/home/achievements-preview"
import { ArticlesPreview } from "@/components/public/home/articles-preview"
import { GalleryPreview } from "@/components/public/home/gallery-preview"
import { ContactSection } from "@/components/public/home/contact-section"
import { ChambersSection } from "@/components/public/home/chambers-section"
import { SpotlightSection } from "@/components/public/home/spotlight-section"
import type { HomeSectionConfig } from "@/components/public/home/visuals/section-visual"

export default async function HomePage() {
  let sections: (HomeSectionConfig & { sectionId: string; isVisible: boolean; sortOrder: number })[] = []
  let spotlightSetting = null
  let spotlightImages: { id: string; mediaUrl: string | null; altText: string | null; caption: string | null; isVisible: boolean; isLocked: boolean; sortOrder: number; rotation: number; sizeVariant: string; frameWidth: string; frameHeight: string; offsetX: string; offsetY: string; xPercent: number; yPercent: number; widthPercent: number; heightPercent: number; zIndex: number; framePreset: string; shadowPreset: string; mobileXPercent: number | null; mobileYPercent: number | null; mobileWidthPercent: number | null; mobileHeightPercent: number | null; mobileRotation: number | null }[] = []

  try {
    sections = await settingsService.getVisibleHomeSections()
    ;[spotlightSetting, spotlightImages] = await Promise.all([
      settingsService.getSpotlightSetting(),
      settingsService.getSpotlightImages(),
    ])
  } catch {
    sections = []
  }

  return (
    <div className="flex flex-col">
      {sections.map((section) => {
        if (section.sectionId === "PROFESSIONAL_SPOTLIGHT") {
          if (!spotlightSetting) return null
          return <SpotlightSection key={section.sectionId} setting={spotlightSetting} images={spotlightImages} />
        }
        if (section.sectionId === "HERO") return <Hero key={section.sectionId} />
        if (section.sectionId === "INTRO") return <IntroSection key={section.sectionId} section={section} />
        if (section.sectionId === "EXPERIENCE_HIGHLIGHTS") return <ExperiencePreview key={section.sectionId} section={section} />
        if (section.sectionId === "EDUCATION_HIGHLIGHTS") return <EducationPreview key={section.sectionId} section={section} />
        if (section.sectionId === "QUALIFICATIONS") return <QualificationsPreview key={section.sectionId} section={section} />
        if (section.sectionId === "PUBLICATIONS") return <PublicationsPreview key={section.sectionId} section={section} />
        if (section.sectionId === "ACHIEVEMENTS") return <AchievementsPreview key={section.sectionId} section={section} />
        if (section.sectionId === "ARTICLES") return <ArticlesPreview key={section.sectionId} section={section} />
        if (section.sectionId === "GALLERY") return <GalleryPreview key={section.sectionId} section={section} />
        if (section.sectionId === "CONTACT_CTA") return <ContactSection key={section.sectionId} section={section} />
        return null
      })}
      <ChambersSection key="CHAMBERS" />
    </div>
  )
}
