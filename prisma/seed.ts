import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com"
  const password = process.env.ADMIN_PASSWORD || "admin123"

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "OWNER",
      },
    })
    console.log(`Admin user created: ${email}`)
  } else {
    console.log(`Admin user already exists: ${email}`)
  }

  const existingProfile = await prisma.profile.findFirst()
  if (!existingProfile) {
    await prisma.profile.create({
      data: {
        fullName: "Portfolio Owner",
        displayName: "Owner",
        professionalTitle: "Professional",
      },
    })
    console.log("Default profile created")
  }

  const existingBrandSettings = await prisma.brandSettings.findFirst()
  if (!existingBrandSettings) {
    await prisma.brandSettings.create({
      data: {
        siteName: "My Portfolio",
      },
    })
    console.log("Default brand settings created")
  }

  const existingSiteSettings = await prisma.siteSettings.findFirst()
  if (!existingSiteSettings) {
    await prisma.siteSettings.create({
      data: {},
    })
    console.log("Default site settings created")
  }

  const existingThemeSettings = await prisma.themeSettings.findFirst()
  if (!existingThemeSettings) {
    await prisma.themeSettings.create({
      data: {},
    })
    console.log("Default theme settings created")
  }

  const existingHomeSections = await prisma.homeSection.count()
  if (existingHomeSections === 0) {
    const sections: { sectionId: "HERO" | "INTRO" | "POSITION" | "EXPERIENCE_HIGHLIGHTS" | "EDUCATION_HIGHLIGHTS" | "QUALIFICATIONS" | "EXPERTISE" | "ACHIEVEMENTS" | "PUBLICATIONS" | "GALLERY" | "ARTICLES" | "AI_CTA" | "CONTACT_CTA"; label: string; sortOrder: number }[] = [
      { sectionId: "HERO", label: "Hero", sortOrder: 0 },
      { sectionId: "INTRO", label: "Introduction", sortOrder: 1 },
      { sectionId: "EXPERIENCE_HIGHLIGHTS", label: "Experience", sortOrder: 2 },
      { sectionId: "EDUCATION_HIGHLIGHTS", label: "Education", sortOrder: 3 },
      { sectionId: "PUBLICATIONS", label: "Publications", sortOrder: 4 },
      { sectionId: "ACHIEVEMENTS", label: "Achievements", sortOrder: 5 },
      { sectionId: "CONTACT_CTA", label: "Contact CTA", sortOrder: 6 },
    ]
    await prisma.homeSection.createMany({ data: sections })
    console.log("Default home sections created")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
