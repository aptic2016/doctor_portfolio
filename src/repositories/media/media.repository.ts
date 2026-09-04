import { MediaAsset } from "@prisma/client"
import { prisma } from "@/lib/db"

export class MediaRepository {
  async getAllAssets(): Promise<MediaAsset[]> {
    return prisma.mediaAsset.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    })
  }

  async getAllAssetsIncludingTrashed(): Promise<MediaAsset[]> {
    return prisma.mediaAsset.findMany({
      where: { status: { not: "TRASHED" } },
      orderBy: { createdAt: "desc" },
    })
  }

  async getTrashedAssets(): Promise<MediaAsset[]> {
    return prisma.mediaAsset.findMany({
      where: { status: "TRASHED" },
      orderBy: { trashedAt: "desc" },
    })
  }

  async getMissingAssets(): Promise<MediaAsset[]> {
    return prisma.mediaAsset.findMany({
      where: { status: "MISSING" },
      orderBy: { missingDetectedAt: "desc" },
    })
  }

  async getAssetsByFolder(folder: string): Promise<MediaAsset[]> {
    return prisma.mediaAsset.findMany({
      where: { folder, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    })
  }

  async getAssetById(id: string): Promise<MediaAsset | null> {
    return prisma.mediaAsset.findUnique({ where: { id } })
  }

  async createAsset(data: {
    publicId: string
    secureUrl: string
    originalFilename?: string
    displayName?: string
    purpose?: string
    width?: number
    height?: number
    format?: string
    resourceType?: string
    altText?: string
    folder?: string
  }): Promise<MediaAsset> {
    return prisma.mediaAsset.create({ data })
  }

  async updateAsset(id: string, data: Partial<MediaAsset>): Promise<MediaAsset> {
    return prisma.mediaAsset.update({ where: { id }, data })
  }

  async trashAsset(id: string): Promise<MediaAsset> {
    return prisma.mediaAsset.update({
      where: { id },
      data: { status: "TRASHED", trashedAt: new Date() },
    })
  }

  async restoreAsset(id: string): Promise<MediaAsset> {
    return prisma.mediaAsset.update({
      where: { id },
      data: { status: "ACTIVE", trashedAt: null, missingDetectedAt: null },
    })
  }

  async markMissing(id: string): Promise<MediaAsset> {
    return prisma.mediaAsset.update({
      where: { id },
      data: { status: "MISSING", missingDetectedAt: new Date() },
    })
  }

  async deleteAsset(id: string): Promise<MediaAsset> {
    return prisma.mediaAsset.delete({ where: { id } })
  }

  async findByPublicId(publicId: string): Promise<MediaAsset | null> {
    return prisma.mediaAsset.findUnique({ where: { publicId } })
  }

  async searchAssets(query: string): Promise<MediaAsset[]> {
    return prisma.mediaAsset.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { altText: { contains: query, mode: "insensitive" } },
          { publicId: { contains: query, mode: "insensitive" } },
          { folder: { contains: query, mode: "insensitive" } },
          { originalFilename: { contains: query, mode: "insensitive" } },
          { displayName: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async getActiveAssetsByPurpose(purpose: string): Promise<MediaAsset[]> {
    return prisma.mediaAsset.findMany({
      where: { purpose, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    })
  }

  async isAssetReferenced(id: string): Promise<string[]> {
    const references: string[] = []

    const brand = await prisma.brandSettings.findFirst({ where: { profileImage: { contains: id } } })
    if (brand) references.push("Hero Portrait (BrandSettings)")

    const gallery = await prisma.galleryItem.findFirst({ where: { mediaAssetId: id } })
    if (gallery) references.push("Gallery Item")

    return references
  }
}

export const mediaRepository = new MediaRepository()
