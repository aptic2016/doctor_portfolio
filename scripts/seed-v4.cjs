/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  console.log("Seeding V4 fields...")

  // 1. SiteSettings: showLocalInfo default OFF
  await prisma.siteSettings.updateMany({ data: { showLocalInfo: false } })

  // 2. HighlightMetrics
  const metrics = [
    { key: "qualifications", label: "Credentials", icon: "Award", sortOrder: 0, valueMode: "AUTO" },
    { key: "experience", label: "Experience", icon: "Briefcase", sortOrder: 1, valueMode: "AUTO" },
    { key: "publications", label: "Publications", icon: "BookOpen", sortOrder: 2, valueMode: "AUTO" },
    { key: "achievements", label: "Awards", icon: "Trophy", sortOrder: 3, valueMode: "AUTO" },
    { key: "education", label: "Education", icon: "GraduationCap", sortOrder: 4, valueMode: "AUTO" },
  ]
  for (const m of metrics) {
    await prisma.highlightMetric.upsert({
      where: { key: m.key },
      update: {},
      create: m,
    })
  }

  // 3. NavigationItem: set desktopVisible, mobileVisible
  await prisma.navigationItem.updateMany({ data: { desktopVisible: true, mobileVisible: true } })

  // 4. HomeSection: add default eyebrow/heading/sectionNumber text
  const sectionDefaults = {
    HERO: { eyebrow: "", heading: "" },
    INTRO: { eyebrow: "Profile", heading: "More Than Credentials", sectionNumber: "01" },
    EXPERIENCE_HIGHLIGHTS: { eyebrow: "Career", heading: "Professional Journey", sectionNumber: "02" },
    EDUCATION_HIGHLIGHTS: { eyebrow: "Academic", heading: "Education", sectionNumber: "03" },
    QUALIFICATIONS: { eyebrow: "Credentials", heading: "Qualifications", sectionNumber: "04" },
    PUBLICATIONS: { eyebrow: "Research", heading: "Publications", sectionNumber: "05" },
    ACHIEVEMENTS: { eyebrow: "Recognition", heading: "Achievements", sectionNumber: "06" },
    ARTICLES: { eyebrow: "Journal", heading: "Latest Articles", sectionNumber: "07" },
    GALLERY: { eyebrow: "Moments", heading: "Gallery", sectionNumber: "08" },
    AI_CTA: { eyebrow: "Digital Assistant", heading: "AI Insight", sectionNumber: "09" },
    CONTACT_CTA: { eyebrow: "Connect", heading: "Get in Touch", sectionNumber: "10" },
  }
  for (const [sectionId, defaults] of Object.entries(sectionDefaults)) {
    await prisma.homeSection.upsert({
      where: { sectionId },
      update: {
        eyebrow: defaults.eyebrow,
        heading: defaults.heading,
        sectionNumber: defaults.sectionNumber,
        showSectionNumber: sectionId !== "HERO",
      },
      create: {
        sectionId,
        label: defaults.eyebrow,
        eyebrow: defaults.eyebrow,
        heading: defaults.heading,
        sectionNumber: defaults.sectionNumber,
        showSectionNumber: sectionId !== "HERO",
        sortOrder: Object.keys(sectionDefaults).indexOf(sectionId),
      },
    })
  }

  // 5. BrandSettings: hero/footer defaults
  await prisma.brandSettings.updateMany({
    data: {
      heroBadgeText: "Currently Practicing",
      heroShowBadge: true,
      heroPrimaryCtaLabel: "Profile",
      heroPrimaryCtaDest: "/about",
      heroSecondaryCtaLabel: "Connect",
      heroSecondaryCtaDest: "/contact",
      heroShowCvCta: false,
      heroCvCtaLabel: "View CV",
      heroShowWorkplace: true,
      heroShowLocation: true,
      heroShowQualifications: true,
      heroShowInterests: false,
      footerNavTitle: "Navigation",
      footerContactTitle: "Connect",
      baseFontSize: "16px",
      navFontSize: "14px",
      headingScale: "1.25",
      typographyPreset: "balanced",
    },
  })

  console.log("V4 seed complete.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
