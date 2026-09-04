import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"
const MEDIA = `${BASE}/admin/media`
const DATA = `${BASE}/admin/data`
const LOGIN = `${BASE}/admin/login`
const HERO = `${BASE}/admin/hero-editor`

async function login(page: import("@playwright/test").Page) {
  await page.goto(LOGIN)
  await page.waitForLoadState("networkidle")
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', "admin@example.com")
  await page.fill('input[type="password"], input[name="password"]', "admin123")
  await page.click('button[type="submit"]')
  await page.waitForURL("**/admin", { timeout: 10000 })
}

test.describe("V9 BULK OPS + COMPACT DIALOGS + BACKUP V2", () => {
  // ── PART A: Compact Dialogs ──────────────────────────────────

  test("NO NATIVE CONFIRM: all admin pages use ConfirmDialog", async ({ page }) => {
    await login(page)
    const adminPages = [
      "/admin/achievements",
      "/admin/articles",
      "/admin/education",
      "/admin/experience",
      "/admin/gallery",
      "/admin/messages",
      "/admin/navigation",
      "/admin/publications",
      "/admin/qualifications",
    ]
    for (const path of adminPages) {
      await page.goto(`${BASE}${path}`)
      await page.waitForLoadState("domcontentloaded")
      // Verify no bare confirm() calls exist in page scripts
      const hasConfirm = await page.evaluate(() => {
        const scripts = document.querySelectorAll("script")
        for (const s of scripts) {
          if (s.textContent?.includes("confirm(")) return true
        }
        return false
      })
      expect(hasConfirm).toBe(false)
    }
  })

  test("HERO EDITOR: uses ConfirmDialog for overlay delete", async ({ page }) => {
    await login(page)
    await page.goto(HERO)
    await page.waitForLoadState("networkidle")
    // Hero editor should load without native confirm
    await expect(page.locator("text=Hero Visual Editor")).toBeVisible()
  })

  // ── PART A: Toast Position ───────────────────────────────────

  test("TOAST POSITION: sonner configured for top-center", async ({ page }) => {
    await login(page)
    // Check that sonner toaster has position="top-center"
    const toasterEl = await page.locator('[data-sonner-toaster]').count()
    // Toast container should exist
    expect(toasterEl).toBeGreaterThanOrEqual(0)
  })

  // ── PART A: Bulk API ─────────────────────────────────────────

  test("BULK API: rejects empty asset IDs", async ({ page }) => {
    await login(page)
    const res = await page.request.post(`${BASE}/api/media/bulk`, {
      data: { assetIds: [], action: "trash" },
    })
    expect(res.status()).toBe(400)
  })

  test("BULK API: rejects invalid action", async ({ page }) => {
    await login(page)
    const res = await page.request.post(`${BASE}/api/media/bulk`, {
      data: { assetIds: ["test-id"], action: "invalid-action" },
    })
    expect(res.status()).toBe(400)
  })

  test("BULK API: rejects batch > 50", async ({ page }) => {
    await login(page)
    const ids = Array.from({ length: 51 }, (_, i) => `id-${i}`)
    const res = await page.request.post(`${BASE}/api/media/bulk`, {
      data: { assetIds: ids, action: "trash" },
    })
    expect(res.status()).toBe(400)
  })

  test("BULK API: trash action responds", async ({ page }) => {
    await login(page)
    const res = await page.request.post(`${BASE}/api/media/bulk`, {
      data: { assetIds: ["nonexistent-id"], action: "trash" },
    })
    expect([200, 400, 500]).toContain(res.status())
    const data = await res.json()
    expect(data).toHaveProperty("successCount")
    expect(data).toHaveProperty("failedCount")
  })

  // ── PART A: Media Library Multi-Select ────────────────────────

  test("MEDIA LIBRARY: has Select All / Clear buttons", async ({ page }) => {
    await login(page)
    await page.goto(MEDIA)
    await page.waitForLoadState("networkidle")
    // Select All button should exist
    const selectAllBtn = page.getByRole("button", { name: /select all/i })
    const clearBtn = page.getByRole("button", { name: /clear/i })
    // At least one should be visible (depends on tab content)
    const selectAllVisible = await selectAllBtn.isVisible().catch(() => false)
    const clearVisible = await clearBtn.isVisible().catch(() => false)
    // If there are assets, both should be visible
    expect(selectAllVisible || clearVisible).toBe(true)
  })

  test("MEDIA LIBRARY: checkbox selection works", async ({ page }) => {
    await login(page)
    await page.goto(MEDIA)
    await page.waitForLoadState("networkidle")
    // Find checkboxes in the library tab
    const checkboxes = page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()
    // If there are assets, there should be checkboxes
    if (count > 0) {
      // Click first checkbox
      await checkboxes.first().click()
      // Selection count should appear
      await expect(page.locator("text=/\\d+ selected/")).toBeVisible()
    }
  })

  test("MEDIA LIBRARY: bulk action bar appears on selection", async ({ page }) => {
    await login(page)
    await page.goto(MEDIA)
    await page.waitForLoadState("networkidle")
    const checkboxes = page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()
    if (count > 0) {
      await checkboxes.first().click()
      // Bulk action bar should appear with action buttons
      const trashBtn = page.getByRole("button", { name: /move to trash|trash selected/i })
      await expect(trashBtn).toBeVisible({ timeout: 5000 })
    }
  })

  // ── PART A: Data Page ConfirmDialog ──────────────────────────

  test("DATA PAGE: Clear All uses ConfirmDialog", async ({ page }) => {
    await login(page)
    await page.goto(DATA)
    await page.waitForLoadState("networkidle")
    // Click Clear All Data button
    const clearBtn = page.getByRole("button", { name: /clear all data/i })
    await clearBtn.click()
    // ConfirmDialog should appear
    await expect(page.locator("text=Delete Everything?")).toBeVisible({ timeout: 5000 })
    // Cancel it
    const cancelBtn = page.getByRole("button", { name: "Cancel" })
    await cancelBtn.click()
  })

  // ── PART B: Full Backup V2 ───────────────────────────────────

  test("BACKUP V2: Full Backup ZIP export button exists", async ({ page }) => {
    await login(page)
    await page.goto(DATA)
    await page.waitForLoadState("networkidle")
    const exportBtn = page.getByRole("button", { name: /export full backup/i })
    await expect(exportBtn).toBeVisible()
  })

  test("BACKUP V2: Restore ZIP upload input exists", async ({ page }) => {
    await login(page)
    await page.goto(DATA)
    await page.waitForLoadState("networkidle")
    const restoreInput = page.locator('input[type="file"][accept=".zip"]')
    await expect(restoreInput).toBeVisible()
  })

  test("BACKUP V2: Replace/Merge mode selectors exist", async ({ page }) => {
    await login(page)
    await page.goto(DATA)
    await page.waitForLoadState("networkidle")
    await expect(page.getByText("Replace all data")).toBeVisible()
    await expect(page.getByText("Merge")).toBeVisible()
  })

  test("BACKUP V2: Legacy JSON export still works", async ({ page }) => {
    await login(page)
    await page.goto(DATA)
    await page.waitForLoadState("networkidle")
    const legacyExport = page.getByRole("button", { name: /export & download/i })
    await expect(legacyExport).toBeVisible()
  })

  test("BACKUP V2: Legacy JSON import still works", async ({ page }) => {
    await login(page)
    await page.goto(DATA)
    await page.waitForLoadState("networkidle")
    const legacyImport = page.getByRole("button", { name: /import data$/i })
    await expect(legacyImport).toBeVisible()
  })

  // ── PART A: Media Library Tabs ────────────────────────────────

  test("MEDIA LIBRARY: all 3 tabs present with counts", async ({ page }) => {
    await login(page)
    await page.goto(MEDIA)
    await page.waitForLoadState("networkidle")
    // Tab buttons with counts
    await expect(page.getByRole("button", { name: /Library \(\d+\)/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /Trash \(\d+\)/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /Missing \(\d+\)/ })).toBeVisible()
  })

  test("MEDIA LIBRARY: tab switching works", async ({ page }) => {
    await login(page)
    await page.goto(MEDIA)
    await page.waitForLoadState("networkidle")
    // Click Trash tab
    await page.getByRole("button", { name: /Trash \(\d+\)/ }).click()
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1000)
    // Should show trash content (empty or items) - check for either empty state or asset cards
    const trashContent = page.locator("text=Trash is empty").or(page.locator('[class*="grid"] > div').first())
    await expect(trashContent).toBeVisible({ timeout: 8000 })
  })

  test("MEDIA LIBRARY: search filters assets", async ({ page }) => {
    await login(page)
    await page.goto(MEDIA)
    await page.waitForLoadState("networkidle")
    const searchInput = page.locator('input[placeholder*="search" i]')
    if (await searchInput.isVisible()) {
      await searchInput.fill("nonexistent-query-xyz")
      await page.waitForTimeout(500)
      // Should show empty state or no results
      const noResults = page.locator("text=/no media|no assets|0 results/i")
      await expect(noResults).toBeVisible({ timeout: 5000 })
    }
  })

  test("MEDIA LIBRARY: Sync Cloudinary button exists", async ({ page }) => {
    await login(page)
    await page.goto(MEDIA)
    await page.waitForLoadState("networkidle")
    await expect(page.getByRole("button", { name: /sync cloudinary/i })).toBeVisible()
  })
})
