import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { mediaService } from "@/services/media/media.service"
import { v2 as cloudinary } from "cloudinary"

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

function generateSuffix(): string {
  return Math.random().toString(36).substring(2, 8)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const altText = (formData.get("altText") as string) || ""
    const folder = (formData.get("folder") as string) || "portfolio"
    const purpose = (formData.get("purpose") as string) || "GENERAL"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPEG, PNG, WebP" }, { status: 400 })
    }

    // Validate file size (8MB max)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 8MB." }, { status: 400 })
    }

    // Generate readable public ID
    const originalFilename = file.name
    const sanitized = sanitizeFilename(originalFilename)
    const suffix = generateSuffix()

    // Convert File to buffer for Cloudinary SDK
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary using SDK (server-side, no env var leakage)
    const uploadResult = await new Promise<{ secure_url: string; public_id: string; width: number; height: number; format: string; resource_type: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${sanitized}-${suffix}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error)
          else if (result) resolve(result as { secure_url: string; public_id: string; width: number; height: number; format: string; resource_type: string })
          else reject(new Error("Upload failed"))
        }
      )
      uploadStream.end(buffer)
    })

    // Register in database
    const asset = await mediaService.registerAsset({
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      originalFilename,
      displayName: originalFilename.replace(/\.[^.]+$/, ""),
      purpose,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      resourceType: uploadResult.resource_type,
      altText,
      folder,
    })

    return NextResponse.json(asset)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
