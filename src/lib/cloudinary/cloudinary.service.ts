import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadSignatureParams {
  timestamp: number
  folder?: string
  publicId?: string
  transformation?: string
}

export interface CloudinaryTransformOptions {
  width?: number
  height?: number
  crop?: string
  quality?: string | number
  format?: string
  gravity?: string
  radius?: string | number
  effect?: string
}

export class CloudinaryService {
  async generateUploadSignature(params: UploadSignatureParams) {
    try {
      const folder = params.folder || "portfolio"
      const signParams: Record<string, string | number> = {
        timestamp: params.timestamp,
        folder,
      }

      if (params.publicId) {
        // When public_id includes folder, Cloudinary expects just the name part
        // since folder is already in signParams
        const nameOnly = params.publicId.replace(`${folder}/`, "")
        signParams.public_id = `${folder}/${nameOnly}`
      }

      if (params.transformation) {
        signParams.transformation = params.transformation
      }

      return cloudinary.utils.api_sign_request(
        signParams,
        process.env.CLOUDINARY_API_SECRET || ""
      )
    } catch (error) {
      console.error("Cloudinary signature error:", error)
      throw new Error("Failed to generate upload signature")
    }
  }

  async deleteAsset(publicId: string) {
    try {
      return await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      console.error("Cloudinary delete error:", error)
      throw new Error("Failed to delete asset")
    }
  }

  async assetExists(publicId: string): Promise<boolean> {
    try {
      await cloudinary.api.resource(publicId)
      return true
    } catch {
      return false
    }
  }

  getOptimizedUrl(publicId: string, options: CloudinaryTransformOptions = {}): string {
    const {
      width,
      height,
      crop = "fill",
      quality = "auto",
      format = "auto",
      gravity,
      radius,
      effect,
    } = options

    const transformations: string[] = []

    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    if (crop) transformations.push(`c_${crop}`)
    if (quality) transformations.push(`q_${quality}`)
    if (format) transformations.push(`f_${format}`)
    if (gravity) transformations.push(`g_${gravity}`)
    if (radius) transformations.push(`r_${radius}`)
    if (effect) transformations.push(`e_${effect}`)

    const transformationString = transformations.join(",")
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${publicId}`
  }

  getThumbnailUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, {
      width: 400,
      height: 400,
      crop: "fill",
      quality: 80,
    })
  }

  getGalleryUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, {
      width: 1200,
      height: 800,
      crop: "limit",
      quality: 85,
    })
  }

  getBannerUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, {
      width: 1920,
      height: 600,
      crop: "fill",
      quality: 85,
    })
  }

  getProfileUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, {
      width: 600,
      height: 600,
      crop: "fill",
      quality: 85,
    })
  }
}

export const cloudinaryService = new CloudinaryService()
