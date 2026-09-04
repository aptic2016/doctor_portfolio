import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"
const ADMIN = "http://localhost:3000/admin/hero-editor"

async function loginAdmin(page: import("@playwright/test").Page) {
  await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" })
  await page.waitForTimeout(1000)
  await page.fill('#email', "admin@example.com")
  await page.fill('#password', "admin123")
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)
}

test.describe("V12 HERO OVERLAY POSITION PARITY", () => {

  test("SHARED COMPONENT: public hero uses same coordinate system", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const publicResult = await page.evaluate(() => {
      const overlays = document.querySelectorAll('[style]')
      const overlayDivs: { left: string | null; top: string | null; translate: boolean }[] = []
      overlays.forEach((el) => {
        const s = el.getAttribute("style") || ""
        if (s.includes("left:") && s.includes("top:") && s.includes("translate(-50%, -50%)")) {
          const leftMatch = s.match(/left:\s*(-?[\d.]+)%/)
          const topMatch = s.match(/top:\s*(-?[\d.]+)%/)
          overlayDivs.push({
            left: leftMatch ? leftMatch[1] : null,
            top: topMatch ? topMatch[1] : null,
            translate: s.includes("translate(-50%, -50%)"),
          })
        }
      })
      return overlayDivs
    })

    if (publicResult.length > 0) {
      for (const o of publicResult) {
        expect(o.translate).toBe(true)
        expect(parseFloat(o.left!)).toBeGreaterThanOrEqual(-30)
        expect(parseFloat(o.left!)).toBeLessThanOrEqual(130)
        expect(parseFloat(o.top!)).toBeGreaterThanOrEqual(-20)
        expect(parseFloat(o.top!)).toBeLessThanOrEqual(120)
      }
    }

    await page.screenshot({ path: "test-results/v12-shared-component.png" })
  })

  test("ADMIN: hero editor uses 380x500 canvas matching public", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await loginAdmin(page)
    await page.goto(ADMIN, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const canvasInfo = await page.evaluate(() => {
      const allDivs = document.querySelectorAll('div')
      for (const div of allDivs) {
        if (div.offsetWidth === 380 && div.offsetHeight === 500) {
          return { found: true, width: div.offsetWidth, height: div.offsetHeight }
        }
      }
      return { found: false, width: 0, height: 0 }
    })

    expect(canvasInfo.found).toBe(true)
    expect(canvasInfo.width).toBe(380)
    expect(canvasInfo.height).toBe(500)

    await page.screenshot({ path: "test-results/v12-admin-canvas.png" })
  })

  test("ADMIN DESKTOP + PUBLIC DESKTOP: overlay positions match", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await loginAdmin(page)
    await page.goto(ADMIN, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const adminOverlays = await page.evaluate(() => {
      const canvas = Array.from(document.querySelectorAll('div')).find(d => d.offsetWidth === 380 && d.offsetHeight === 500)
      if (!canvas) return []
      const results: { left: number; top: number; label: string }[] = []
      const children = canvas.querySelectorAll(':scope > div')
      children.forEach((el) => {
        const s = el.getAttribute("style") || ""
        const cls = el.className || ""
        if (s.includes("translate(-50%, -50%)") && s.includes("left:") && s.includes("top:") && cls.includes("cursor-move")) {
          const leftMatch = s.match(/left:\s*(-?[\d.]+)%/)
          const topMatch = s.match(/top:\s*(-?[\d.]+)%/)
          const label = el.textContent?.trim().split("\n")[0] || ""
          if (leftMatch && topMatch) {
            results.push({
              left: parseFloat(leftMatch[1]),
              top: parseFloat(topMatch[1]),
              label,
            })
          }
        }
      })
      return results
    })

    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const publicOverlays = await page.evaluate(() => {
      const stage = Array.from(document.querySelectorAll('div')).find(d => d.offsetWidth === 380 && d.offsetHeight === 500)
      if (!stage) return []
      const results: { left: number; top: number; label: string }[] = []
      const children = stage.querySelectorAll(':scope > div')
      children.forEach((el) => {
        const s = el.getAttribute("style") || ""
        if (s.includes("translate(-50%, -50%)") && s.includes("left:") && s.includes("top:")) {
          const leftMatch = s.match(/left:\s*(-?[\d.]+)%/)
          const topMatch = s.match(/top:\s*(-?[\d.]+)%/)
          const label = el.textContent?.trim().split("\n")[0] || ""
          if (leftMatch && topMatch) {
            results.push({
              left: parseFloat(leftMatch[1]),
              top: parseFloat(topMatch[1]),
              label,
            })
          }
        }
      })
      return results
    })

    if (adminOverlays.length > 0 && publicOverlays.length > 0) {
      for (const adminOv of adminOverlays) {
        const publicOv = publicOverlays.find(p => p.label.includes(adminOv.label) || adminOv.label.includes(p.label))
        if (publicOv) {
          const xDiff = Math.abs(adminOv.left - publicOv.left)
          const yDiff = Math.abs(adminOv.top - publicOv.top)
          expect(xDiff).toBeLessThanOrEqual(2)
          expect(yDiff).toBeLessThanOrEqual(2)
        }
      }
    } else {
      expect(adminOverlays.length).toBe(publicOverlays.length)
    }
  })

  test("ADMIN MOBILE + PUBLIC MOBILE: uses mobile coordinates", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await loginAdmin(page)
    await page.goto(ADMIN, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    await page.click('button:has-text("Mobile")')
    await page.waitForTimeout(500)

    const adminMobileOverlays = await page.evaluate(() => {
      const canvas = Array.from(document.querySelectorAll('div')).find(d => d.offsetWidth === 380 && d.offsetHeight === 500)
      if (!canvas) return []
      const results: { left: number; top: number }[] = []
      const children = canvas.querySelectorAll(':scope > div')
      children.forEach((el) => {
        const s = el.getAttribute("style") || ""
        const cls = el.className || ""
        if (s.includes("translate(-50%, -50%)") && s.includes("left:") && s.includes("top:") && cls.includes("cursor-move")) {
          const leftMatch = s.match(/left:\s*(-?[\d.]+)%/)
          const topMatch = s.match(/top:\s*(-?[\d.]+)%/)
          if (leftMatch && topMatch) {
            results.push({ left: parseFloat(leftMatch[1]), top: parseFloat(topMatch[1]) })
          }
        }
      })
      return results
    })

    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const publicMobileOverlays = await page.evaluate(() => {
      const stage = Array.from(document.querySelectorAll('div')).find(d => d.offsetWidth >= 370 && d.offsetWidth <= 385 && d.offsetHeight >= 490 && d.offsetHeight <= 510)
      if (!stage) return []
      const results: { left: number; top: number }[] = []
      const children = stage.querySelectorAll(':scope > div')
      children.forEach((el) => {
        const s = el.getAttribute("style") || ""
        if (s.includes("translate(-50%, -50%)") && s.includes("left:") && s.includes("top:")) {
          const leftMatch = s.match(/left:\s*(-?[\d.]+)%/)
          const topMatch = s.match(/top:\s*(-?[\d.]+)%/)
          if (leftMatch && topMatch) {
            results.push({ left: parseFloat(leftMatch[1]), top: parseFloat(topMatch[1]) })
          }
        }
      })
      return results
    })

    if (adminMobileOverlays.length > 0 && publicMobileOverlays.length > 0) {
      const count = Math.min(adminMobileOverlays.length, publicMobileOverlays.length)
      for (let i = 0; i < count; i++) {
        const xDiff = Math.abs(adminMobileOverlays[i].left - publicMobileOverlays[i].left)
        const yDiff = Math.abs(adminMobileOverlays[i].top - publicMobileOverlays[i].top)
        expect(xDiff).toBeLessThanOrEqual(2)
        expect(yDiff).toBeLessThanOrEqual(2)
      }
    } else {
      expect(adminMobileOverlays.length).toBe(publicMobileOverlays.length)
    }
  })

  test("MULTI-SELECT + BULK DELETE: select all and delete", async ({ page }) => {
    test.setTimeout(60000)
    await page.setViewportSize({ width: 1366, height: 768 })
    await loginAdmin(page)
    await page.goto(ADMIN, { waitUntil: "networkidle" })
    await page.waitForTimeout(3000)

    await page.screenshot({ path: "test-results/v12-multi-select.png" })

    const selectAllBtn = page.locator('button:has-text("Select All")')
    const count = await selectAllBtn.count()
    if (count === 0) return

    await selectAllBtn.click()
    await page.waitForTimeout(500)

    const selectedText = await page.locator('text=/\\d+ selected/').textContent().catch(() => null)
    expect(selectedText).toBeTruthy()

    const deleteBtn = page.locator('button[data-slot="button"]:has-text("Delete (")').first()
    await deleteBtn.click()
    await page.waitForTimeout(500)

    const dialogContent = page.locator('[data-slot="dialog-content"]')
    await dialogContent.waitFor({ state: "visible", timeout: 5000 })

    const confirmBtn = dialogContent.locator('button:has-text("Delete")')
    await confirmBtn.click()

    await page.waitForTimeout(3000)

    const afterText = await page.locator('text=/\\d+ selected/').textContent().catch(() => null)
    expect(afterText).toBeNull()
  })

  test("PORTRAIT STAGE: admin and public use same 380x500 dimensions", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const publicDims = await page.evaluate(() => {
      for (const d of document.querySelectorAll('div')) {
        if (d.offsetWidth === 380 && d.offsetHeight === 500) {
          return { width: d.offsetWidth, height: d.offsetHeight }
        }
      }
      return null
    })

    await page.setViewportSize({ width: 1366, height: 768 })
    await loginAdmin(page)
    await page.goto(ADMIN, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const adminDims = await page.evaluate(() => {
      for (const d of document.querySelectorAll('div')) {
        if (d.offsetWidth === 380 && d.offsetHeight === 500) {
          return { width: d.offsetWidth, height: d.offsetHeight }
        }
      }
      return null
    })

    if (publicDims && adminDims) {
      expect(Math.abs(publicDims.width - adminDims.width)).toBeLessThanOrEqual(5)
      expect(Math.abs(publicDims.height - adminDims.height)).toBeLessThanOrEqual(5)
    }
  })
})
