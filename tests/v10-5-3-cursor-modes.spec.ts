import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"

test.describe("V10.5.3 3-MODE CURSOR SYSTEM", () => {

  test("STETHOSCOPE MODE: cursor:none applied", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const cursor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).cursor
    })
    expect(cursor).toBe("none")
  })

  test("STETHOSCOPE MODE: SVG visible after mouse move", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    for (let i = 0; i < 8; i++) {
      await page.mouse.move(400 + i * 20, 400)
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(300)

    const svg = await page.evaluate(() => {
      const el = document.querySelector('svg[style*="will-change"]') as HTMLElement | null
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        opacity: parseFloat(el.style.opacity || "0"),
        width: Math.round(r.width),
        height: Math.round(r.height),
      }
    })
    expect(svg).not.toBeNull()
    expect(svg!.opacity).toBeGreaterThanOrEqual(0.8)
    expect(svg!.width).toBeGreaterThanOrEqual(36)
    expect(svg!.height).toBeGreaterThanOrEqual(36)
  })

  test("STETHOSCOPE MODE: no blue border (only inner icon)", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const hasBorder = await page.evaluate(() => {
      const svg = document.querySelector('svg[style*="will-change"]')
      if (!svg) return false
      const circles = svg.querySelectorAll('circle')
      for (const c of circles) {
        const r = parseFloat(c.getAttribute("r") || "0")
        if (r > 10) return true
      }
      return false
    })
    expect(hasBorder).toBe(false)
  })

  test("STETHOSCOPE MODE: follows pointer coordinates", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    await page.mouse.move(600, 400)
    await page.waitForTimeout(500)

    const pos = await page.evaluate(() => {
      const el = document.querySelector('svg[style*="will-change"]') as HTMLElement | null
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: Math.round(r.x), y: Math.round(r.y) }
    })
    expect(pos).not.toBeNull()
    expect(pos!.x).toBeGreaterThan(500)
    expect(pos!.x).toBeLessThan(700)
    expect(pos!.y).toBeGreaterThan(300)
    expect(pos!.y).toBeLessThan(500)
  })

  test("STETHOSCOPE MODE: pointer-events none", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const pe = await page.evaluate(() => {
      const el = document.querySelector('svg[style*="will-change"]')
      return el ? window.getComputedStyle(el).pointerEvents : null
    })
    expect(pe).toBe("none")
  })

  test("STETHOSCOPE MODE: click accuracy on Connect button", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(3000)

    const connectBtn = page.locator("a, button").filter({ hasText: "Connect" }).first()
    await connectBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    const box = await connectBtn.boundingBox()
    expect(box).not.toBeNull()

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.waitForTimeout(300)
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.waitForTimeout(1000)

    const url = page.url()
    expect(url).toContain("contact")
  })

  test("STETHOSCOPE MODE: click feedback scale", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    await page.mouse.move(600, 400)
    await page.waitForTimeout(300)

    await page.mouse.down()
    await page.waitForTimeout(50)

    const scaleDown = await page.evaluate(() => {
      const el = document.querySelector('svg[style*="will-change"]') as HTMLElement | null
      if (!el) return null
      const transform = el.style.transform
      const match = transform.match(/scale\(([^)]+)\)/)
      return match ? parseFloat(match[1]) : null
    })
    expect(scaleDown).toBe(0.92)

    await page.mouse.up()
    await page.waitForTimeout(200)

    const scaleUp = await page.evaluate(() => {
      const el = document.querySelector('svg[style*="will-change"]') as HTMLElement | null
      if (!el) return null
      const transform = el.style.transform
      const match = transform.match(/scale\(([^)]+)\)/)
      return match ? parseFloat(match[1]) : null
    })
    expect(scaleUp).toBe(1)
  })

  test("STETHOSCOPE MODE: 1-second fade when mouse stops", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    await page.mouse.move(600, 400)
    await page.waitForTimeout(500)

    const visible = await page.evaluate(() => {
      const el = document.querySelector('svg[style*="will-change"]') as HTMLElement | null
      return el ? parseFloat(el.style.opacity || "0") : -1
    })
    expect(visible).toBe(1)

    await page.waitForTimeout(1500)

    const faded = await page.evaluate(() => {
      const el = document.querySelector('svg[style*="will-change"]') as HTMLElement | null
      return el ? parseFloat(el.style.opacity || "0") : -1
    })
    expect(faded).toBe(0)
  })

  test("STETHOSCOPE MODE: dark mode bright colors", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.emulateMedia({ colorScheme: "dark" })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    for (let i = 0; i < 5; i++) {
      await page.mouse.move(500 + i * 20, 400)
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(200)

    const color = await page.evaluate(() => {
      const el = document.querySelector('svg[style*="will-change"]')
      if (!el) return null
      return window.getComputedStyle(el).color
    })
    expect(color).not.toBeNull()
  })

  test("ADMIN: normal cursor preserved", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto("http://localhost:3000/admin/settings", { waitUntil: "networkidle", timeout: 60000 })
    await page.waitForTimeout(2000)

    const cursor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).cursor
    })
    expect(cursor).not.toBe("none")

    const svg = await page.evaluate(() => {
      return !!document.querySelector('svg[style*="will-change"]')
    })
    expect(svg).toBe(false)
  })

  test("SCREENSHOT: stethoscope over hero", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(3000)

    for (let i = 0; i < 12; i++) {
      await page.mouse.move(400 + i * 25, 380 + Math.sin(i * 0.5) * 30)
      await page.waitForTimeout(50)
    }
    await page.waitForTimeout(200)

    await page.screenshot({ path: "test-results/v1053-stethoscope-hero.png", fullPage: false })
  })

  test("SCREENSHOT: stethoscope dark mode", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.emulateMedia({ colorScheme: "dark" })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(3000)

    for (let i = 0; i < 12; i++) {
      await page.mouse.move(400 + i * 25, 380 + Math.sin(i * 0.5) * 30)
      await page.waitForTimeout(50)
    }
    await page.waitForTimeout(200)

    await page.screenshot({ path: "test-results/v1053-stethoscope-dark.png", fullPage: false })
  })
})
