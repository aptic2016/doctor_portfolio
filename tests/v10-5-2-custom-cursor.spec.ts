import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"

test.describe("V10.5.2 CUSTOM STETHOSCOPE CURSOR", () => {

  test("SETTING ON: cursor:none applied to body", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const cursor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).cursor
    })
    expect(cursor).toBe("none")
  })

  test("SETTING ON: custom SVG visible after mouse move", async ({ page }) => {
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
    expect(svg!.width).toBe(36)
    expect(svg!.height).toBe(36)
  })

  test("SETTING ON: normal cursor hidden", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })

    const bodyCursor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).cursor
    })
    expect(bodyCursor).toBe("none")

    const htmlCursor = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).cursor
    })
    expect(htmlCursor).toBe("none")
  })

  test("SETTING ON: custom cursor follows pointer coordinates", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    await page.mouse.move(600, 400)
    await page.waitForTimeout(500)

    const pos = await page.evaluate(() => {
      const el = document.querySelector('svg[style*="will-change"]') as HTMLElement | null
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
    })
    expect(pos).not.toBeNull()
    expect(pos!.x).toBeGreaterThan(500)
    expect(pos!.x).toBeLessThan(700)
    expect(pos!.y).toBeGreaterThan(300)
    expect(pos!.y).toBeLessThan(500)
  })

  test("SETTING ON: pointer-events none on SVG", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const pe = await page.evaluate(() => {
      const el = document.querySelector('svg[style*="will-change"]')
      return el ? window.getComputedStyle(el).pointerEvents : null
    })
    expect(pe).toBe("none")
  })

  test("SETTING ON: z-index above all content", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const z = await page.evaluate(() => {
      const wrapper = document.querySelector('[aria-hidden="true"]')
      if (!wrapper) return 0
      return parseInt(window.getComputedStyle(wrapper).zIndex || "0")
    })
    expect(z).toBeGreaterThanOrEqual(9999)
  })

  test("SETTING ON: click accuracy - Connect button clickable", async ({ page }) => {
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

  test("SETTING ON: click feedback scale", async ({ page }) => {
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
    expect(scaleDown).toBe(0.88)

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

  test("SETTING ON: hover feedback on interactive elements", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const connectBtn = page.locator("a, button").filter({ hasText: "Connect" }).first()
    await connectBtn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    const box = await connectBtn.boundingBox()
    expect(box).not.toBeNull()

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.waitForTimeout(300)

    const scale = await page.evaluate(() => {
      const el = document.querySelector('svg[style*="will-change"]') as HTMLElement | null
      if (!el) return null
      const transform = el.style.transform
      const match = transform.match(/scale\(([^)]+)\)/)
      return match ? parseFloat(match[1]) : null
    })
    expect(scale).toBe(1.12)
  })

  test("SETTING ON: 1-second fade when mouse stops", async ({ page }) => {
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

  test("SCREENSHOT: cursor visible over hero area", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(3000)

    for (let i = 0; i < 12; i++) {
      await page.mouse.move(400 + i * 25, 380 + Math.sin(i * 0.5) * 30)
      await page.waitForTimeout(50)
    }
    await page.waitForTimeout(200)

    await page.screenshot({ path: "test-results/v1052-cursor-hero.png", fullPage: false })
  })

  test("SCREENSHOT: cursor in dark mode", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.emulateMedia({ colorScheme: "dark" })
    await page.goto(BASE, { waitUntil: "networkidle" })
    await page.waitForTimeout(3000)

    for (let i = 0; i < 12; i++) {
      await page.mouse.move(400 + i * 25, 380 + Math.sin(i * 0.5) * 30)
      await page.waitForTimeout(50)
    }
    await page.waitForTimeout(200)

    await page.screenshot({ path: "test-results/v1052-cursor-dark.png", fullPage: false })
  })
})
