import { test } from "@playwright/test"

test("debug section reveals", async ({ page }) => {
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" })
  await page.waitForTimeout(500)

  // Before scroll
  const before = await page.evaluate(() => {
    const all = document.querySelectorAll('div[style]')
    const withOpacity: Array<{opacity: string; transform: string; text: string}> = []
    all.forEach(el => {
      const s = el as HTMLElement
      if (s.style.opacity !== undefined && s.style.opacity !== "" && s.style.transform?.includes("translateY")) {
        withOpacity.push({
          opacity: s.style.opacity,
          transform: s.style.transform,
          text: s.textContent?.substring(0, 30) || "",
        })
      }
    })
    return { count: withOpacity.length, first5: withOpacity.slice(0, 5) }
  })
  console.log("BEFORE SCROLL:", JSON.stringify(before, null, 2))

  // Scroll to experience
  await page.evaluate(() => window.scrollTo(0, 800))
  await page.waitForTimeout(2000)

  const after = await page.evaluate(() => {
    const all = document.querySelectorAll('div[style]')
    const withOpacity: Array<{opacity: string; transform: string; text: string}> = []
    all.forEach(el => {
      const s = el as HTMLElement
      if (s.style.opacity !== undefined && s.style.opacity !== "" && s.style.transform?.includes("translateY")) {
        withOpacity.push({
          opacity: s.style.opacity,
          transform: s.style.transform,
          text: s.textContent?.substring(0, 30) || "",
        })
      }
    })
    return { count: withOpacity.length, first5: withOpacity.slice(0, 5) }
  })
  console.log("AFTER SCROLL:", JSON.stringify(after, null, 2))
})
