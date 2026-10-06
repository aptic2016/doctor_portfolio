import { cache } from "react"
import { ContentRepository } from "@/repositories/content/content.repository"
import {
  Education,
  Experience,
  Qualification,
  Certification,
  ProfessionalInterest,
  Publication,
  Achievement,
  Prisma,
} from "@prisma/client"

export class ContentService {
  private repository = new ContentRepository()

  async getEducation(profileId: string): Promise<Education[]> {
    return this.repository.getEducation(profileId)
  }

  async getVisibleEducation(profileId: string): Promise<Education[]> {
    return this.repository.getVisibleEducation(profileId)
  }

  async createEducation(data: Prisma.EducationCreateInput): Promise<Education> {
    return this.repository.createEducation(data)
  }

  async updateEducation(id: string, data: Prisma.EducationUpdateInput): Promise<Education> {
    return this.repository.updateEducation(id, data)
  }

  async deleteEducation(id: string): Promise<Education> {
    return this.repository.deleteEducation(id)
  }

  async getExperience(profileId: string): Promise<Experience[]> {
    return this.repository.getExperience(profileId)
  }

  async getVisibleExperience(profileId: string): Promise<Experience[]> {
    return this.repository.getVisibleExperience(profileId)
  }

  async createExperience(data: Prisma.ExperienceCreateInput): Promise<Experience> {
    return this.repository.createExperience(data)
  }

  async updateExperience(id: string, data: Prisma.ExperienceUpdateInput): Promise<Experience> {
    return this.repository.updateExperience(id, data)
  }

  async deleteExperience(id: string): Promise<Experience> {
    return this.repository.deleteExperience(id)
  }

  async getQualifications(profileId: string): Promise<Qualification[]> {
    return this.repository.getQualifications(profileId)
  }

  async getVisibleQualifications(profileId: string): Promise<Qualification[]> {
    return this.repository.getVisibleQualifications(profileId)
  }

  async createQualification(data: Prisma.QualificationCreateInput): Promise<Qualification> {
    return this.repository.createQualification(data)
  }

  async updateQualification(id: string, data: Prisma.QualificationUpdateInput): Promise<Qualification> {
    return this.repository.updateQualification(id, data)
  }

  async deleteQualification(id: string): Promise<Qualification> {
    return this.repository.deleteQualification(id)
  }

  async getCertifications(profileId: string): Promise<Certification[]> {
    return this.repository.getCertifications(profileId)
  }

  async getVisibleCertifications(profileId: string): Promise<Certification[]> {
    return this.repository.getVisibleCertifications(profileId)
  }

  async createCertification(data: Prisma.CertificationCreateInput): Promise<Certification> {
    return this.repository.createCertification(data)
  }

  async updateCertification(id: string, data: Prisma.CertificationUpdateInput): Promise<Certification> {
    return this.repository.updateCertification(id, data)
  }

  async deleteCertification(id: string): Promise<Certification> {
    return this.repository.deleteCertification(id)
  }

  async getInterests(profileId: string): Promise<ProfessionalInterest[]> {
    return this.repository.getInterests(profileId)
  }

  async getVisibleInterests(profileId: string): Promise<ProfessionalInterest[]> {
    return this.repository.getVisibleInterests(profileId)
  }

  async createInterest(data: Prisma.ProfessionalInterestCreateInput): Promise<ProfessionalInterest> {
    return this.repository.createInterest(data)
  }

  async updateInterest(id: string, data: Prisma.ProfessionalInterestUpdateInput): Promise<ProfessionalInterest> {
    return this.repository.updateInterest(id, data)
  }

  async deleteInterest(id: string): Promise<ProfessionalInterest> {
    return this.repository.deleteInterest(id)
  }

  async getPublications(profileId: string): Promise<Publication[]> {
    return this.repository.getPublications(profileId)
  }

  async getVisiblePublications(profileId: string): Promise<Publication[]> {
    return this.repository.getVisiblePublications(profileId)
  }

  async createPublication(data: Prisma.PublicationCreateInput): Promise<Publication> {
    return this.repository.createPublication(data)
  }

  async updatePublication(id: string, data: Prisma.PublicationUpdateInput): Promise<Publication> {
    return this.repository.updatePublication(id, data)
  }

  async deletePublication(id: string): Promise<Publication> {
    return this.repository.deletePublication(id)
  }

  async getAchievements(profileId: string): Promise<Achievement[]> {
    return this.repository.getAchievements(profileId)
  }

  async getVisibleAchievements(profileId: string): Promise<Achievement[]> {
    return this.repository.getVisibleAchievements(profileId)
  }

  async createAchievement(data: Prisma.AchievementCreateInput): Promise<Achievement> {
    return this.repository.createAchievement(data)
  }

  async updateAchievement(id: string, data: Prisma.AchievementUpdateInput): Promise<Achievement> {
    return this.repository.updateAchievement(id, data)
  }

  async deleteAchievement(id: string): Promise<Achievement> {
    return this.repository.deleteAchievement(id)
  }

  async getArticles() {
    return this.repository.getArticles()
  }

  async getPublishedArticles() {
    return this.repository.getPublishedArticles()
  }

  // The article page reads the same slug in generateMetadata and in the page
  // body; memoise per request so one render issues a single row read.
  getArticleBySlug = cache(async (slug: string) => this.repository.getArticleBySlug(slug))

  async getArticleCategories() {
    return this.repository.getArticleCategories()
  }

  async getArticleTags() {
    return this.repository.getArticleTags()
  }

  async getGalleryItems() {
    return this.repository.getGalleryItems()
  }

  async getVisibleGalleryItems() {
    return this.repository.getVisibleGalleryItems()
  }

  async getContactMessages() {
    return this.repository.getContactMessages()
  }
}

export const contentService = new ContentService()
