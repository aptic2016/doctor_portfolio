"use server"

import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import JSZip from "jszip"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface BackupManifest {
  formatVersion: 2
  createdAt: string
  backupId: string
  recordCounts: Record<string, number>
  activeMediaCount: number
  missingMediaCount: number
  trashMediaCount: number
}

interface MediaMapping {
  backupMediaId: string
  originalFilename: string | null
  displayName: string | null
  purpose: string
  format: string | null
  oldPublicId: string
  oldSecureUrl: string
  backupPath: string
}

async function requireAdmin() {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  return session
}

export async function exportFullBackup() {
  await requireAdmin()

  const zip = new JSZip()
  const mediaFolder = zip.folder("media")!
  const mappings: MediaMapping[] = []

  // Gather all data
  const [
    profile, education, experience, qualifications, certifications,
    interests, publications, achievements, articles, articleCategories,
    articleTags, galleryItems, galleryCategories, mediaAssets,
    cvDocuments, socialLinks, navigationItems, homeSections,
    highlightMetrics, heroOverlays, brandSettings, themeSettings,
    siteSettings, seoSettings, aiSettings, aiKnowledgeItems,
    faqs, contactMessages,
  ] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.education.findMany(),
    prisma.experience.findMany(),
    prisma.qualification.findMany(),
    prisma.certification.findMany(),
    prisma.professionalInterest.findMany(),
    prisma.publication.findMany(),
    prisma.achievement.findMany(),
    prisma.article.findMany({ include: { categories: true, tags: true } }),
    prisma.articleCategory.findMany(),
    prisma.articleTag.findMany(),
    prisma.galleryItem.findMany(),
    prisma.galleryCategory.findMany(),
    prisma.mediaAsset.findMany(),
    prisma.cvDocument.findMany(),
    prisma.socialLink.findMany(),
    prisma.navigationItem.findMany(),
    prisma.homeSection.findMany(),
    prisma.highlightMetric.findMany(),
    prisma.heroOverlay.findMany(),
    prisma.brandSettings.findFirst(),
    prisma.themeSettings.findFirst(),
    prisma.siteSettings.findFirst(),
    prisma.seoSettings.findFirst(),
    prisma.aiSettings.findFirst(),
    prisma.aiKnowledgeItem.findMany(),
    prisma.faq.findMany(),
    prisma.contactMessage.findMany(),
  ])

  // Download active media files from Cloudinary
  let mediaIndex = 0
  const activeMedia = mediaAssets.filter(m => m.status === "ACTIVE")
  const trashedMedia = mediaAssets.filter(m => m.status === "TRASHED")
  const missingMedia = mediaAssets.filter(m => m.status === "MISSING")

  for (const asset of activeMedia) {
    try {
      const response = await fetch(asset.secureUrl)
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer())
        const ext = asset.format || "jpg"
        const filename = `media-${mediaIndex}.${ext}`
        mediaFolder.file(filename, buffer)
        mappings.push({
          backupMediaId: asset.id,
          originalFilename: asset.originalFilename,
          displayName: asset.displayName,
          purpose: asset.purpose,
          format: asset.format,
          oldPublicId: asset.publicId,
          oldSecureUrl: asset.secureUrl,
          backupPath: `media/${filename}`,
        })
        mediaIndex++
      }
    } catch {
      // Skip failed downloads, note in manifest
    }
  }

  // Build database.json
  const database = {
    profile,
    education,
    experience,
    qualifications,
    certifications,
    interests,
    publications,
    achievements,
    articles,
    articleCategories,
    articleTags,
    galleryItems,
    galleryCategories,
    mediaAssets: mediaAssets.map(m => ({
      ...m,
      // Strip internal fields
    })),
    cvDocuments,
    socialLinks,
    navigationItems,
    homeSections,
    highlightMetrics,
    heroOverlays,
    brandSettings,
    themeSettings,
    siteSettings,
    seoSettings,
    aiSettings,
    aiKnowledgeItems,
    faqs,
    contactMessages,
  }

  // Build manifest
  const manifest: BackupManifest = {
    formatVersion: 2,
    createdAt: new Date().toISOString(),
    backupId: `backup-${Date.now()}`,
    recordCounts: {
      education: education.length,
      experience: experience.length,
      qualifications: qualifications.length,
      certifications: certifications.length,
      interests: interests.length,
      publications: publications.length,
      achievements: achievements.length,
      articles: articles.length,
      articleCategories: articleCategories.length,
      articleTags: articleTags.length,
      galleryItems: galleryItems.length,
      galleryCategories: galleryCategories.length,
      mediaAssets: mediaAssets.length,
      socialLinks: socialLinks.length,
      navigationItems: navigationItems.length,
      homeSections: homeSections.length,
      highlightMetrics: highlightMetrics.length,
      heroOverlays: heroOverlays.length,
      aiKnowledgeItems: aiKnowledgeItems.length,
      faqs: faqs.length,
      contactMessages: contactMessages.length,
    },
    activeMediaCount: activeMedia.length,
    missingMediaCount: missingMedia.length,
    trashMediaCount: trashedMedia.length,
  }

  // Add files to ZIP
  zip.file("manifest.json", JSON.stringify(manifest, null, 2))
  zip.file("database.json", JSON.stringify(database, null, 2))
  zip.file("media-mappings.json", JSON.stringify(mappings, null, 2))
  zip.file("backup-info.json", JSON.stringify({
    appVersion: "9.0.0",
    schemaVersion: "2",
    exportedAt: new Date().toISOString(),
    source: "portfolio-backup-v2",
  }, null, 2))

  // Generate ZIP
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

  // Return as downloadable response
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16)
  return {
    success: true,
    filename: `portfolio-backup-${timestamp}.zip`,
    size: zipBuffer.length,
    buffer: zipBuffer.toString("base64"),
    manifest,
  }
}

export async function restoreFullBackup(backupBase64: string, mode: "replace" | "merge" = "replace") {
  await requireAdmin()

  const zip = await JSZip.loadAsync(Buffer.from(backupBase64, "base64"))

  // Read manifest
  const manifestFile = zip.file("manifest.json")
  if (!manifestFile) throw new Error("Invalid backup: missing manifest.json")
  const manifest: BackupManifest = JSON.parse(await manifestFile.async("text"))
  if (manifest.formatVersion !== 2) throw new Error(`Unsupported backup version: ${manifest.formatVersion}`)

  // Read database
  const dbFile = zip.file("database.json")
  if (!dbFile) throw new Error("Invalid backup: missing database.json")
  const database = JSON.parse(await dbFile.async("text"))

  // Read media mappings
  const mappingsFile = zip.file("media-mappings.json")
  const mappings: MediaMapping[] = mappingsFile ? JSON.parse(await mappingsFile.async("text")) : []

  // Phase 1: Upload media files to current Cloudinary
  const mediaRemap: Record<string, { newId: string; newUrl: string; newPublicId: string }> = {}
  const mediaFolder = zip.folder("media")

  if (mediaFolder) {
    for (const mapping of mappings) {
      const file = mediaFolder.file(mapping.backupPath.split("/")[1])
      if (!file) continue

      try {
        const buffer = Buffer.from(await file.async("arraybuffer"))
        const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "portfolio",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error)
              else if (result) resolve(result as { secure_url: string; public_id: string })
              else reject(new Error("Upload failed"))
            }
          )
          stream.end(buffer)
        })

        mediaRemap[mapping.backupMediaId] = {
          newId: `restored-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          newUrl: result.secure_url,
          newPublicId: result.public_id,
        }
      } catch {
        // Skip failed uploads
      }
    }
  }

  // Phase 2: Restore database
  if (mode === "replace") {
    await prisma.$transaction(async (tx) => {
      // Clear existing data (preserve User)
      await tx.faq.deleteMany()
      await tx.aiKnowledgeItem.deleteMany()
      await tx.contactMessage.deleteMany()
      await tx.highlightMetric.deleteMany()
      await tx.homeSection.deleteMany()
      await tx.navigationItem.deleteMany()
      await tx.socialLink.deleteMany()
      await tx.articleTag.deleteMany()
      await tx.articleCategory.deleteMany()
      await tx.galleryCategory.deleteMany()
      await tx.galleryItem.deleteMany()
      await tx.achievement.deleteMany()
      await tx.publication.deleteMany()
      await tx.professionalInterest.deleteMany()
      await tx.certification.deleteMany()
      await tx.qualification.deleteMany()
      await tx.experience.deleteMany()
      await tx.education.deleteMany()
      await tx.heroOverlay.deleteMany()
      await tx.mediaAsset.deleteMany()
      await tx.cvDocument.deleteMany()
      await tx.seoSettings.deleteMany()
      await tx.siteSettings.deleteMany()
      await tx.themeSettings.deleteMany()
      await tx.brandSettings.deleteMany()
      await tx.aiSettings.deleteMany()
      await tx.article.deleteMany()
      await tx.profile.deleteMany()

      // Restore profile
      if (database.profile) {
        const { id: _pid, ...profileData } = database.profile
        await tx.profile.upsert({
          where: { id: database.profile.id },
          update: profileData,
          create: database.profile,
        })
      }

      // Restore settings (upsert singletons)
      if (database.brandSettings) {
        const existing = await tx.brandSettings.findFirst()
        if (existing) {
          // Remap profileImage if media was reuploaded
          let profileImage = database.brandSettings.profileImage
          if (profileImage) {
            for (const [oldId, remap] of Object.entries(mediaRemap)) {
              if (profileImage.includes(oldId) || profileImage === oldId) {
                profileImage = remap.newUrl
                break
              }
            }
          }
          await tx.brandSettings.update({
            where: { id: existing.id },
            data: { ...database.brandSettings, profileImage, id: existing.id },
          })
        } else {
          await tx.brandSettings.create({ data: database.brandSettings })
        }
      }

      if (database.themeSettings) {
        const existing = await tx.themeSettings.findFirst()
        if (existing) {
          await tx.themeSettings.update({ where: { id: existing.id }, data: { ...database.themeSettings, id: existing.id } })
        } else {
          await tx.themeSettings.create({ data: database.themeSettings })
        }
      }

      if (database.siteSettings) {
        const existing = await tx.siteSettings.findFirst()
        if (existing) {
          await tx.siteSettings.update({ where: { id: existing.id }, data: { ...database.siteSettings, id: existing.id } })
        } else {
          await tx.siteSettings.create({ data: database.siteSettings })
        }
      }

      if (database.seoSettings) {
        const existing = await tx.seoSettings.findFirst()
        if (existing) {
          await tx.seoSettings.update({ where: { id: existing.id }, data: { ...database.seoSettings, id: existing.id } })
        } else {
          await tx.seoSettings.create({ data: database.seoSettings })
        }
      }

      if (database.aiSettings) {
        const existing = await tx.aiSettings.findFirst()
        if (existing) {
          await tx.aiSettings.update({ where: { id: existing.id }, data: { ...database.aiSettings, id: existing.id } })
        } else {
          await tx.aiSettings.create({ data: database.aiSettings })
        }
      }

      // Restore media assets (with remapped URLs)
      if (database.mediaAssets) {
        for (const asset of database.mediaAssets) {
          const remap = mediaRemap[asset.id]
          await tx.mediaAsset.create({
            data: {
              ...asset,
              id: remap ? remap.newId : asset.id,
              publicId: remap ? remap.newPublicId : asset.publicId,
              secureUrl: remap ? remap.newUrl : asset.secureUrl,
              status: remap ? "ACTIVE" : asset.status,
            },
          })
        }
      }

      // Restore education, experience, etc. (simple create many)
      if (database.education?.length) await tx.education.createMany({ data: database.education })
      if (database.experience?.length) await tx.experience.createMany({ data: database.experience })
      if (database.qualifications?.length) await tx.qualification.createMany({ data: database.qualifications })
      if (database.certifications?.length) await tx.certification.createMany({ data: database.certifications })
      if (database.interests?.length) await tx.professionalInterest.createMany({ data: database.interests })
      if (database.publications?.length) await tx.publication.createMany({ data: database.publications })
      if (database.achievements?.length) await tx.achievement.createMany({ data: database.achievements })
      if (database.socialLinks?.length) await tx.socialLink.createMany({ data: database.socialLinks })
      if (database.navigationItems?.length) await tx.navigationItem.createMany({ data: database.navigationItems })
      if (database.homeSections?.length) await tx.homeSection.createMany({ data: database.homeSections })
      if (database.highlightMetrics?.length) await tx.highlightMetric.createMany({ data: database.highlightMetrics })
      if (database.heroOverlays?.length) await tx.heroOverlay.createMany({ data: database.heroOverlays })
      if (database.galleryCategories?.length) await tx.galleryCategory.createMany({ data: database.galleryCategories })
      if (database.galleryItems?.length) await tx.galleryItem.createMany({ data: database.galleryItems })
      if (database.cvDocuments?.length) await tx.cvDocument.createMany({ data: database.cvDocuments })
      if (database.aiKnowledgeItems?.length) await tx.aiKnowledgeItem.createMany({ data: database.aiKnowledgeItems })
      if (database.faqs?.length) await tx.faq.createMany({ data: database.faqs })
      if (database.contactMessages?.length) await tx.contactMessage.createMany({ data: database.contactMessages })

      // Restore articles with relations
      if (database.articles?.length) {
        for (const article of database.articles) {
          const { categories, tags, ...articleData } = article
          const created = await tx.article.create({ data: articleData })
          if (categories?.length) {
            for (const cat of categories) {
              await tx.articleCategory.create({ data: { ...cat, articleId: created.id } })
            }
          }
          if (tags?.length) {
            for (const tag of tags) {
              await tx.articleTag.create({ data: { ...tag, articleId: created.id } })
            }
          }
        }
      }
    })
  }

  // Revalidate all public pages
  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/experience")
  revalidatePath("/education")
  revalidatePath("/qualifications")
  revalidatePath("/publications")
  revalidatePath("/articles")
  revalidatePath("/gallery")
  revalidatePath("/contact")

  return {
    success: true,
    mediaUploaded: Object.keys(mediaRemap).length,
    manifest,
  }
}
