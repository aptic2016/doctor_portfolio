export interface BackgroundRemovalResult {
  success: boolean
  imageData?: Buffer
  error?: string
}

export interface BackgroundRemovalProvider {
  name: string
  isConfigured(): boolean
  removeBackground(imageBuffer: Buffer, mimeType: string): Promise<BackgroundRemovalResult>
}
