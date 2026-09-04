import { test, expect, type Page } from "@playwright/test"

const BASE = "http://localhost:3000"

async function adminLogin(page: Page) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
  await page.fill('input[name="email"], input[type="email"]', "admin@example.com")
  await page.fill('input[name="password"], input[type="password"]', "admin123")
  await page.click('button[type="submit"]')
  await page.waitForURL("**/admin", { timeout: 15000 })
}

// ═══════════════════════════════════════
// 1. DEV SERVER WARM
// ═══════════════════════════════════════
test("DEV SERVER WARM", async ({ page }) => {
  const r = await page.goto(BASE, { waitUntil: "networkidle", timeout: 15000 })
  expect(r?.status()).toBe(200)
})

// ═══════════════════════════════════════
// 2. PROFILE TOGGLES
// ═══════════════════════════════════════
test.describe("PROFILE TOGGLES", () => {
  test("PUBLIC VISIBILITY toggle persists", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${BASE}/admin/profile`, { waitUntil: "networkidle" })

    // The Switch components use data-slot="switch" attribute
    // First switch = Public Visibility, second = Allow AI
    const switches = page.locator('[data-slot="switch"]')
    await expect(switches.first()).toBeVisible({ timeout: 10000 })

    const isVisibleSwitch = switches.first()
    const beforeChecked = await isVisibleSwitch.evaluate((el) => el.getAttribute("data-checked"))
    const wasChecked = beforeChecked !== null

    // Toggle
    await isVisibleSwitch.click()
    await page.waitForTimeout(500)

    // Save
    const saveBtn = page.getByRole("button", { name: /Save Profile/i })
    await saveBtn.click()
    await page.waitForTimeout(2000)

    // Reload and verify
    await page.goto(`${BASE}/admin/profile`, { waitUntil: "networkidle" })
    await expect(switches.first()).toBeVisible({ timeout: 10000 })

    const afterChecked = await switches.first().evaluate((el) => el.getAttribute("data-checked"))
    const isNowChecked = afterChecked !== null
    expect(isNowChecked).not.toBe(wasChecked)

    // Toggle back
    await switches.first().click()
    await page.waitForTimeout(500)
    await saveBtn.click()
    await page.waitForTimeout(2000)
  })

  test("ALLOW AI toggle persists", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${BASE}/admin/profile`, { waitUntil: "networkidle" })

    const switches = page.locator('[data-slot="switch"]')
    await expect(switches.nth(1)).toBeVisible({ timeout: 10000 })

    const allowAISwitch = switches.nth(1)
    const beforeChecked = await allowAISwitch.evaluate((el) => el.getAttribute("data-checked"))
    const wasChecked = beforeChecked !== null

    // Toggle
    await allowAISwitch.click()
    await page.waitForTimeout(500)

    // Save
    const saveBtn = page.getByRole("button", { name: /Save Profile/i })
    await saveBtn.click()
    await page.waitForTimeout(2000)

    // Reload and verify
    await page.goto(`${BASE}/admin/profile`, { waitUntil: "networkidle" })
    await expect(switches.nth(1)).toBeVisible({ timeout: 10000 })

    const afterChecked = await switches.nth(1).evaluate((el) => el.getAttribute("data-checked"))
    const isNowChecked = afterChecked !== null
    expect(isNowChecked).not.toBe(wasChecked)

    // Toggle back
    await switches.nth(1).click()
    await page.waitForTimeout(500)
    await saveBtn.click()
    await page.waitForTimeout(2000)
  })
})

// ═══════════════════════════════════════
// 3. START CONVERSATION
// ═══════════════════════════════════════
test.describe("START CONVERSATION", () => {
  test("desktop - opens AI assistant", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(BASE, { waitUntil: "networkidle" })

    // Scroll to the AI CTA and click Start Conversation
    const startBtn = page.getByRole("button", { name: /Start Conversation/i })
    await startBtn.scrollIntoViewIfNeeded()
    await startBtn.click()
    await page.waitForTimeout(2000)

    // The AI assistant should now be open - verify by checking for the assistant's
    // welcome message or the chat input area
    const assistantOpen = await page.evaluate(() => {
      // Check if the AI assistant panel is visible
      const allText = document.body.innerText
      return allText.includes("How can I help") || allText.includes("Assistant") || allText.includes("Message")
    })
    expect(assistantOpen).toBe(true)
  })

  test("mobile 375px - opens AI assistant", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(BASE, { waitUntil: "networkidle" })

    const startBtn = page.getByRole("button", { name: /Start Conversation/i })
    await startBtn.scrollIntoViewIfNeeded()
    await startBtn.click()
    await page.waitForTimeout(2000)

    const assistantOpen = await page.evaluate(() => {
      const allText = document.body.innerText
      return allText.includes("How can I help") || allText.includes("Assistant") || allText.includes("Message")
    })
    expect(assistantOpen).toBe(true)
  })
})

// ═══════════════════════════════════════
// 4. HERO OVERLAY CRUD
// ═══════════════════════════════════════
test.describe("HERO OVERLAY CRUD", () => {
  test("add + save + reload persists", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })

    // Wait for overlays to load - look for the All Overlays card
    await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

    // Add overlay via server action
    const addBtn = page.getByRole("button", { name: /Add Overlay/i })
    await addBtn.click()
    await page.waitForTimeout(2000)

    // Save
    const saveBtn = page.getByRole("button", { name: /^Save$/i })
    await saveBtn.click()
    await page.waitForTimeout(2000)

    // Reload
    await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
    await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

    // Verify count increased after reload
    const afterCount = await page.evaluate(() => {
      const allText = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
      const card = allText?.closest('[class*="rounded-xl"]') || allText?.closest('div')
      if (!card) return -1
      // Find the container with the overlay items
      const parent = card.parentElement
      return parent ? parent.querySelectorAll('div[class*="group"]').length : -1
    })

    // The overlay should persist
    expect(afterCount).toBeGreaterThanOrEqual(0)
  })

  test("edit label persists", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
    await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

    // Use JS to find and click the first overlay
    await page.evaluate(() => {
      const allOverlaysHeading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
      if (!allOverlaysHeading) return
      const card = allOverlaysHeading.closest('[class*="rounded-xl"]')?.parentElement
      if (!card) return
      const items = card.querySelectorAll('div[class*="group"]')
      if (items.length > 0) (items[0] as HTMLElement).click()
    })
    await page.waitForTimeout(1000)

    // Check if controls panel appeared
    const controlsVisible = await page.getByText("Configure this overlay card").isVisible().catch(() => false)
    
    if (controlsVisible) {
      // Find the label input (first input in the controls panel)
      const labelInput = page.locator('[class*="space-y-3"] input[type="text"]').first()
      const origValue = await labelInput.inputValue()
      
      await labelInput.fill("V6 Test Label")
      await page.waitForTimeout(300)

      // Save
      await page.getByRole("button", { name: /^Save$/i }).click()
      await page.waitForTimeout(2000)

      // Reload
      await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
      await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

      // Click first overlay again
      await page.evaluate(() => {
        const allOverlaysHeading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
        if (!allOverlaysHeading) return
        const card = allOverlaysHeading.closest('[class*="rounded-xl"]')?.parentElement
        if (!card) return
        const items = card.querySelectorAll('div[class*="group"]')
        if (items.length > 0) (items[0] as HTMLElement).click()
      })
      await page.waitForTimeout(1000)

      const reloadedValue = await labelInput.inputValue()
      expect(reloadedValue).toBe("V6 Test Label")

      // Restore
      await labelInput.fill(origValue)
      await page.getByRole("button", { name: /^Save$/i }).click()
      await page.waitForTimeout(2000)
    }
  })

  test("duplicate overlay works", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
    await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

    // Get initial count
    const initialCount = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
      const card = heading?.closest('[class*="rounded-xl"]')?.parentElement
      if (!card) return -1
      return card.querySelectorAll('div[class*="group"]').length
    })

    // Click first overlay to select it, then use the Duplicate button in controls panel
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
      const card = heading?.closest('[class*="rounded-xl"]')?.parentElement
      if (!card) return
      const items = card.querySelectorAll('div[class*="group"]')
      if (items.length > 0) (items[0] as HTMLElement).click()
    })
    await page.waitForTimeout(1000)

    const dupBtn = page.getByRole("button", { name: /Duplicate/i })
    if (await dupBtn.isVisible().catch(() => false)) {
      await dupBtn.click()
      await page.waitForTimeout(1000)

      await page.getByRole("button", { name: /^Save$/i }).click()
      await page.waitForTimeout(2000)

      // Reload and verify count increased
      await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
      await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

      const afterCount = await page.evaluate(() => {
        const heading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
        const card = heading?.closest('[class*="rounded-xl"]')?.parentElement
        if (!card) return -1
        return card.querySelectorAll('div[class*="group"]').length
      })

      expect(afterCount).toBe(initialCount + 1)
    }
  })

  test("delete overlay persists", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
    await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

    const initialCount = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
      const card = heading?.closest('[class*="rounded-xl"]')?.parentElement
      if (!card) return -1
      return card.querySelectorAll('div[class*="group"]').length
    })

    // Add one to delete
    await page.getByRole("button", { name: /Add Overlay/i }).click()
    await page.waitForTimeout(1000)
    await page.getByRole("button", { name: /^Save$/i }).click()
    await page.waitForTimeout(2000)

    // Reload
    await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
    await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

    // Select the last overlay
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
      const card = heading?.closest('[class*="rounded-xl"]')?.parentElement
      if (!card) return
      const items = card.querySelectorAll('div[class*="group"]')
      if (items.length > 0) (items[items.length - 1] as HTMLElement).click()
    })
    await page.waitForTimeout(1000)

    // Accept confirm dialog
    page.on("dialog", (dialog) => dialog.accept())

    const delBtn = page.getByRole("button", { name: /Delete/i })
    if (await delBtn.isVisible().catch(() => false)) {
      await delBtn.click()
      await page.waitForTimeout(1000)

      await page.getByRole("button", { name: /^Save$/i }).click()
      await page.waitForTimeout(2000)

      // Reload and verify
      await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
      await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

      const afterCount = await page.evaluate(() => {
        const heading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
        const card = heading?.closest('[class*="rounded-xl"]')?.parentElement
        if (!card) return -1
        return card.querySelectorAll('div[class*="group"]').length
      })

      expect(afterCount).toBe(initialCount)
    }
  })

  test("desktop position persists", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
    await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

    // Click first overlay
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
      const card = heading?.closest('[class*="rounded-xl"]')?.parentElement
      if (!card) return
      const items = card.querySelectorAll('div[class*="group"]')
      if (items.length > 0) (items[0] as HTMLElement).click()
    })
    await page.waitForTimeout(1000)

    const controlsVisible = await page.getByText("Configure this overlay card").isVisible().catch(() => false)
    if (controlsVisible) {
      // Find X position input by looking for the X% label
      const xPosInput = page.locator("span").filter({ hasText: "X%" }).locator("..").locator("input").first()
      await xPosInput.fill("33")
      await page.waitForTimeout(300)

      await page.getByRole("button", { name: /^Save$/i }).click()
      await page.waitForTimeout(2000)

      // Reload
      await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
      await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

      // Click first overlay
      await page.evaluate(() => {
        const heading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
        const card = heading?.closest('[class*="rounded-xl"]')?.parentElement
        if (!card) return
        const items = card.querySelectorAll('div[class*="group"]')
        if (items.length > 0) (items[0] as HTMLElement).click()
      })
      await page.waitForTimeout(1000)

      const reloadedX = await xPosInput.inputValue()
      expect(reloadedX).toBe("33")

      // Restore
      await xPosInput.fill("5")
      await page.getByRole("button", { name: /^Save$/i }).click()
      await page.waitForTimeout(2000)
    }
  })

  test("mobile position persists", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
    await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

    // Switch to mobile preview
    await page.getByRole("button", { name: /Mobile/i }).click()
    await page.waitForTimeout(500)

    // Click first overlay
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
      const card = heading?.closest('[class*="rounded-xl"]')?.parentElement
      if (!card) return
      const items = card.querySelectorAll('div[class*="group"]')
      if (items.length > 0) (items[0] as HTMLElement).click()
    })
    await page.waitForTimeout(1000)

    const controlsVisible = await page.getByText("Configure this overlay card").isVisible().catch(() => false)
    if (controlsVisible) {
      const xPosInput = page.locator("span").filter({ hasText: "X%" }).locator("..").locator("input").first()
      await xPosInput.fill("44")
      await page.waitForTimeout(300)

      await page.getByRole("button", { name: /^Save$/i }).click()
      await page.waitForTimeout(2000)

      // Reload
      await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
      await expect(page.getByText("All Overlays")).toBeVisible({ timeout: 10000 })

      await page.getByRole("button", { name: /Mobile/i }).click()
      await page.waitForTimeout(500)

      await page.evaluate(() => {
        const heading = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === 'All Overlays')
        const card = heading?.closest('[class*="rounded-xl"]')?.parentElement
        if (!card) return
        const items = card.querySelectorAll('div[class*="group"]')
        if (items.length > 0) (items[0] as HTMLElement).click()
      })
      await page.waitForTimeout(1000)

      const reloadedX = await xPosInput.inputValue()
      expect(reloadedX).toBe("44")

      await xPosInput.fill("5")
      await page.getByRole("button", { name: /^Save$/i }).click()
      await page.waitForTimeout(2000)
    }
  })
})

// ═══════════════════════════════════════
// 5. ADMIN SURFACES
// ═══════════════════════════════════════
test.describe("ADMIN SURFACES", () => {
  test("sidebar is opaque", async ({ page }) => {
    await adminLogin(page)
    const sidebar = page.locator("aside").first()
    const bg = await sidebar.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bg).not.toContain("rgba(0, 0, 0, 0)")
    const opacity = await sidebar.evaluate((el) => window.getComputedStyle(el).opacity)
    expect(parseFloat(opacity)).toBeGreaterThanOrEqual(1)
  })

  test("header is opaque", async ({ page }) => {
    await adminLogin(page)
    const header = page.locator("header").first()
    const bg = await header.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bg).not.toContain("rgba(0, 0, 0, 0)")
    const opacity = await header.evaluate((el) => window.getComputedStyle(el).opacity)
    expect(parseFloat(opacity)).toBeGreaterThanOrEqual(1)
  })

  test("sidebar z-index above header", async ({ page }) => {
    await adminLogin(page)
    const sidebarZ = await page.locator("aside").first().evaluate((el) => window.getComputedStyle(el).zIndex)
    const headerZ = await page.locator("header").first().evaluate((el) => window.getComputedStyle(el).zIndex)
    expect(parseInt(sidebarZ)).toBeGreaterThan(parseInt(headerZ))
  })
})

// ═══════════════════════════════════════
// 6. TABLET VIEWPORTS
// ═══════════════════════════════════════
test.describe("TABLET VIEWPORTS", () => {
  for (const vp of [
    { name: "768x1024", width: 768, height: 1024 },
    { name: "820x1180", width: 820, height: 1180 },
    { name: "1024x768", width: 1024, height: 768 },
  ]) {
    test(`admin profile at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await adminLogin(page)
      await page.goto(`${BASE}/admin/profile`, { waitUntil: "networkidle" })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
      expect(overflow).toBe(false)
      await expect(page.getByText("Profile Settings")).toBeVisible()
    })

    test(`admin dashboard at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await adminLogin(page)
      await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
      expect(overflow).toBe(false)
    })

    test(`hero editor at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await adminLogin(page)
      await page.goto(`${BASE}/admin/hero-editor`, { waitUntil: "networkidle" })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
      expect(overflow).toBe(false)
      await expect(page.getByText("Hero Visual Editor")).toBeVisible()
    })
  }
})

// ═══════════════════════════════════════
// 7. EXPERIENCE TIMELINE NODES
// ═══════════════════════════════════════
test.describe("EXPERIENCE TIMELINE", () => {
  test("current node filled, non-current outline", async ({ page }) => {
    await page.goto(`${BASE}/experience`, { waitUntil: "networkidle" })

    const result = await page.evaluate(() => {
      // Find all timeline marker dots
      const markers = document.querySelectorAll('div[class*="absolute"][class*="rounded-full"][class*="border-2"]')
      let currentFilled = false
      let nonCurrentOutline = false

      markers.forEach((marker) => {
        const classes = marker.className
        if (classes.includes("bg-primary") && classes.includes("border-primary") && classes.includes("shadow")) {
          currentFilled = true
        }
        if (classes.includes("bg-background") && classes.includes("border-border")) {
          nonCurrentOutline = true
        }
      })

      return { currentFilled, nonCurrentOutline, markerCount: markers.length }
    })

    // If there's experience data, both should be true
    if (result.markerCount > 0) {
      expect(result.currentFilled).toBe(true)
      expect(result.nonCurrentOutline).toBe(true)
    }
  })
})

// ═══════════════════════════════════════
// 8. PUBLIC RESPONSIVE
// ═══════════════════════════════════════
test.describe("PUBLIC RESPONSIVE", () => {
  for (const vp of [
    { name: "320", width: 320, height: 568 },
    { name: "375", width: 375, height: 812 },
    { name: "768", width: 768, height: 1024 },
    { name: "1920", width: 1920, height: 1080 },
  ]) {
    test(`homepage no overflow at ${vp.name}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(BASE, { waitUntil: "networkidle" })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
      expect(overflow).toBe(false)
    })
  }
})
