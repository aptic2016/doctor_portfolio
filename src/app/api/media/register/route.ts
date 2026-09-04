import { NextRequest, NextResponse } from "next/server";
import { mediaService } from "@/services/media/media.service";
import { auth } from "@/lib/auth/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const asset = await mediaService.registerAsset(data);

    return NextResponse.json(asset);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
