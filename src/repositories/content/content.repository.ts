import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"

export class ContentRepository {
  async getEducation(profileId: string) {
    return prisma.education.findMany({
      where: { profileId },
      orderBy: { startDate: "desc" },
    })
  }

  async getVisibleEducation(profileId: string) {
    return prisma.education.findMany({
      where: { profileId, isVisible: true },
      orderBy: { startDate: "desc" },
    })
  }

  async createEducation(data: Prisma.EducationCreateInput) {
    return prisma.education.create({ data })
  }

  async updateEducation(id: string, data: Prisma.EducationUpdateInput) {
    return prisma.education.update({ where: { id }, data })
  }

  async deleteEducation(id: string) {
    return prisma.education.delete({ where: { id } })
  }

  async getExperience(profileId: string) {
    return prisma.experience.findMany({
      where: { profileId },
      orderBy: { startDate: "desc" },
    })
  }

  async getVisibleExperience(profileId: string) {
    return prisma.experience.findMany({
      where: { profileId, isVisible: true },
      orderBy: { startDate: "desc" },
    })
  }

  async createExperience(data: Prisma.ExperienceCreateInput) {
    return prisma.experience.create({ data })
  }

  async updateExperience(id: string, data: Prisma.ExperienceUpdateInput) {
    return prisma.experience.update({ where: { id }, data })
  }

  async deleteExperience(id: string) {
    return prisma.experience.delete({ where: { id } })
  }

  async getQualifications(profileId: string) {
    return prisma.qualification.findMany({
      where: { profileId },
      orderBy: { issueDate: "desc" },
    })
  }

  async getVisibleQualifications(profileId: string) {
    return prisma.qualification.findMany({
      where: { profileId, isVisible: true },
      orderBy: { issueDate: "desc" },
    })
  }

  async createQualification(data: Prisma.QualificationCreateInput) {
    return prisma.qualification.create({ data })
  }

  async updateQualification(id: string, data: Prisma.QualificationUpdateInput) {
    return prisma.qualification.update({ where: { id }, data })
  }

  async deleteQualification(id: string) {
    return prisma.qualification.delete({ where: { id } })
  }

  async getCertifications(profileId: string) {
    return prisma.certification.findMany({
      where: { profileId },
      orderBy: { issueDate: "desc" },
    })
  }

  async getVisibleCertifications(profileId: string) {
    return prisma.certification.findMany({
      where: { profileId, isVisible: true },
      orderBy: { issueDate: "desc" },
    })
  }

  async createCertification(data: Prisma.CertificationCreateInput) {
    return prisma.certification.create({ data })
  }

  async updateCertification(id: string, data: Prisma.CertificationUpdateInput) {
    return prisma.certification.update({ where: { id }, data })
  }

  async deleteCertification(id: string) {
    return prisma.certification.delete({ where: { id } })
  }

  async getInterests(profileId: string) {
    return prisma.professionalInterest.findMany({
      where: { profileId },
      orderBy: { sortOrder: "asc" },
    })
  }

  async getVisibleInterests(profileId: string) {
    return prisma.professionalInterest.findMany({
      where: { profileId, isVisible: true },
      orderBy: { sortOrder: "asc" },
    })
  }

  async createInterest(data: Prisma.ProfessionalInterestCreateInput) {
    return prisma.professionalInterest.create({ data })
  }

  async updateInterest(id: string, data: Prisma.ProfessionalInterestUpdateInput) {
    return prisma.professionalInterest.update({ where: { id }, data })
  }

  async deleteInterest(id: string) {
    return prisma.professionalInterest.delete({ where: { id } })
  }

  async getPublications(profileId: string) {
    return prisma.publication.findMany({
      where: { profileId },
      orderBy: { publicationDate: "desc" },
    })
  }

  async getVisiblePublications(profileId: string) {
    return prisma.publication.findMany({
      where: { profileId, isVisible: true, isPublished: true },
      orderBy: { publicationDate: "desc" },
    })
  }

  async createPublication(data: Prisma.PublicationCreateInput) {
    return prisma.publication.create({ data })
  }

  async updatePublication(id: string, data: Prisma.PublicationUpdateInput) {
    return prisma.publication.update({ where: { id }, data })
  }

  async deletePublication(id: string) {
    return prisma.publication.delete({ where: { id } })
  }

  async getAchievements(profileId: string) {
    return prisma.achievement.findMany({
      where: { profileId },
      orderBy: { date: "desc" },
    })
  }

  async getVisibleAchievements(profileId: string) {
    return prisma.achievement.findMany({
      where: { profileId, isVisible: true },
      orderBy: { date: "desc" },
    })
  }

  async createAchievement(data: Prisma.AchievementCreateInput) {
    return prisma.achievement.create({ data })
  }

  async updateAchievement(id: string, data: Prisma.AchievementUpdateInput) {
    return prisma.achievement.update({ where: { id }, data })
  }

  async deleteAchievement(id: string) {
    return prisma.achievement.delete({ where: { id } })
  }

  async getArticles() {
    return prisma.article.findMany({
      orderBy: { sortOrder: "asc" },
      include: { categories: true, tags: true },
    })
  }

  async getPublishedArticles() {
    return prisma.article.findMany({
      where: { isPublished: true, isDraft: false },
      orderBy: { publishDate: "desc" },
      include: { categories: true, tags: true },
    })
  }

  async getArticleBySlug(slug: string) {
    return prisma.article.findUnique({
      where: { slug },
      include: { categories: true, tags: true },
    })
  }

  async createArticle(data: Prisma.ArticleCreateInput) {
    return prisma.article.create({ data })
  }

  async updateArticle(id: string, data: Prisma.ArticleUpdateInput) {
    return prisma.article.update({ where: { id }, data })
  }

  async deleteArticle(id: string) {
    return prisma.article.delete({ where: { id } })
  }

  async getArticleCategories() {
    return prisma.articleCategory.findMany()
  }

  async createArticleCategory(data: Prisma.ArticleCategoryCreateInput) {
    return prisma.articleCategory.create({ data })
  }

  async deleteArticleCategory(id: string) {
    return prisma.articleCategory.delete({ where: { id } })
  }

  async getArticleTags() {
    return prisma.articleTag.findMany()
  }

  async createArticleTag(data: Prisma.ArticleTagCreateInput) {
    return prisma.articleTag.create({ data })
  }

  async deleteArticleTag(id: string) {
    return prisma.articleTag.delete({ where: { id } })
  }

  async getGalleryItems() {
    return prisma.galleryItem.findMany({
      orderBy: { sortOrder: "asc" },
      include: { mediaAsset: true },
    })
  }

  async getVisibleGalleryItems() {
    return prisma.galleryItem.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
      include: { mediaAsset: true },
    })
  }

  async createGalleryItem(data: Prisma.GalleryItemCreateInput) {
    return prisma.galleryItem.create({ data, include: { mediaAsset: true } })
  }

  async updateGalleryItem(id: string, data: Prisma.GalleryItemUpdateInput) {
    return prisma.galleryItem.update({ where: { id }, data, include: { mediaAsset: true } })
  }

  async deleteGalleryItem(id: string) {
    return prisma.galleryItem.delete({ where: { id } })
  }

  async getGalleryCategories() {
    return prisma.galleryCategory.findMany()
  }

  async createGalleryCategory(data: Prisma.GalleryCategoryCreateInput) {
    return prisma.galleryCategory.create({ data })
  }

  async deleteGalleryCategory(id: string) {
    return prisma.galleryCategory.delete({ where: { id } })
  }

  async getFaqs() {
    return prisma.faq.findMany({ orderBy: { sortOrder: "asc" } })
  }

  async getVisibleFaqs() {
    return prisma.faq.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    })
  }

  async createFaq(data: Prisma.FaqCreateInput) {
    return prisma.faq.create({ data })
  }

  async updateFaq(id: string, data: Prisma.FaqUpdateInput) {
    return prisma.faq.update({ where: { id }, data })
  }

  async deleteFaq(id: string) {
    return prisma.faq.delete({ where: { id } })
  }

  async getContactMessages() {
    return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } })
  }

  async createContactMessage(data: Prisma.ContactMessageCreateInput) {
    return prisma.contactMessage.create({ data })
  }

  async updateContactMessage(id: string, data: Prisma.ContactMessageUpdateInput) {
    return prisma.contactMessage.update({ where: { id }, data })
  }

  async deleteContactMessage(id: string) {
    return prisma.contactMessage.delete({ where: { id } })
  }
}
