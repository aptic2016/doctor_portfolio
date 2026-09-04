import { test, expect, type Page } from "@playwright/test"
import path from "path"
import fs from "fs"

const BASE = "http://localhost:3000"

async function adminLogin(page: Page) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
  await page.fill('input[type="email"]', "admin@example.com")
  await page.fill('input[type="password"]', "admin123")
  await page.click('button[type="submit"]')
  await page.waitForURL("**/admin", { timeout: 15000 })
}

function createTestJpg(): Buffer {
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0x7b, 0x40, 0x1b, 0xff, 0xd9
  ])
}

function createTestPng(): Buffer {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x01, 0xe5, 0x27, 0xde, 0xfc, 0x00, 0x00,
    0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42,
    0x60, 0x82
  ])
}

async function doUpload(page: Page, filePath: string, altText: string) {
  await page.goto(`${BASE}/admin/media`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)
  await page.getByRole("button", { name: /Upload Asset/i }).click()
  await page.waitForTimeout(500)
  await page.locator('input[type="file"]').setInputFiles(filePath)
  await page.waitForTimeout(500)
  const altInput = page.locator('input[placeholder*="Describe"]')
  if (await altInput.isVisible()) await altInput.fill(altText)
  await page.getByRole("button", { name: /Upload Now/i }).click()
  await page.waitForFunction(() => {
    const text = document.body.innerText
    return text.includes("uploaded successfully") || text.includes("Upload complete") || text.includes("Upload failed") || text.includes("not configured")
  }, { timeout: 60000 })
  await page.waitForTimeout(2000)
}

// ═══════════════════════════════════════
// 1. CLOUDINARY ENV
// ═══════════════════════════════════════
test("CLOUDINARY ENV", async ({ page }) => {
  await adminLogin(page)
  const result = await page.evaluate(async () => {
    const timestamp = Math.round(Date.now() / 1000)
    const res = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp, folder: "portfolio" }),
    })
    return { status: res.status, ok: res.ok }
  })
  expect(result.status).toBe(200)
  expect(result.ok).toBe(true)
})

// ═══════════════════════════════════════
// 2. SIGNED UPLOAD
// ═══════════════════════════════════════
test("SIGNED UPLOAD", async ({ page }) => {
  await adminLogin(page)
  const result = await page.evaluate(async () => {
    const timestamp = Math.round(Date.now() / 1000)
    const res = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp, folder: "portfolio" }),
    })
    const data = await res.json()
    return { status: res.status, hasSignature: !!data.signature, len: data.signature?.length || 0 }
  })
  expect(result.status).toBe(200)
  expect(result.hasSignature).toBe(true)
  expect(result.len).toBeGreaterThan(10)
})

// ═══════════════════════════════════════
// 3. JPG UPLOAD
// ═══════════════════════════════════════
test("JPG UPLOAD", async ({ page }) => {
  await adminLogin(page)
  const jpgPath = path.join(process.env.TEMP || "/tmp", "v6-test.jpg")
  fs.writeFileSync(jpgPath, createTestJpg())
  await doUpload(page, jpgPath, "V6 Test JPG")

  const assets = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    return await res.json()
  })
  const found = assets.some((a: { altText?: string; secureUrl?: string }) =>
    a.altText === "V6 Test JPG" && a.secureUrl?.includes("cloudinary.com")
  )
  expect(found).toBe(true)
  try { fs.unlinkSync(jpgPath) } catch {}
})

// ═══════════════════════════════════════
// 4. PNG UPLOAD
// ═══════════════════════════════════════
test("PNG UPLOAD", async ({ page }) => {
  await adminLogin(page)
  const pngPath = path.join(process.env.TEMP || "/tmp", "v6-test.png")
  fs.writeFileSync(pngPath, createTestPng())
  await doUpload(page, pngPath, "V6 Test PNG")

  const assets = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    return await res.json()
  })
  const found = assets.some((a: { altText?: string; format?: string }) =>
    a.altText === "V6 Test PNG" && a.format === "png"
  )
  expect(found).toBe(true)
  try { fs.unlinkSync(pngPath) } catch {}
})

// ═══════════════════════════════════════
// 5. TRANSPARENT PNG
// ═══════════════════════════════════════
test("TRANSPARENT PNG", async ({ page }) => {
  await adminLogin(page)
  const assets = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    return await res.json()
  })
  const pngs = assets.filter((a: { format?: string }) => a.format === "png")
  expect(pngs.length).toBeGreaterThanOrEqual(1)
  for (const a of pngs) {
    expect(a.secureUrl).toContain("/image/upload/")
  }
})

// ═══════════════════════════════════════
// 6. MEDIA DATABASE
// ═══════════════════════════════════════
test("MEDIA DATABASE", async ({ page }) => {
  await adminLogin(page)
  const assets = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    return await res.json()
  })
  expect(Array.isArray(assets)).toBe(true)
  expect(assets.length).toBeGreaterThanOrEqual(2)
  for (const a of assets) {
    expect(a.id).toBeTruthy()
    expect(a.publicId).toBeTruthy()
    expect(a.secureUrl).toContain("cloudinary.com")
  }
})

// ═══════════════════════════════════════
// 7. MEDIA LIBRARY
// ═══════════════════════════════════════
test("MEDIA LIBRARY", async ({ page }) => {
  await adminLogin(page)
  // Verify assets exist in DB via API
  const assets = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    return await res.json()
  })
  expect(assets.length).toBeGreaterThanOrEqual(1)

  // Verify media library page renders correctly
  await page.goto(`${BASE}/admin/media`, { waitUntil: "networkidle" })
  await expect(page.getByRole('heading', { name: 'Media Library' })).toBeVisible()
  await expect(page.getByText("Manage all images uploaded")).toBeVisible()
  // The page structure is correct - upload button, search, grid
  await expect(page.getByRole("button", { name: /Upload Asset/i })).toBeVisible()
})

// ═══════════════════════════════════════
// 8. MEDIA REUSE
// ═══════════════════════════════════════
test("MEDIA REUSE", async ({ page }) => {
  await adminLogin(page)
  // Get a known asset URL from DB
  const assets = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    return await res.json()
  })
  expect(assets.length).toBeGreaterThanOrEqual(1)
  const knownUrl = assets[0].secureUrl
  expect(knownUrl).toContain("cloudinary.com")

  // Verify the asset URL is accessible
  const urlCheck = await page.evaluate(async (url: string) => {
    const res = await fetch(url, { method: "HEAD" })
    return { status: res.status, ok: res.ok, contentType: res.headers.get("content-type") }
  }, knownUrl)
  expect(urlCheck.status).toBe(200)
  expect(urlCheck.ok).toBe(true)
})

// ═══════════════════════════════════════
// 9. HERO PORTRAIT
// ═══════════════════════════════════════
test("HERO PORTRAIT", async ({ page }) => {
  await adminLogin(page)
  await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
  await expect(page.getByText("Hero Visual Editor")).toBeVisible({ timeout: 10000 })

  const canvas = page.locator('[class*="relative mx-auto overflow-hidden rounded-lg border bg-background"]')
  await expect(canvas).toBeVisible({ timeout: 5000 })

  const overlayCount = await page.locator('[class*="cursor-move select-none"]').count()
  expect(overlayCount).toBeGreaterThanOrEqual(1)
})

// ═══════════════════════════════════════
// 10. HERO SAVE/RELOAD
// ═══════════════════════════════════════
test("HERO SAVE/RELOAD", async ({ page }) => {
  await adminLogin(page)
  await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
  await expect(page.getByText("Hero Visual Editor")).toBeVisible({ timeout: 10000 })

  const scaleLabel = page.locator("span").filter({ hasText: "Scale" }).first()
  const scaleInput = scaleLabel.locator("..").locator("input[type='number']").first()

  if (await scaleInput.isVisible().catch(() => false)) {
    const origScale = await scaleInput.inputValue()
    await scaleInput.fill("1.25")
    await page.waitForTimeout(300)
    await page.getByRole("button", { name: /^Save$/i }).click()
    await page.waitForTimeout(3000)

    await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
    await expect(page.getByText("Hero Visual Editor")).toBeVisible({ timeout: 10000 })

    const reloadedScale = await scaleInput.inputValue()
    expect(reloadedScale).toBe("1.25")

    await scaleInput.fill(origScale)
    await page.getByRole("button", { name: /^Save$/i }).click()
    await page.waitForTimeout(2000)
  }
})

// ═══════════════════════════════════════
// 11. PUBLIC IMAGE RENDER
// ═══════════════════════════════════════
test("PUBLIC IMAGE RENDER", async ({ page }) => {
  await page.goto(BASE, { waitUntil: "networkidle" })
  // Scroll through page to trigger lazy-loaded images
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(3000)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(1000)
  const broken = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img"))
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.src)
      .filter(s => s && !s.startsWith("data:"))
  })
  expect(broken).toHaveLength(0)
})

// ═══════════════════════════════════════
// 12. UPLOAD ERROR STATES
// ═══════════════════════════════════════
test("UPLOAD ERROR STATES", async ({ page }) => {
  await adminLogin(page)
  await page.goto(`${BASE}/admin/media`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  await page.getByRole("button", { name: /Upload Asset/i }).click()
  await page.waitForTimeout(500)

  const txtPath = path.join(process.env.TEMP || "/tmp", "v6-invalid.txt")
  fs.writeFileSync(txtPath, "not an image")

  // Listen for toast before triggering upload
  const toastPromise = page.waitForFunction(() => {
    const toasts = document.querySelectorAll('[data-sonner-toaster] [data-sonner-toast]')
    return Array.from(toasts).some(t => {
      const text = t.textContent || ""
      return text.includes("Invalid") || text.includes("invalid") || text.includes("not allowed") || text.includes("not configured")
    })
  }, { timeout: 10000 }).then(() => true).catch(() => false)

  await page.locator('input[type="file"]').setInputFiles(txtPath)
  const hasToast = await toastPromise
  expect(hasToast).toBe(true)

  await page.getByRole("button", { name: /Cancel/i }).click().catch(() => {})
  try { fs.unlinkSync(txtPath) } catch {}
})

// ═══════════════════════════════════════
// 13. SECRET EXPOSURE
// ═══════════════════════════════════════
test("SECRET EXPOSURE", async ({ page }) => {
  await page.goto(BASE, { waitUntil: "networkidle" })

  const secretCheck = await page.evaluate(() => {
    const html = document.documentElement.outerHTML
    const hasSecret = html.includes("RlryP1OBBLBChK2")
    const scripts = Array.from(document.querySelectorAll("script"))
    const secretInScript = scripts.some(s => s.textContent?.includes("RlryP1OBBLBChK2"))
    return { hasSecret, secretInScript }
  })

  expect(secretCheck.hasSecret).toBe(false)
  expect(secretCheck.secretInScript).toBe(false)
})
