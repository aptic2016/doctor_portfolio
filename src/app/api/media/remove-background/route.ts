import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { removeBackground, isBackgroundRemovalConfigured } from "@/lib/background-removal"
import { v2 as cloudinary } from "cloudinary"
import { prisma } from "@/lib/db"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isBackgroundRemovalConfigured()) {
      return NextResponse.json(
        { error: "Background removal is not configured. Set REMOVEBG_API_KEY environment variable." },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { mediaId, mediaUrl } = body

    if (!mediaId && !mediaUrl) {
      return NextResponse.json({ error: "mediaId or mediaUrl is required" }, { status: 400 })
    }

    let imageUrl: string
    let originalFilename = "image"
    let displayName = "image"
    let format = "jpeg"
    let folder = "portfolio"

    if (mediaId) {
      const originalAsset = await prisma.mediaAsset.findUnique({ where: { id: mediaId } })
      if (!originalAsset) {
        return NextResponse.json({ error: "Media asset not found" }, { status: 404 })
      }
      imageUrl = originalAsset.secureUrl
      originalFilename = originalAsset.originalFilename || "image"
      displayName = originalAsset.displayName || "image"
      format = originalAsset.format || "jpeg"
      folder = originalAsset.folder || "portfolio"
    } else {
      imageUrl = mediaUrl
      const urlParts = mediaUrl.split("/")
      const filename = urlParts[urlParts.length - 1].split("?")[0]
      displayName = sanitizeFilename(filename) || "image"
      originalFilename = filename || "image"
      if (mediaUrl.includes(".png")) format = "png"
      else if (mediaUrl.includes(".webp")) format = "webp"
    }

    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch original image" }, { status: 500 })
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    const mimeType = `image/${format}`

    const result = await removeBackground(imageBuffer, mimeType)

    if (!result.success || !result.imageData) {
      return NextResponse.json(
        { error: result.error || "Background removal failed" },
        { status: 500 }
      )
    }

    const cutoutName = `${displayName}-cutout`
    const suffix = Math.random().toString(36).substring(2, 8)

    const uploadResult = await new Promise<{
      secure_url: string
      public_id: string
      width: number
      height: number
      format: string
      resource_type: string
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${cutoutName}-${suffix}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error)
          else if (result)
            resolve(result as {
              secure_url: string
              public_id: string
              width: number
              height: number
              format: string
              resource_type: string
            })
          else reject(new Error("Upload failed"))
        }
      )
      uploadStream.end(result.imageData)
    })

    const cutoutAsset = await prisma.mediaAsset.create({
      data: {
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
        originalFilename,
        displayName: cutoutName,
        purpose: "HERO",
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        resourceType: uploadResult.resource_type,
        altText: `${displayName} - Background Removed`,
        folder,
      },
    })

    return NextResponse.json({
      cutout: cutoutAsset,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Background removal failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
