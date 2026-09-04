import { BackgroundRemovalProvider, BackgroundRemovalResult } from "./provider.interface"

export class RemoveBgProvider implements BackgroundRemovalProvider {
  name = "remove.bg"

  isConfigured(): boolean {
    return !!process.env.REMOVEBG_API_KEY
  }

  async removeBackground(imageBuffer: Buffer, mimeType: string): Promise<BackgroundRemovalResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "REMOVEBG_API_KEY is not configured" }
    }

    const apiKey = process.env.REMOVEBG_API_KEY!

    try {
      const base64 = imageBuffer.toString("base64")

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_file_b64: base64,
          size: "auto",
          type: "person",
          format: "png",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: `remove.bg API error: ${response.status} - ${errorData.errors?.[0]?.title || response.statusText}`,
        }
      }

      const resultBuffer = Buffer.from(await response.arrayBuffer())
      return { success: true, imageData: resultBuffer }
    } catch (error) {
      return {
        success: false,
        error: `remove.bg request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }
}
