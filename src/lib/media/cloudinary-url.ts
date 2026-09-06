/**
 * CLOUDINARY URL GUARD — the check every server action runs before it stores an
 * image URL that the public site will render.
 *
 * `next.config` allows exactly one remote image host, so a URL from anywhere
 * else is not a cosmetic problem: `next/image` refuses it and the page renders
 * a broken frame. Validating at the write boundary keeps that impossible, and
 * keeps an admin form from being the only thing standing between a pasted URL
 * and the public DOM. Deliberately dependency-free — the Cloudinary SDK module
 * reads server config, and this has to stay importable from anywhere.
 */

/** The single remote image host `next/image` is configured for. */
export const CLOUDINARY_HOST = "res.cloudinary.com"

/**
 * Normalises an optional image URL for storage: blank and null both mean "no
 * image" and become `null`, anything else must be an https Cloudinary URL.
 *
 * @throws if the value is neither empty nor a valid Cloudinary https URL.
 */
export function assertCloudinaryUrl(value: string | null | undefined): string | null {
  const raw = value?.trim()
  if (!raw) return null

  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error("Invalid image URL")
  }

  if (parsed.protocol !== "https:" || parsed.hostname !== CLOUDINARY_HOST) {
    throw new Error("Only Cloudinary media URLs are allowed")
  }

  return raw
}
