"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth/auth"
import { revalidatePath } from "next/cache"
import { DEMO_DATA } from "@/lib/demo-data"
import { Prisma, HomeSectionId } from "@prisma/client"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

export async function loadDemoData() {
  await requireAdmin()

  try {
    await prisma.$transaction(async (tx) => {
      // Clear existing data (except User)
      await tx.aiMessage.deleteMany()
      await tx.aiConversation.deleteMany()
      await tx.aiKnowledgeItem.deleteMany()
      await tx.faq.deleteMany()
      await tx.articleCategory.deleteMany()
      await tx.articleTag.deleteMany()
      await tx.article.deleteMany()
      await tx.galleryItem.deleteMany()
      await tx.galleryCategory.deleteMany()
      await tx.contactMessage.deleteMany()
      await tx.socialLink.deleteMany()
      await tx.navigationItem.deleteMany()
      await tx.achievement.deleteMany()
      await tx.publication.deleteMany()
      await tx.professionalInterest.deleteMany()
      await tx.certification.deleteMany()
      await tx.qualification.deleteMany()
      await tx.experience.deleteMany()
      await tx.education.deleteMany()
      await tx.mediaAsset.deleteMany()
      await tx.cvDocument.deleteMany()
      await tx.homeSection.deleteMany()
      await tx.heroOverlay.deleteMany()
      await tx.seoSettings.deleteMany()
      await tx.aiSettings.deleteMany()
      await tx.siteSettings.deleteMany()
      await tx.themeSettings.deleteMany()
      await tx.brandSettings.deleteMany()
      await tx.profile.deleteMany()

      // Create Profile
      await tx.profile.create({
        data: {
          ...DEMO_DATA.profile,
          education: { create: DEMO_DATA.education },
          experience: { create: DEMO_DATA.experience },
          qualifications: { create: DEMO_DATA.qualifications },
          publications: { create: DEMO_DATA.publications.map(p => ({ ...p, slug: p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })) },
          achievements: { create: DEMO_DATA.achievements },
        },
      })

      // Create Articles with categories and tags
      for (const articleData of DEMO_DATA.articles) {
        const article = await tx.article.create({
          data: {
            title: articleData.title,
            slug: articleData.slug,
            excerpt: articleData.excerpt,
            content: articleData.content,
            isDraft: articleData.isDraft,
            isPublished: articleData.isPublished,
            isFeatured: articleData.isFeatured,
            publishDate: new Date(articleData.publishDate),
            seoTitle: articleData.seoTitle,
            seoDescription: articleData.seoDescription,
            sortOrder: articleData.sortOrder,
          },
        })

        // Create categories if they don't exist
        const categoryNames = ["Cardiology", "Clinical Practice", "Medical Research"]
        for (const name of categoryNames) {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          const category = await tx.articleCategory.upsert({
            where: { slug },
            create: { name, slug },
            update: {},
          })
          await tx.article.update({
            where: { id: article.id },
            data: { categories: { connect: { id: category.id } } },
          })
        }

        // Create tags
        const tagNames = ["Cardiology", "Interventional", "TAVR", "Prevention", "Cardiac Imaging"]
        for (const name of tagNames) {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          const tag = await tx.articleTag.upsert({
            where: { slug },
            create: { name, slug },
            update: {},
          })
          await tx.article.update({
            where: { id: article.id },
            data: { tags: { connect: { id: tag.id } } },
          })
        }
      }

      // Create FAQs
      for (const faqData of DEMO_DATA.faqs) {
        await tx.faq.create({
          data: {
            question: faqData.question,
            answer: faqData.answer,
            category: faqData.category,
            isVisible: faqData.isVisible,
            allowAI: faqData.allowAI,
            sortOrder: faqData.sortOrder,
          },
        })
      }

      // Create Settings
      await tx.brandSettings.create({ data: DEMO_DATA.brandSettings })
      await tx.themeSettings.create({ data: DEMO_DATA.themeSettings })
      await tx.siteSettings.create({ data: DEMO_DATA.siteSettings })
      await tx.seoSettings.create({ data: DEMO_DATA.seoSettings })
      await tx.aiSettings.create({
        data: {
          enabled: DEMO_DATA.aiSettings.enabled,
          assistantName: DEMO_DATA.aiSettings.assistantName,
          welcomeMessage: DEMO_DATA.aiSettings.welcomeMessage,
          systemInstruction: DEMO_DATA.aiSettings.systemInstruction,
          temperature: DEMO_DATA.aiSettings.temperature,
          maxTokens: DEMO_DATA.aiSettings.maxTokens,
          rateLimit: DEMO_DATA.aiSettings.rateLimit,
        },
      })

      // Create Home Sections
      for (const section of DEMO_DATA.homeSections) {
        await tx.homeSection.create({ data: section })
      }

      // Create Navigation Items
      for (const nav of DEMO_DATA.navigationItems) {
        await tx.navigationItem.create({ data: nav })
      }

      // Create Social Links
      if (DEMO_DATA.socialLinks) {
        for (const social of DEMO_DATA.socialLinks) {
          await tx.socialLink.create({ data: social })
        }
      }

      // Create Highlight Metrics
      if (DEMO_DATA.highlightMetrics) {
        for (const metric of DEMO_DATA.highlightMetrics) {
          await tx.highlightMetric.upsert({
            where: { key: metric.key },
            update: {},
            create: metric,
          })
        }
      }

      // Create Hero Overlays
      if (DEMO_DATA.heroOverlays) {
        for (const overlay of DEMO_DATA.heroOverlays) {
          await tx.heroOverlay.upsert({
            where: { key: overlay.key },
            update: {},
            create: overlay,
          })
        }
      }
    })

    revalidatePath("/")
    revalidatePath("/about")
    revalidatePath("/articles")
    revalidatePath("/gallery")
    revalidatePath("/contact")
    revalidatePath("/admin")

    return { success: true, message: "Demo data loaded successfully" }
  } catch (error) {
    console.error("Failed to load demo data:", error)
    return { success: false, error: "Failed to load demo data. Please try again." }
  }
}

export async function exportData() {
  await requireAdmin()

  try {
    const profile = await prisma.profile.findFirst({
      include: {
        education: { orderBy: { sortOrder: "asc" } },
        experience: { orderBy: { sortOrder: "asc" } },
        qualifications: { orderBy: { sortOrder: "asc" } },
        publications: { orderBy: { sortOrder: "asc" } },
        achievements: { orderBy: { sortOrder: "asc" } },
      },
    })

    const articles = await prisma.article.findMany({
      include: { categories: true, tags: true },
      orderBy: { sortOrder: "asc" },
    })

    const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: "asc" } })
    const brandSettings = await prisma.brandSettings.findFirst()
    const themeSettings = await prisma.themeSettings.findFirst()
    const siteSettings = await prisma.siteSettings.findFirst()
    const seoSettings = await prisma.seoSettings.findFirst()
    const aiSettings = await prisma.aiSettings.findFirst()
    const homeSections = await prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } })
    const navigationItems = await prisma.navigationItem.findMany({ orderBy: { sortOrder: "asc" } })
    const highlightMetrics = await prisma.highlightMetric.findMany({ orderBy: { sortOrder: "asc" } })
    const heroOverlays = await prisma.heroOverlay.findMany({ orderBy: { sortOrder: "asc" } })

    const exportPayload = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      source: "portfolio-admin",
      profile: profile
        ? {
            fullName: profile.fullName,
            displayName: profile.displayName,
            professionalTitle: profile.professionalTitle,
            tagline: profile.tagline,
            shortBio: profile.shortBio,
            fullBio: profile.fullBio,
            currentDesignation: profile.currentDesignation,
            currentOrganization: profile.currentOrganization,
            location: profile.location,
            phone: profile.phone,
            email: profile.email,
            website: profile.website,
            careerObjective: profile.careerObjective,
            philosophy: profile.philosophy,
            quote: profile.quote,
            profileImage: profile.profileImage,
            coverImage: profile.coverImage,
            isVisible: profile.isVisible,
            allowAI: profile.allowAI,
          }
        : null,
      education: profile?.education.map((e) => ({
        degree: e.degree,
        institution: e.institution,
        department: e.department,
        field: e.field,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate?.toISOString() ?? null,
        result: e.result,
        description: e.description,
        institutionUrl: e.institutionUrl,
        institutionLogo: e.institutionLogo,
        certificateUrl: e.certificateUrl,
        isVisible: e.isVisible,
        isFeatured: e.isFeatured,
        sortOrder: e.sortOrder,
      })) ?? [],
      experience: profile?.experience.map((e) => ({
        jobTitle: e.jobTitle,
        organization: e.organization,
        location: e.location,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate?.toISOString() ?? null,
        isCurrent: e.isCurrent,
        description: e.description,
        responsibilities: e.responsibilities,
        achievements: e.achievements,
        organizationUrl: e.organizationUrl,
        logo: e.logo,
        isVisible: e.isVisible,
        isFeatured: e.isFeatured,
        sortOrder: e.sortOrder,
      })) ?? [],
      qualifications: profile?.qualifications.map((q) => ({
        title: q.title,
        institution: q.institution,
        issuingOrganization: q.issuingOrganization,
        credential: q.credential,
        issueDate: q.issueDate.toISOString(),
        expiryDate: q.expiryDate?.toISOString() ?? null,
        description: q.description,
        credentialUrl: q.credentialUrl,
        certificateImage: q.certificateImage,
        isVisible: q.isVisible,
        isFeatured: q.isFeatured,
        sortOrder: q.sortOrder,
      })) ?? [],
      publications: profile?.publications.map((p) => ({
        title: p.title,
        slug: p.slug,
        authors: p.authors,
        journal: p.journal,
        conference: p.conference,
        publisher: p.publisher,
        publicationDate: p.publicationDate.toISOString(),
        abstract: p.abstract,
        doi: p.doi,
        citation: p.citation,
        externalUrl: p.externalUrl,
        pdfUrl: p.pdfUrl,
        coverImage: p.coverImage,
        isVisible: p.isVisible,
        isFeatured: p.isFeatured,
        isPublished: p.isPublished,
        sortOrder: p.sortOrder,
      })) ?? [],
      achievements: profile?.achievements.map((a) => ({
        title: a.title,
        awardingOrganization: a.awardingOrganization,
        date: a.date.toISOString(),
        description: a.description,
        image: a.image,
        certificateUrl: a.certificateUrl,
        externalUrl: a.externalUrl,
        isVisible: a.isVisible,
        isFeatured: a.isFeatured,
        sortOrder: a.sortOrder,
      })) ?? [],
      articles: articles.map((a) => ({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        coverImage: a.coverImage,
        readingTime: a.readingTime,
        isDraft: a.isDraft,
        isPublished: a.isPublished,
        isFeatured: a.isFeatured,
        publishDate: a.publishDate.toISOString(),
        seoTitle: a.seoTitle,
        seoDescription: a.seoDescription,
        canonicalUrl: a.canonicalUrl,
        ogImage: a.ogImage,
        sortOrder: a.sortOrder,
        categories: a.categories.map((c) => c.name),
        tags: a.tags.map((t) => t.name),
      })),
      faqs: faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
        category: f.category,
        isVisible: f.isVisible,
        allowAI: f.allowAI,
        sortOrder: f.sortOrder,
      })),
      brandSettings,
      themeSettings,
      siteSettings,
      seoSettings,
      aiSettings: aiSettings
        ? {
            enabled: aiSettings.enabled,
            assistantName: aiSettings.assistantName,
            assistantAvatar: aiSettings.assistantAvatar,
            welcomeMessage: aiSettings.welcomeMessage,
            systemInstruction: aiSettings.systemInstruction,
            temperature: aiSettings.temperature,
            maxTokens: aiSettings.maxTokens,
            rateLimit: aiSettings.rateLimit,
          }
        : null,
      homeSections: homeSections.map((s) => ({
        sectionId: s.sectionId,
        label: s.label,
        isVisible: s.isVisible,
        sortOrder: s.sortOrder,
        layoutVariant: s.layoutVariant,
        eyebrow: s.eyebrow,
        heading: s.heading,
        supportingText: s.supportingText,
        sectionNumber: s.sectionNumber,
        showSectionNumber: s.showSectionNumber,
      })),
      navigationItems: navigationItems.map((n) => ({
        label: n.label,
        destination: n.destination,
        isVisible: n.isVisible,
        isExternal: n.isExternal,
        sortOrder: n.sortOrder,
        desktopVisible: n.desktopVisible,
        mobileVisible: n.mobileVisible,
      })),
      highlightMetrics: highlightMetrics.map((m) => ({
        key: m.key,
        label: m.label,
        icon: m.icon,
        isVisible: m.isVisible,
        sortOrder: m.sortOrder,
        valueMode: m.valueMode,
        manualValue: m.manualValue,
      })),
      heroOverlays: heroOverlays.map((o) => ({
        key: o.key,
        label: o.label,
        valueType: o.valueType,
        customValue: o.customValue,
        valueSource: o.valueSource,
        isVisible: o.isVisible,
        desktopVisible: o.desktopVisible,
        mobileVisible: o.mobileVisible,
        desktopX: o.desktopX,
        desktopY: o.desktopY,
        mobileX: o.mobileX,
        mobileY: o.mobileY,
        width: o.width,
        alignment: o.alignment,
        opacity: o.opacity,
        styleVariant: o.styleVariant,
        sortOrder: o.sortOrder,
      })),
    }

    return { success: true, data: exportPayload }
  } catch (error) {
    console.error("Failed to export data:", error)
    return { success: false, error: "Failed to export data." }
  }
}

export async function importData(jsonData: string) {
  await requireAdmin()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(jsonData)
  } catch {
    return { success: false, error: "Invalid JSON format." }
  }

  if (!parsed || typeof parsed !== "object") {
    return { success: false, error: "Invalid data format. Expected a JSON object." }
  }

  if (!parsed.version || !parsed.profile) {
    return { success: false, error: "Missing required fields: version and profile." }
  }

  try {
    const data = parsed as Record<string, unknown>

    await prisma.$transaction(async (tx) => {
      // Clear existing data
      await tx.aiMessage.deleteMany()
      await tx.aiConversation.deleteMany()
      await tx.aiKnowledgeItem.deleteMany()
      await tx.faq.deleteMany()
      await tx.articleCategory.deleteMany()
      await tx.articleTag.deleteMany()
      await tx.article.deleteMany()
      await tx.galleryItem.deleteMany()
      await tx.galleryCategory.deleteMany()
      await tx.contactMessage.deleteMany()
      await tx.socialLink.deleteMany()
      await tx.navigationItem.deleteMany()
      await tx.achievement.deleteMany()
      await tx.publication.deleteMany()
      await tx.professionalInterest.deleteMany()
      await tx.certification.deleteMany()
      await tx.qualification.deleteMany()
      await tx.experience.deleteMany()
      await tx.education.deleteMany()
      await tx.mediaAsset.deleteMany()
      await tx.cvDocument.deleteMany()
      await tx.homeSection.deleteMany()
      await tx.heroOverlay.deleteMany()
      await tx.seoSettings.deleteMany()
      await tx.aiSettings.deleteMany()
      await tx.siteSettings.deleteMany()
      await tx.themeSettings.deleteMany()
      await tx.brandSettings.deleteMany()
      await tx.profile.deleteMany()

      // Create Profile
      const p = data.profile as Record<string, unknown>
      const profile = await tx.profile.create({
        data: {
          fullName: p.fullName as string,
          displayName: p.displayName as string,
          professionalTitle: p.professionalTitle as string,
          tagline: (p.tagline as string) ?? null,
          shortBio: (p.shortBio as string) ?? null,
          fullBio: (p.fullBio as string) ?? null,
          currentDesignation: (p.currentDesignation as string) ?? null,
          currentOrganization: (p.currentOrganization as string) ?? null,
          location: (p.location as string) ?? null,
          phone: (p.phone as string) ?? null,
          email: (p.email as string) ?? null,
          website: (p.website as string) ?? null,
          careerObjective: (p.careerObjective as string) ?? null,
          philosophy: (p.philosophy as string) ?? null,
          quote: (p.quote as string) ?? null,
          profileImage: (p.profileImage as string) ?? null,
          coverImage: (p.coverImage as string) ?? null,
          isVisible: (p.isVisible as boolean) ?? true,
          allowAI: (p.allowAI as boolean) ?? true,
        },
      })

      // Education
      const edu = (data.education as Array<Record<string, unknown>>) ?? []
      for (const e of edu) {
        await tx.education.create({
          data: {
            degree: e.degree as string,
            institution: e.institution as string,
            department: (e.department as string) ?? null,
            field: (e.field as string) ?? null,
            startDate: new Date(e.startDate as string),
            endDate: e.endDate ? new Date(e.endDate as string) : null,
            result: (e.result as string) ?? null,
            description: (e.description as string) ?? null,
            institutionUrl: (e.institutionUrl as string) ?? null,
            institutionLogo: (e.institutionLogo as string) ?? null,
            certificateUrl: (e.certificateUrl as string) ?? null,
            isVisible: (e.isVisible as boolean) ?? true,
            isFeatured: (e.isFeatured as boolean) ?? false,
            sortOrder: (e.sortOrder as number) ?? 0,
            profileId: profile.id,
          },
        })
      }

      // Experience
      const exp = (data.experience as Array<Record<string, unknown>>) ?? []
      for (const e of exp) {
        await tx.experience.create({
          data: {
            jobTitle: e.jobTitle as string,
            organization: e.organization as string,
            location: (e.location as string) ?? null,
            startDate: new Date(e.startDate as string),
            endDate: e.endDate ? new Date(e.endDate as string) : null,
            isCurrent: (e.isCurrent as boolean) ?? false,
            description: (e.description as string) ?? null,
            responsibilities: (e.responsibilities as string) ?? null,
            achievements: (e.achievements as string) ?? null,
            organizationUrl: (e.organizationUrl as string) ?? null,
            logo: (e.logo as string) ?? null,
            isVisible: (e.isVisible as boolean) ?? true,
            isFeatured: (e.isFeatured as boolean) ?? false,
            sortOrder: (e.sortOrder as number) ?? 0,
            profileId: profile.id,
          },
        })
      }

      // Qualifications
      const quals = (data.qualifications as Array<Record<string, unknown>>) ?? []
      for (const q of quals) {
        await tx.qualification.create({
          data: {
            title: q.title as string,
            institution: (q.institution as string) ?? null,
            issuingOrganization: (q.issuingOrganization as string) ?? null,
            credential: (q.credential as string) ?? null,
            issueDate: new Date(q.issueDate as string),
            expiryDate: q.expiryDate ? new Date(q.expiryDate as string) : null,
            description: (q.description as string) ?? null,
            credentialUrl: (q.credentialUrl as string) ?? null,
            certificateImage: (q.certificateImage as string) ?? null,
            isVisible: (q.isVisible as boolean) ?? true,
            isFeatured: (q.isFeatured as boolean) ?? false,
            sortOrder: (q.sortOrder as number) ?? 0,
            profileId: profile.id,
          },
        })
      }

      // Publications
      const pubs = (data.publications as Array<Record<string, unknown>>) ?? []
      for (const pub of pubs) {
        await tx.publication.create({
          data: {
            title: pub.title as string,
            slug: (pub.slug as string) || (pub.title as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            authors: pub.authors as string,
            journal: (pub.journal as string) ?? null,
            conference: (pub.conference as string) ?? null,
            publisher: (pub.publisher as string) ?? null,
            publicationDate: new Date(pub.publicationDate as string),
            abstract: (pub.abstract as string) ?? null,
            doi: (pub.doi as string) ?? null,
            citation: (pub.citation as string) ?? null,
            externalUrl: (pub.externalUrl as string) ?? null,
            pdfUrl: (pub.pdfUrl as string) ?? null,
            coverImage: (pub.coverImage as string) ?? null,
            isVisible: (pub.isVisible as boolean) ?? true,
            isFeatured: (pub.isFeatured as boolean) ?? false,
            isPublished: (pub.isPublished as boolean) ?? true,
            sortOrder: (pub.sortOrder as number) ?? 0,
            profileId: profile.id,
          },
        })
      }

      // Achievements
      const achs = (data.achievements as Array<Record<string, unknown>>) ?? []
      for (const a of achs) {
        await tx.achievement.create({
          data: {
            title: a.title as string,
            awardingOrganization: (a.awardingOrganization as string) ?? null,
            date: new Date(a.date as string),
            description: (a.description as string) ?? null,
            image: (a.image as string) ?? null,
            certificateUrl: (a.certificateUrl as string) ?? null,
            externalUrl: (a.externalUrl as string) ?? null,
            isVisible: (a.isVisible as boolean) ?? true,
            isFeatured: (a.isFeatured as boolean) ?? false,
            sortOrder: (a.sortOrder as number) ?? 0,
            profileId: profile.id,
          },
        })
      }

      // Articles
      const arts = (data.articles as Array<Record<string, unknown>>) ?? []
      for (const art of arts) {
        const article = await tx.article.create({
          data: {
            title: art.title as string,
            slug: art.slug as string,
            excerpt: (art.excerpt as string) ?? null,
            content: art.content as string,
            coverImage: (art.coverImage as string) ?? null,
            readingTime: (art.readingTime as number) ?? null,
            isDraft: (art.isDraft as boolean) ?? true,
            isPublished: (art.isPublished as boolean) ?? false,
            isFeatured: (art.isFeatured as boolean) ?? false,
            publishDate: art.publishDate ? new Date(art.publishDate as string) : new Date(),
            seoTitle: (art.seoTitle as string) ?? null,
            seoDescription: (art.seoDescription as string) ?? null,
            canonicalUrl: (art.canonicalUrl as string) ?? null,
            ogImage: (art.ogImage as string) ?? null,
            sortOrder: (art.sortOrder as number) ?? 0,
          },
        })

        // Categories
        const catNames = (art.categories as string[]) ?? []
        for (const name of catNames) {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          const category = await tx.articleCategory.upsert({
            where: { slug },
            create: { name, slug },
            update: {},
          })
          await tx.article.update({
            where: { id: article.id },
            data: { categories: { connect: { id: category.id } } },
          })
        }

        // Tags
        const tagNames = (art.tags as string[]) ?? []
        for (const name of tagNames) {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          const tag = await tx.articleTag.upsert({
            where: { slug },
            create: { name, slug },
            update: {},
          })
          await tx.article.update({
            where: { id: article.id },
            data: { tags: { connect: { id: tag.id } } },
          })
        }
      }

      // FAQs
      const faqData = (data.faqs as Array<Record<string, unknown>>) ?? []
      for (const f of faqData) {
        await tx.faq.create({
          data: {
            question: f.question as string,
            answer: f.answer as string,
            category: (f.category as string) ?? null,
            isVisible: (f.isVisible as boolean) ?? true,
            allowAI: (f.allowAI as boolean) ?? true,
            sortOrder: (f.sortOrder as number) ?? 0,
          },
        })
      }

      // Settings
      if (data.brandSettings) {
        const bsData = data.brandSettings as Prisma.BrandSettingsCreateInput
        const existing = await tx.brandSettings.findFirst()
        if (existing) {
          await tx.brandSettings.update({ where: { id: existing.id }, data: bsData })
        } else {
          await tx.brandSettings.create({ data: bsData })
        }
      }

      if (data.themeSettings) {
        const tsData = data.themeSettings as Prisma.ThemeSettingsCreateInput
        const existing = await tx.themeSettings.findFirst()
        if (existing) {
          await tx.themeSettings.update({ where: { id: existing.id }, data: tsData })
        } else {
          await tx.themeSettings.create({ data: tsData })
        }
      }

      if (data.siteSettings) {
        const ssData = data.siteSettings as Prisma.SiteSettingsCreateInput
        const existing = await tx.siteSettings.findFirst()
        if (existing) {
          await tx.siteSettings.update({ where: { id: existing.id }, data: ssData })
        } else {
          await tx.siteSettings.create({ data: ssData })
        }
      }

      if (data.seoSettings) {
        const seoData = data.seoSettings as Prisma.SeoSettingsCreateInput
        const existing = await tx.seoSettings.findFirst()
        if (existing) {
          await tx.seoSettings.update({ where: { id: existing.id }, data: seoData })
        } else {
          await tx.seoSettings.create({ data: seoData })
        }
      }

      if (data.aiSettings) {
        const ai = data.aiSettings as Record<string, unknown>
        const existing = await tx.aiSettings.findFirst()
        if (existing) {
          await tx.aiSettings.update({
            where: { id: existing.id },
            data: {
              enabled: ai.enabled as boolean,
              assistantName: ai.assistantName as string,
              assistantAvatar: (ai.assistantAvatar as string) ?? null,
              welcomeMessage: (ai.welcomeMessage as string) ?? null,
              systemInstruction: (ai.systemInstruction as string) ?? null,
              temperature: ai.temperature as number,
              maxTokens: ai.maxTokens as number,
              rateLimit: ai.rateLimit as number,
            },
          })
        } else {
          await tx.aiSettings.create({
            data: {
              enabled: ai.enabled as boolean,
              assistantName: ai.assistantName as string,
              assistantAvatar: (ai.assistantAvatar as string) ?? null,
              welcomeMessage: (ai.welcomeMessage as string) ?? null,
              systemInstruction: (ai.systemInstruction as string) ?? null,
              temperature: ai.temperature as number,
              maxTokens: ai.maxTokens as number,
              rateLimit: ai.rateLimit as number,
            },
          })
        }
      }

      // Home Sections
      const sections = (data.homeSections as Array<Record<string, unknown>>) ?? []
      for (const s of sections) {
        await tx.homeSection.create({
          data: {
            sectionId: s.sectionId as HomeSectionId,
            label: (s.label as string) ?? null,
            isVisible: (s.isVisible as boolean) ?? true,
            sortOrder: (s.sortOrder as number) ?? 0,
            layoutVariant: (s.layoutVariant as string) ?? null,
          },
        })
      }

      // Navigation Items
      const navs = (data.navigationItems as Array<Record<string, unknown>>) ?? []
      for (const n of navs) {
        await tx.navigationItem.create({
          data: {
            label: n.label as string,
            destination: n.destination as string,
            isVisible: (n.isVisible as boolean) ?? true,
            isExternal: (n.isExternal as boolean) ?? false,
            sortOrder: (n.sortOrder as number) ?? 0,
          },
        })
      }

      // Hero Overlays
      const heroOverlaysData = (data.heroOverlays as Array<Record<string, unknown>>) ?? []
      for (const o of heroOverlaysData) {
        await tx.heroOverlay.upsert({
          where: { key: o.key as string },
          update: {
            label: o.label as string,
            valueType: o.valueType as string,
            customValue: (o.customValue as string) ?? null,
            valueSource: (o.valueSource as string) ?? null,
            isVisible: (o.isVisible as boolean) ?? true,
            desktopVisible: (o.desktopVisible as boolean) ?? true,
            mobileVisible: (o.mobileVisible as boolean) ?? true,
            desktopX: o.desktopX as number,
            desktopY: o.desktopY as number,
            mobileX: o.mobileX as number,
            mobileY: o.mobileY as number,
            width: (o.width as string) ?? "160px",
            alignment: (o.alignment as string) ?? "left",
            opacity: (o.opacity as number) ?? 1,
            styleVariant: (o.styleVariant as string) ?? "glass",
            sortOrder: (o.sortOrder as number) ?? 0,
          },
          create: {
            key: o.key as string,
            label: o.label as string,
            valueType: o.valueType as string,
            customValue: (o.customValue as string) ?? null,
            valueSource: (o.valueSource as string) ?? null,
            isVisible: (o.isVisible as boolean) ?? true,
            desktopVisible: (o.desktopVisible as boolean) ?? true,
            mobileVisible: (o.mobileVisible as boolean) ?? true,
            desktopX: o.desktopX as number,
            desktopY: o.desktopY as number,
            mobileX: o.mobileX as number,
            mobileY: o.mobileY as number,
            width: (o.width as string) ?? "160px",
            alignment: (o.alignment as string) ?? "left",
            opacity: (o.opacity as number) ?? 1,
            styleVariant: (o.styleVariant as string) ?? "glass",
            sortOrder: (o.sortOrder as number) ?? 0,
          },
        })
      }
    })

    revalidatePath("/")
    revalidatePath("/about")
    revalidatePath("/articles")
    revalidatePath("/gallery")
    revalidatePath("/contact")
    revalidatePath("/admin")

    return { success: true, message: "Data imported successfully" }
  } catch (error) {
    console.error("Failed to import data:", error)
    return { success: false, error: `Failed to import data: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

export async function getDataStats() {
  await requireAdmin()

  try {
    const [profileCount, educationCount, experienceCount, publicationCount, achievementCount, articleCount, faqCount] =
      await Promise.all([
        prisma.profile.count(),
        prisma.education.count(),
        prisma.experience.count(),
        prisma.publication.count(),
        prisma.achievement.count(),
        prisma.article.count(),
        prisma.faq.count(),
      ])

    return {
      success: true,
      stats: {
        profile: profileCount,
        education: educationCount,
        experience: experienceCount,
        publications: publicationCount,
        achievements: achievementCount,
        articles: articleCount,
        faqs: faqCount,
      },
    }
  } catch {
    return { success: false, error: "Failed to fetch data stats." }
  }
}

export async function clearAllData() {
  await requireAdmin()

  try {
    await prisma.$transaction(async (tx) => {
      await tx.aiMessage.deleteMany()
      await tx.aiConversation.deleteMany()
      await tx.aiKnowledgeItem.deleteMany()
      await tx.faq.deleteMany()
      await tx.articleCategory.deleteMany()
      await tx.articleTag.deleteMany()
      await tx.article.deleteMany()
      await tx.galleryItem.deleteMany()
      await tx.galleryCategory.deleteMany()
      await tx.contactMessage.deleteMany()
      await tx.socialLink.deleteMany()
      await tx.navigationItem.deleteMany()
      await tx.achievement.deleteMany()
      await tx.publication.deleteMany()
      await tx.professionalInterest.deleteMany()
      await tx.certification.deleteMany()
      await tx.qualification.deleteMany()
      await tx.experience.deleteMany()
      await tx.education.deleteMany()
      await tx.mediaAsset.deleteMany()
      await tx.cvDocument.deleteMany()
      await tx.homeSection.deleteMany()
      await tx.heroOverlay.deleteMany()
      await tx.seoSettings.deleteMany()
      await tx.aiSettings.deleteMany()
      await tx.siteSettings.deleteMany()
      await tx.themeSettings.deleteMany()
      await tx.brandSettings.deleteMany()
      await tx.profile.deleteMany()
    })

    revalidatePath("/")
    revalidatePath("/about")
    revalidatePath("/articles")
    revalidatePath("/gallery")
    revalidatePath("/contact")
    revalidatePath("/admin")

    return { success: true, message: "All data cleared successfully" }
  } catch {
    return { success: false, error: "Failed to clear data." }
  }
}
