import { MediaAsset } from "@prisma/client"
import { mediaRepository } from "@/repositories/media/media.repository"
import { cloudinaryService } from "@/lib/cloudinary/cloudinary.service"

export class MediaService {
  async getAllAssets(): Promise<MediaAsset[]> {
    return mediaRepository.getAllAssets()
  }

  async getTrashedAssets(): Promise<MediaAsset[]> {
    return mediaRepository.getTrashedAssets()
  }

  async getMissingAssets(): Promise<MediaAsset[]> {
    return mediaRepository.getMissingAssets()
  }

  async getAssetsByFolder(folder: string): Promise<MediaAsset[]> {
    return mediaRepository.getAssetsByFolder(folder)
  }

  async getAssetById(id: string): Promise<MediaAsset | null> {
    return mediaRepository.getAssetById(id)
  }

  async registerAsset(data: {
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
    const existing = await mediaRepository.findByPublicId(data.publicId)
    if (existing) {
      return mediaRepository.updateAsset(existing.id, { ...data, status: "ACTIVE", trashedAt: null, missingDetectedAt: null } as never)
    }
    return mediaRepository.createAsset(data)
  }

  async updateAsset(id: string, data: Partial<MediaAsset>): Promise<MediaAsset> {
    return mediaRepository.updateAsset(id, data)
  }

  async trashAsset(id: string): Promise<MediaAsset> {
    return mediaRepository.trashAsset(id)
  }

  async restoreAsset(id: string): Promise<MediaAsset> {
    return mediaRepository.restoreAsset(id)
  }

  async permanentDelete(id: string): Promise<{ success: boolean; cloudinaryResult?: string }> {
    const asset = await mediaRepository.getAssetById(id)
    if (!asset) throw new Error("Asset not found")

    let cloudinaryResult = "already_deleted"
    try {
      await cloudinaryService.deleteAsset(asset.publicId)
      cloudinaryResult = "deleted"
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ""
      if (msg.includes("not found") || msg.includes("already")) {
        cloudinaryResult = "already_deleted"
      } else {
        throw err
      }
    }

    await mediaRepository.deleteAsset(id)
    return { success: true, cloudinaryResult }
  }

  async removeRecordOnly(id: string): Promise<void> {
    const asset = await mediaRepository.getAssetById(id)
    if (!asset) throw new Error("Asset not found")
    await mediaRepository.deleteAsset(id)
  }

  async syncCloudinary(): Promise<{ checked: number; missing: number; active: number; missingAssets: Array<{ id: string; publicId: string; displayName: string | null }> }> {
    const activeAssets = await mediaRepository.getAllAssets()
    let missing = 0
    let active = 0
    const missingAssets: Array<{ id: string; publicId: string; displayName: string | null }> = []

    for (const asset of activeAssets) {
      try {
        const result = await cloudinaryService.assetExists(asset.publicId)
        if (result) {
          active++
        } else {
          await mediaRepository.markMissing(asset.id)
          missing++
          missingAssets.push({ id: asset.id, publicId: asset.publicId, displayName: asset.displayName })
        }
      } catch {
        await mediaRepository.markMissing(asset.id)
        missing++
        missingAssets.push({ id: asset.id, publicId: asset.publicId, displayName: asset.displayName })
      }
    }

    return { checked: activeAssets.length, missing, active, missingAssets }
  }

  async checkAssetReferences(id: string): Promise<string[]> {
    return mediaRepository.isAssetReferenced(id)
  }

  async searchAssets(query: string): Promise<MediaAsset[]> {
    return mediaRepository.searchAssets(query)
  }

  getOptimizedUrl(publicId: string, options?: {
    width?: number
    height?: number
    crop?: string
    quality?: string
    format?: string
  }): string {
    return cloudinaryService.getOptimizedUrl(publicId, options)
  }

  getThumbnailUrl(publicId: string): string {
    return cloudinaryService.getOptimizedUrl(publicId, {
      width: 400,
      height: 400,
      crop: "fill",
    })
  }
}

export const mediaService = new MediaService()
