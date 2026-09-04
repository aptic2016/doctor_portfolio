import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"

test.describe("V10.5.3 CAPSULE MODE", () => {

  test("CAPSULE: cursor:none applied", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const cursor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).cursor
    })
    expect(cursor).toBe("none")
  })

  test("CAPSULE: SVG visible with capsule shape", async ({ page }) => {
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
      const rects = el.querySelectorAll('rect')
      return {
        opacity: parseFloat(el.style.opacity || "0"),
        width: Math.round(r.width),
        height: Math.round(r.height),
        hasRect: rects.length > 0,
      }
    })
    expect(svg).not.toBeNull()
    expect(svg!.opacity).toBeGreaterThanOrEqual(0.8)
    expect(svg!.width).toBeGreaterThanOrEqual(36)
    expect(svg!.height).toBeGreaterThanOrEqual(36)
    expect(svg!.hasRect).toBe(true)
  })

  test("CAPSULE: follows pointer coordinates", async ({ page }) => {
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
  })

  test("CAPSULE: click feedback scale", async ({ page }) => {
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
  })

  test("CAPSULE: 1-second fade", async ({ page }) => {
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

  test("SCREENSHOT: capsule over hero", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(3000)

    for (let i = 0; i < 12; i++) {
      await page.mouse.move(400 + i * 25, 380 + Math.sin(i * 0.5) * 30)
      await page.waitForTimeout(50)
    }
    await page.waitForTimeout(200)

    await page.screenshot({ path: "test-results/v1053-capsule-hero.png", fullPage: false })
  })

  test("SCREENSHOT: capsule dark mode", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.emulateMedia({ colorScheme: "dark" })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(3000)

    for (let i = 0; i < 12; i++) {
      await page.mouse.move(400 + i * 25, 380 + Math.sin(i * 0.5) * 30)
      await page.waitForTimeout(50)
    }
    await page.waitForTimeout(200)

    await page.screenshot({ path: "test-results/v1053-capsule-dark.png", fullPage: false })
  })
})
