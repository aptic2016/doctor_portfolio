import { NextRequest, NextResponse } from "next/server";
import { cloudinaryService } from "@/lib/cloudinary/cloudinary.service";
import { auth } from "@/lib/auth/auth";

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "") // remove extension
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric to hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, 60) // limit length
}

function generateSuffix(): string {
  return Math.random().toString(36).substring(2, 8)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { timestamp, folder, filename } = await req.json();
    if (!timestamp) {
      return NextResponse.json({ error: "Timestamp is required" }, { status: 400 });
    }

    const folderName = folder || "portfolio";
    
    // Generate readable public ID: <folder>/<sanitized-name>-<unique-suffix>
    let publicId: string | undefined;
    if (filename) {
      const sanitized = sanitizeFilename(filename);
      const suffix = generateSuffix();
      publicId = `${folderName}/${sanitized}-${suffix}`;
    }

    const signature = await cloudinaryService.generateUploadSignature({
      timestamp,
      folder: folderName,
      publicId,
    });

    return NextResponse.json({ signature, publicId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
