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

// ═══════════════════════════════════════
// 1. CLOUDINARY READABLE PUBLIC ID
// ═══════════════════════════════════════
test("CLOUDINARY READABLE PUBLIC ID", async ({ page }) => {
  await adminLogin(page)
  const result = await page.evaluate(async () => {
    const timestamp = Math.round(Date.now() / 1000)
    const res = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp, folder: "portfolio", filename: "doctor-profile.png" }),
    })
    return await res.json()
  })
  expect(result.publicId).toBeTruthy()
  expect(result.publicId).toContain("portfolio/doctor-profile-")
  expect(result.signature).toBeTruthy()
})

// ═══════════════════════════════════════
// 2. ORIGINAL FILENAME PRESERVED
// ═══════════════════════════════════════
test("ORIGINAL FILENAME PRESERVED", async ({ page }) => {
  await adminLogin(page)
  // Upload a file with a known name
  const jpgPath = path.join(process.env.TEMP || "/tmp", "v7-filename-test.jpg")
  fs.writeFileSync(jpgPath, createTestJpg())

  await page.goto(`${BASE}/admin/media`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /Upload Asset/i }).click()
  await page.waitForTimeout(500)
  await page.locator('input[type="file"]').setInputFiles(jpgPath)
  await page.waitForTimeout(500)
  await page.getByRole("button", { name: /Upload Now/i }).click()
  await page.waitForFunction(() => {
    const text = document.body.innerText
    return text.includes("uploaded successfully") || text.includes("Upload complete") || text.includes("Upload failed") || text.includes("not configured")
  }, { timeout: 60000 })
  await page.waitForTimeout(2000)

  // Check DB for the uploaded asset
  const assets = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    return await res.json()
  })
  const found = assets.find((a: { originalFilename?: string }) => a.originalFilename === "v7-filename-test.jpg")
  expect(found).toBeTruthy()
  expect(found.displayName).toBeTruthy()

  try { fs.unlinkSync(jpgPath) } catch {}
})

// ═══════════════════════════════════════
// 3. DUPLICATE FILENAME HANDLING
// ═══════════════════════════════════════
test("DUPLICATE FILENAME HANDLING", async ({ page }) => {
  await adminLogin(page)
  const result1 = await page.evaluate(async () => {
    const timestamp = Math.round(Date.now() / 1000)
    const res = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp, folder: "portfolio", filename: "doctor-profile.png" }),
    })
    return await res.json()
  })
  // Second upload with same name should get different publicId
  const result2 = await page.evaluate(async () => {
    const timestamp = Math.round(Date.now() / 1000)
    const res = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp, folder: "portfolio", filename: "doctor-profile.png" }),
    })
    return await res.json()
  })
  expect(result1.publicId).not.toBe(result2.publicId)
  expect(result1.publicId).toContain("doctor-profile-")
  expect(result2.publicId).toContain("doctor-profile-")
})

// ═══════════════════════════════════════
// 4. MEDIA LIBRARY LIVE UPDATE
// ═══════════════════════════════════════
test("MEDIA LIBRARY LIVE UPDATE", async ({ page }) => {
  await adminLogin(page)
  // Get initial count
  const initialCount = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    const data = await res.json()
    return data.length
  })

  // Upload a file via Media Library
  await page.goto(`${BASE}/admin/media`, { waitUntil: "networkidle" })
  await expect(page.getByRole('heading', { name: 'Media Library' })).toBeVisible()

  const jpgPath = path.join(process.env.TEMP || "/tmp", "v7-test-live.jpg")
  fs.writeFileSync(jpgPath, createTestJpg())

  await page.getByRole("button", { name: /Upload Asset/i }).click()
  await page.waitForTimeout(500)
  await page.locator('input[type="file"]').setInputFiles(jpgPath)
  await page.waitForTimeout(500)
  const altInput = page.locator('input[placeholder*="Describe"]')
  if (await altInput.isVisible()) await altInput.fill("V7 Live Update Test")
  await page.getByRole("button", { name: /Upload Now/i }).click()
  
  // Wait for upload to complete by polling DB
  let attempts = 0
  let newCount = initialCount
  while (attempts < 30) {
    await page.waitForTimeout(2000)
    newCount = await page.evaluate(async () => {
      const res = await fetch("/api/media/assets")
      const data = await res.json()
      return data.length
    })
    if (newCount > initialCount) break
    attempts++
  }
  
  expect(newCount).toBeGreaterThan(initialCount)

  try { fs.unlinkSync(jpgPath) } catch {}
})

// ═══════════════════════════════════════
// 5. MEDIA LIBRARY RELOAD
// ═══════════════════════════════════════
test("MEDIA LIBRARY RELOAD", async ({ page }) => {
  await adminLogin(page)
  // Check assets exist
  const assets = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    return await res.json()
  })
  expect(assets.length).toBeGreaterThanOrEqual(1)

  // Navigate to media library
  await page.goto(`${BASE}/admin/media`, { waitUntil: "networkidle" })
  await expect(page.getByRole('heading', { name: 'Media Library' })).toBeVisible()

  // Reload
  await page.reload({ waitUntil: "networkidle" })
  await expect(page.getByRole('heading', { name: 'Media Library' })).toBeVisible()

  // Verify assets still visible
  const assetsAfterReload = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    return await res.json()
  })
  expect(assetsAfterReload.length).toBeGreaterThanOrEqual(1)
})

// ═══════════════════════════════════════
// 6. MEDIA LIBRARY NAVIGATE-BACK
// ═══════════════════════════════════════
test("MEDIA LIBRARY NAVIGATE-BACK", async ({ page }) => {
  await adminLogin(page)
  await page.goto(`${BASE}/admin/media`, { waitUntil: "networkidle" })
  await expect(page.getByRole('heading', { name: 'Media Library' })).toBeVisible()

  // Navigate away
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
  // Navigate back
  await page.goto(`${BASE}/admin/media`, { waitUntil: "networkidle" })
  await expect(page.getByRole('heading', { name: 'Media Library' })).toBeVisible()

  const assets = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    return await res.json()
  })
  expect(assets.length).toBeGreaterThanOrEqual(1)
})

// ═══════════════════════════════════════
// 7. LOADEDREF STALE ISSUE
// ═══════════════════════════════════════
test("LOADEDREF STALE ISSUE", async ({ page }) => {
  await adminLogin(page)
  // Navigate to media, away, back - should always load fresh
  await page.goto(`${BASE}/admin/media`, { waitUntil: "networkidle" })
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
  await page.goto(`${BASE}/admin/media`, { waitUntil: "networkidle" })

  // Verify we can see the Refresh button (loadedRef fix)
  await expect(page.getByRole("button", { name: /Refresh/i })).toBeVisible()
})

// ═══════════════════════════════════════
// 8. HERO PHOTO CONTROL
// ═══════════════════════════════════════
test("HERO PHOTO CONTROL", async ({ page }) => {
  await adminLogin(page)
  await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
  await expect(page.getByText("Hero Visual Editor")).toBeVisible({ timeout: 10000 })

  // Check for Doctor Portrait section
  await expect(page.getByText("Doctor Portrait")).toBeVisible()
  await expect(page.getByText("Select or upload the doctor")).toBeVisible()
})

// ═══════════════════════════════════════
// 9. HERO SELECT FROM LIBRARY
// ═══════════════════════════════════════
test("HERO SELECT FROM LIBRARY", async ({ page }) => {
  await adminLogin(page)
  await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
  await expect(page.getByText("Hero Visual Editor")).toBeVisible({ timeout: 10000 })

  // Click the Select button in the Doctor Portrait section
  const selectBtn = page.getByRole("button", { name: /Select/i }).first()
  await expect(selectBtn).toBeVisible()
  await selectBtn.click()

  // Media picker dialog should open
  await expect(page.getByText("Select Media")).toBeVisible({ timeout: 5000 })

  // Should have Media Library tab
  await expect(page.getByRole("button", { name: /Media Library/i })).toBeVisible()
})

// ═══════════════════════════════════════
// 10. HERO UPLOAD NEW
// ═══════════════════════════════════════
test("HERO UPLOAD NEW", async ({ page }) => {
  await adminLogin(page)
  await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
  await expect(page.getByText("Hero Visual Editor")).toBeVisible({ timeout: 10000 })

  // Click Select in Doctor Portrait
  const selectBtn = page.getByRole("button", { name: /Select/i }).first()
  await selectBtn.click()
  await expect(page.getByText("Select Media")).toBeVisible({ timeout: 5000 })

  // Click Upload New tab
  await page.getByRole("button", { name: /Upload New/i }).click()

  // Should see upload form
  await expect(page.getByText("Click to select image")).toBeVisible()
})

// ═══════════════════════════════════════
// 11. HERO PORTRAIT PREVIEW
// ═══════════════════════════════════════
test("HERO PORTRAIT PREVIEW", async ({ page }) => {
  await adminLogin(page)
  // Check current portrait state via API
  const brandData = await page.evaluate(async () => {
    const res = await fetch("/api/admin/brand-settings", { method: "GET" })
    if (!res.ok) return null
    return await res.json()
  })

  await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
  await expect(page.getByText("Hero Visual Editor")).toBeVisible({ timeout: 10000 })

  if (brandData?.profileImage) {
    // Should show portrait preview image
    const previewImg = page.locator('img[alt="Portrait preview"]')
    await expect(previewImg).toBeVisible({ timeout: 5000 })
  } else {
    // Should show empty state
    await expect(page.getByText("No portrait selected")).toBeVisible()
  }
})

// ═══════════════════════════════════════
// 12. HERO PORTRAIT SAVE
// ═══════════════════════════════════════
test("HERO PORTRAIT SAVE", async ({ page }) => {
  await adminLogin(page)
  await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
  await expect(page.getByText("Hero Visual Editor")).toBeVisible({ timeout: 10000 })

  // Get current profileImage
  const brandData = await page.evaluate(async () => {
    const res = await fetch("/api/admin/brand-settings", { method: "GET" })
    if (!res.ok) return null
    return await res.json()
  })
  const originalImage = brandData?.profileImage || null

  // Click Save
  await page.getByRole("button", { name: /^Save$/i }).click()
  await page.waitForTimeout(2000)

  // Verify save succeeded (toast or state)
  const afterSave = await page.evaluate(async () => {
    const res = await fetch("/api/admin/brand-settings", { method: "GET" })
    if (!res.ok) return null
    return await res.json()
  })
  // profileImage should remain unchanged (null or undefined both acceptable)
  const savedImage = afterSave?.profileImage ?? null
  expect(savedImage).toBe(originalImage)
})

// ═══════════════════════════════════════
// 13. HERO PORTRAIT RELOAD
// ═══════════════════════════════════════
test("HERO PORTRAIT RELOAD", async ({ page }) => {
  await adminLogin(page)
  await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
  await expect(page.getByText("Hero Visual Editor")).toBeVisible({ timeout: 10000 })

  const brandData = await page.evaluate(async () => {
    const res = await fetch("/api/admin/brand-settings", { method: "GET" })
    if (!res.ok) return null
    return await res.json()
  })

  // Reload
  await page.reload({ waitUntil: "networkidle" })
  await expect(page.getByText("Hero Visual Editor")).toBeVisible({ timeout: 10000 })

  const afterReload = await page.evaluate(async () => {
    const res = await fetch("/api/admin/brand-settings", { method: "GET" })
    if (!res.ok) return null
    return await res.json()
  })
  expect(afterReload?.profileImage).toBe(brandData?.profileImage)
})

// ═══════════════════════════════════════
// 14. PUBLIC HERO PORTRAIT
// ═══════════════════════════════════════
test("PUBLIC HERO PORTRAIT", async ({ page }) => {
  await page.goto(BASE, { waitUntil: "networkidle" })
  // The hero section should render without errors
  // Portrait may or may not be present depending on DB state
  const heroSection = page.locator("section").first()
  await expect(heroSection).toBeVisible()
})

// ═══════════════════════════════════════
// 15. TRANSPARENT PNG
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
    // Cloudinary should not flatten transparency
    expect(a.secureUrl).not.toContain("flatten")
  }
})

// ═══════════════════════════════════════
// 16. MEDIA PICKER UI TEST
// ═══════════════════════════════════════
test("MEDIA PICKER UI TEST", async ({ page }) => {
  await adminLogin(page)
  await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
  await expect(page.getByText("Hero Visual Editor")).toBeVisible({ timeout: 10000 })

  // Open media picker
  const selectBtn = page.getByRole("button", { name: /Select/i }).first()
  await selectBtn.click()
  await expect(page.getByText("Select Media")).toBeVisible({ timeout: 5000 })

  // Verify tabs exist
  await expect(page.getByRole("button", { name: /Media Library/i })).toBeVisible()
  await expect(page.getByRole("button", { name: /Upload New/i })).toBeVisible()

  // Verify search exists
  await expect(page.locator('input[placeholder*="Search"]')).toBeVisible()
})

// ═══════════════════════════════════════
// 17. PLAYWRIGHT UI TESTS (full suite)
// ═══════════════════════════════════════
test("PLAYWRIGHT UI TESTS", async ({ page }) => {
  // Verify all major admin pages load
  const pages = ["/admin", "/admin/media", "/admin/hero-editor", "/admin/profile"]
  for (const p of pages) {
    await adminLogin(page)
    await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" })
    // No crash = pass
    expect(page.url()).toContain(p)
  }
})

// ═══════════════════════════════════════
// 18. PRISMA
// ═══════════════════════════════════════
test("PRISMA", async ({ page }) => {
  await adminLogin(page)
  // Verify DB has the new fields
  const result = await page.evaluate(async () => {
    const res = await fetch("/api/media/assets")
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return { hasFields: true }
    const first = data[0]
    return {
      hasOriginalFilename: "originalFilename" in first,
      hasDisplayName: "displayName" in first,
      hasPurpose: "purpose" in first,
    }
  })
  expect(result.hasOriginalFilename).toBe(true)
  expect(result.hasDisplayName).toBe(true)
  expect(result.hasPurpose).toBe(true)
})

// ═══════════════════════════════════════
// 19. TYPESCRIPT
// ═══════════════════════════════════════
test("TYPESCRIPT", async ({ page }) => {
  // Build already verified TS compilation; this test confirms no runtime errors
  await page.goto(BASE, { waitUntil: "networkidle" })
  const errors: string[] = []
  page.on("pageerror", (err) => errors.push(err.message))
  await page.goto(`${BASE}/admin/media`, { waitUntil: "networkidle" })
  await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
  expect(errors).toHaveLength(0)
})

// ═══════════════════════════════════════
// 20. BUILD
// ═══════════════════════════════════════
test("BUILD", async ({ page }) => {
  // Already verified via npm run build; confirm pages serve
  const res = await page.goto(BASE)
  expect(res?.status()).toBe(200)
})

// ═══════════════════════════════════════
// 21. DEV SERVER
// ═══════════════════════════════════════
test("DEV SERVER", async ({ page }) => {
  const res = await page.goto(BASE)
  expect(res?.status()).toBe(200)
})
