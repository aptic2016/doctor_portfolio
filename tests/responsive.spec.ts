import { test, expect } from "@playwright/test"

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/experience",
  "/education",
  "/qualifications",
  "/publications",
  "/articles",
  "/gallery",
  "/contact",
]

const ADMIN_ROUTES = ["/admin/login"]

const VIEWPORTS = [
  { name: "320x568", width: 320, height: 568 },
  { name: "375x812", width: 375, height: 812 },
  { name: "430x932", width: 430, height: 932 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "2560x1440", width: 2560, height: 1440 },
]

const THEME_VIEWPORTS = [
  { name: "375x812", width: 375, height: 812 },
  { name: "1366x768", width: 1366, height: 768 },
]

async function checkNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => {
    const scrollW = document.documentElement.scrollWidth
    const clientW = document.documentElement.clientWidth
    return { scrollW, clientW, hasOverflow: scrollW > clientW + 1 }
  })
  return overflow
}

for (const vp of VIEWPORTS) {
  for (const route of PUBLIC_ROUTES) {
    test(`PUBLIC ${route} @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      const response = await page.goto(route, { waitUntil: "networkidle" })
      expect(response?.status()).toBe(200)

      const consoleErrors: string[] = []
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text())
      })

      const body = page.locator("body")
      await expect(body).toBeVisible()

      const overflow = await checkNoHorizontalOverflow(page)
      if (overflow.hasOverflow) {
        console.log(`OVERFLOW: ${route} @ ${vp.name}: scrollWidth=${overflow.scrollW} clientWidth=${overflow.clientW}`)
      }
      expect(overflow.hasOverflow, `Horizontal overflow: scrollWidth=${overflow.scrollW} > clientWidth=${overflow.clientW}`).toBe(false)
    })
  }
}

for (const vp of VIEWPORTS) {
  for (const route of ADMIN_ROUTES) {
    test(`ADMIN ${route} @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      const response = await page.goto(route, { waitUntil: "networkidle" })
      expect(response?.status()).toBe(200)

      const body = page.locator("body")
      await expect(body).toBeVisible()

      const overflow = await checkNoHorizontalOverflow(page)
      if (overflow.hasOverflow) {
        console.log(`OVERFLOW: ${route} @ ${vp.name}: scrollWidth=${overflow.scrollW} clientWidth=${overflow.clientW}`)
      }
      expect(overflow.hasOverflow, `Horizontal overflow: scrollWidth=${overflow.scrollW} > clientWidth=${overflow.clientW}`).toBe(false)

      const form = page.locator("form")
      if (await form.count() > 0) {
        const formBox = await form.first().boundingBox()
        if (formBox) {
          expect(formBox.width).toBeLessThanOrEqual(vp.width)
        }
      }
    })
  }
}

for (const vp of THEME_VIEWPORTS) {
  test(`LIGHT theme @ ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto("/", { waitUntil: "networkidle" })

    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor
    })
    console.log(`Light bg: ${bgColor}`)
    expect(bgColor).toBeTruthy()
  })

  test(`DARK theme @ ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.emulateMedia({ colorScheme: "dark" })
    await page.goto("/", { waitUntil: "networkidle" })

    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor
    })
    console.log(`Dark bg: ${bgColor}`)
    expect(bgColor).toBeTruthy()
  })
}

test("Mobile fixed UI: no collision between bottom dock and AI button @ 375x812", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/", { waitUntil: "networkidle" })

  const dock = page.locator("[class*='fixed bottom-0']")
  const aiBtn = page.locator("button[class*='fixed bottom-']")

  if (await dock.count() > 0 && await aiBtn.count() > 0) {
    const dockBox = await dock.first().boundingBox()
    const aiBox = await aiBtn.first().boundingBox()
    if (dockBox && aiBox) {
      const dockTop = dockBox.y
      const aiBottom = aiBox.y + aiBox.height
      expect(aiBottom).toBeLessThanOrEqual(dockTop + 5)
    }
  }
})

test("Hero mobile: portrait-first layout @ 375x812", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/", { waitUntil: "networkidle" })

  const hero = page.locator("section").first()
  if (await hero.count() > 0) {
    const heroBox = await hero.boundingBox()
    if (heroBox) {
      expect(heroBox.width).toBeLessThanOrEqual(375)
    }
  }
})

test("Admin login fits viewport @ 320", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto("/admin/login", { waitUntil: "networkidle" })

  const body = page.locator("body")
  await expect(body).toBeVisible()

  const overflow = await checkNoHorizontalOverflow(page)
  expect(overflow.hasOverflow, `Admin login overflow at 320px`).toBe(false)
})

test("Admin login fits viewport @ 375", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/admin/login", { waitUntil: "networkidle" })

  const body = page.locator("body")
  await expect(body).toBeVisible()

  const overflow = await checkNoHorizontalOverflow(page)
  expect(overflow.hasOverflow, `Admin login overflow at 375px`).toBe(false)
})

test("Admin login fits viewport @ 768", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto("/admin/login", { waitUntil: "networkidle" })

  const body = page.locator("body")
  await expect(body).toBeVisible()

  const overflow = await checkNoHorizontalOverflow(page)
  expect(overflow.hasOverflow, `Admin login overflow at 768px`).toBe(false)
})

test("Admin login fits viewport @ 1366", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto("/admin/login", { waitUntil: "networkidle" })

  const body = page.locator("body")
  await expect(body).toBeVisible()

  const overflow = await checkNoHorizontalOverflow(page)
  expect(overflow.hasOverflow, `Admin login overflow at 1366px`).toBe(false)
})
