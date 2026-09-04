import { prisma } from "@/lib/db"
import { KnowledgeSource } from "@prisma/client"

interface KnowledgeItem {
  content: string
  sourceType: KnowledgeSource
  allowAI: boolean
}

export class KnowledgeService {
  async getAIElibleKnowledge(): Promise<KnowledgeItem[]> {
    const items = await prisma.aiKnowledgeItem.findMany({
      where: { isVisible: true, allowAI: true },
    })
    return items.map((item) => ({
      content: item.content,
      sourceType: item.sourceType,
      allowAI: item.allowAI,
    }))
  }

  async buildKnowledgeContext(): Promise<string> {
    const profile = await prisma.profile.findFirst()
    if (!profile || !profile.allowAI) return ""

    const sections: string[] = []

    if (profile.fullName) {
      sections.push(`Name: ${profile.fullName}`)
    }
    if (profile.displayName) {
      sections.push(`Display Name: ${profile.displayName}`)
    }
    if (profile.professionalTitle) {
      sections.push(`Professional Title: ${profile.professionalTitle}`)
    }
    if (profile.shortBio) {
      sections.push(`Bio: ${profile.shortBio}`)
    }
    if (profile.fullBio) {
      sections.push(`Full Bio: ${profile.fullBio}`)
    }
    if (profile.currentDesignation) {
      sections.push(`Current Position: ${profile.currentDesignation}`)
    }
    if (profile.currentOrganization) {
      sections.push(`Current Organization: ${profile.currentOrganization}`)
    }
    if (profile.location) {
      sections.push(`Location: ${profile.location}`)
    }
    if (profile.careerObjective) {
      sections.push(`Career Objective: ${profile.careerObjective}`)
    }
    if (profile.philosophy) {
      sections.push(`Philosophy: ${profile.philosophy}`)
    }

    const education = await prisma.education.findMany({
      where: { profileId: profile.id, isVisible: true },
      orderBy: { startDate: "desc" },
    })
    if (education.length > 0) {
      const eduList = education.map(
        (e) =>
          `${e.degree}${e.field ? ` in ${e.field}` : ""} from ${e.institution}${
            e.endDate ? ` (${new Date(e.startDate).getFullYear()}-${new Date(e.endDate).getFullYear()})` : ""
          }`
      )
      sections.push(`Education: ${eduList.join("; ")}`)
    }

    const experience = await prisma.experience.findMany({
      where: { profileId: profile.id, isVisible: true },
      orderBy: { startDate: "desc" },
    })
    if (experience.length > 0) {
      const expList = experience.map(
        (e) =>
          `${e.jobTitle} at ${e.organization}${
            e.isCurrent
              ? " (current)"
              : e.endDate
              ? ` (${new Date(e.startDate).getFullYear()}-${new Date(e.endDate).getFullYear()})`
              : ""
          }`
      )
      sections.push(`Experience: ${expList.join("; ")}`)
    }

    const qualifications = await prisma.qualification.findMany({
      where: { profileId: profile.id, isVisible: true },
      orderBy: { issueDate: "desc" },
    })
    if (qualifications.length > 0) {
      const qualList = qualifications.map(
        (q) => `${q.title}${q.institution ? ` from ${q.institution}` : ""}`
      )
      sections.push(`Qualifications: ${qualList.join("; ")}`)
    }

    const certifications = await prisma.certification.findMany({
      where: { profileId: profile.id, isVisible: true },
      orderBy: { issueDate: "desc" },
    })
    if (certifications.length > 0) {
      const certList = certifications.map(
        (c) => `${c.title}${c.institution ? ` from ${c.institution}` : ""}`
      )
      sections.push(`Certifications: ${certList.join("; ")}`)
    }

    const publications = await prisma.publication.findMany({
      where: { profileId: profile.id, isVisible: true, isPublished: true },
      orderBy: { publicationDate: "desc" },
    })
    if (publications.length > 0) {
      const pubList = publications.map(
        (p) => `"${p.title}" (${new Date(p.publicationDate).getFullYear()})`
      )
      sections.push(`Publications: ${pubList.join("; ")}`)
    }

    const achievements = await prisma.achievement.findMany({
      where: { profileId: profile.id, isVisible: true },
      orderBy: { date: "desc" },
    })
    if (achievements.length > 0) {
      const achList = achievements.map(
        (a) =>
          `${a.title}${a.awardingOrganization ? ` from ${a.awardingOrganization}` : ""} (${new Date(a.date).getFullYear()})`
      )
      sections.push(`Achievements: ${achList.join("; ")}`)
    }

    const faqs = await prisma.faq.findMany({
      where: { isVisible: true, allowAI: true },
      orderBy: { sortOrder: "asc" },
    })
    if (faqs.length > 0) {
      const faqList = faqs.map((f) => `Q: ${f.question} A: ${f.answer}`)
      sections.push(`FAQs: ${faqList.join("; ")}`)
    }

    const customItems = await this.getAIElibleKnowledge()
    for (const item of customItems) {
      sections.push(`[${item.sourceType}]: ${item.content}`)
    }

    return sections.join("\n\n")
  }

  async rebuildKnowledgeFromContent(): Promise<void> {
    const profile = await prisma.profile.findFirst()
    if (!profile) return

    await prisma.$executeRaw`DELETE FROM "AiKnowledgeItem"`

    const knowledgeEntries: {
      content: string
      sourceType: KnowledgeSource
      isVisible: boolean
      allowAI: boolean
    }[] = []

    if (profile.fullBio) {
      knowledgeEntries.push({
        content: `Professional Bio: ${profile.fullBio}`,
        sourceType: "PROFILE",
        isVisible: true,
        allowAI: profile.allowAI,
      })
    }

    if (profile.careerObjective) {
      knowledgeEntries.push({
        content: `Career Objective: ${profile.careerObjective}`,
        sourceType: "PROFILE",
        isVisible: true,
        allowAI: profile.allowAI,
      })
    }

    const education = await prisma.education.findMany({
      where: { profileId: profile.id, isVisible: true },
    })
    for (const edu of education) {
      knowledgeEntries.push({
        content: `Education: ${edu.degree}${edu.field ? ` in ${edu.field}` : ""} from ${edu.institution}${edu.description ? ` - ${edu.description}` : ""}`,
        sourceType: "EDUCATION",
        isVisible: true,
        allowAI: true,
      })
    }

    const experience = await prisma.experience.findMany({
      where: { profileId: profile.id, isVisible: true },
    })
    for (const exp of experience) {
      knowledgeEntries.push({
        content: `Experience: ${exp.jobTitle} at ${exp.organization}${exp.description ? ` - ${exp.description}` : ""}${exp.achievements ? ` Achievements: ${exp.achievements}` : ""}`,
        sourceType: "EXPERIENCE",
        isVisible: true,
        allowAI: true,
      })
    }

    const qualifications = await prisma.qualification.findMany({
      where: { profileId: profile.id, isVisible: true },
    })
    for (const qual of qualifications) {
      knowledgeEntries.push({
        content: `Qualification: ${qual.title}${qual.institution ? ` from ${qual.institution}` : ""}${qual.description ? ` - ${qual.description}` : ""}`,
        sourceType: "QUALIFICATION",
        isVisible: true,
        allowAI: true,
      })
    }

    const publications = await prisma.publication.findMany({
      where: { profileId: profile.id, isVisible: true, isPublished: true },
    })
    for (const pub of publications) {
      knowledgeEntries.push({
        content: `Publication: "${pub.title}" by ${pub.authors}${pub.journal ? ` in ${pub.journal}` : ""}${pub.abstract ? ` - ${pub.abstract}` : ""}`,
        sourceType: "PUBLICATION",
        isVisible: true,
        allowAI: true,
      })
    }

    const achievements = await prisma.achievement.findMany({
      where: { profileId: profile.id, isVisible: true },
    })
    for (const ach of achievements) {
      knowledgeEntries.push({
        content: `Achievement: ${ach.title}${ach.awardingOrganization ? ` from ${ach.awardingOrganization}` : ""}${ach.description ? ` - ${ach.description}` : ""}`,
        sourceType: "ACHIEVEMENT",
        isVisible: true,
        allowAI: true,
      })
    }

    const articles = await prisma.article.findMany({
      where: { isPublished: true, isDraft: false },
    })
    for (const article of articles) {
      knowledgeEntries.push({
        content: `Article: "${article.title}"${article.excerpt ? ` - ${article.excerpt}` : ""}`,
        sourceType: "ARTICLE",
        isVisible: true,
        allowAI: true,
      })
    }

    const faqs = await prisma.faq.findMany({
      where: { isVisible: true },
    })
    for (const faq of faqs) {
      knowledgeEntries.push({
        content: `FAQ: Q: ${faq.question} A: ${faq.answer}`,
        sourceType: "FAQ",
        isVisible: true,
        allowAI: faq.allowAI,
      })
    }

    if (knowledgeEntries.length > 0) {
      await prisma.aiKnowledgeItem.createMany({ data: knowledgeEntries })
    }
  }
}

export const knowledgeService = new KnowledgeService()
