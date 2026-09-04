import { BackgroundRemovalProvider, BackgroundRemovalResult } from "./provider.interface"
import { RemoveBgProvider } from "./remove-bg.provider"

const providers: BackgroundRemovalProvider[] = [
  new RemoveBgProvider(),
]

export function getBackgroundRemovalProvider(): BackgroundRemovalProvider | null {
  for (const provider of providers) {
    if (provider.isConfigured()) {
      return provider
    }
  }
  return null
}

export function isBackgroundRemovalConfigured(): boolean {
  return providers.some((p) => p.isConfigured())
}

export async function removeBackground(
  imageBuffer: Buffer,
  mimeType: string
): Promise<BackgroundRemovalResult> {
  const provider = getBackgroundRemovalProvider()
  if (!provider) {
    return {
      success: false,
      error: "No background removal provider is configured. Set REMOVEBG_API_KEY environment variable.",
    }
  }
  return provider.removeBackground(imageBuffer, mimeType)
}
