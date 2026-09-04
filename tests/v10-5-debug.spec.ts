import { test } from "@playwright/test"

const BASE = "http://localhost:3000"

test("DEBUG: full browser runtime state", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(1000)

  // 1. Check media queries
  const mediaState = await page.evaluate(() => {
    return {
      pointerFine: window.matchMedia("(pointer: fine)").matches,
      hoverHover: window.matchMedia("(hover: hover)").matches,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      maxTouchPoints: navigator.maxTouchPoints,
    }
  })
  console.log("=== MEDIA QUERIES ===")
  console.log(JSON.stringify(mediaState, null, 2))

  // 2. Check if stethoscope SVG exists in DOM
  const stethState = await page.evaluate(() => {
    const svg64 = document.querySelector('svg[width="64"][height="64"]') as HTMLElement | null
    const svgAny = document.querySelectorAll('svg[aria-hidden="true"]')
    const allFixed = document.querySelectorAll('.fixed')
    return {
      svg64Exists: !!svg64,
      svg64Opacity: svg64?.style.opacity,
      svg64Transform: svg64?.style.transform,
      svg64ZIndex: svg64 ? window.getComputedStyle(svg64).zIndex : null,
      svg64PointerEvents: svg64 ? window.getComputedStyle(svg64).pointerEvents : null,
      svg64Display: svg64 ? window.getComputedStyle(svg64).display : null,
      svg64Visibility: svg64 ? window.getComputedStyle(svg64).visibility : null,
      svg64Position: svg64 ? window.getComputedStyle(svg64).position : null,
      svg64Width: svg64?.getAttribute("width"),
      svgAnyCount: svgAny.length,
      fixedCount: allFixed.length,
    }
  })
  console.log("=== STETHOSCOPE STATE ===")
  console.log(JSON.stringify(stethState, null, 2))

  // 3. Check motion settings from page props
  const motionState = await page.evaluate(() => {
    // Check if any data attributes or script tags contain motion settings
    const scripts = Array.from(document.querySelectorAll('script'))
    const motionScripts = scripts.filter(s => s.textContent?.includes('motionLevel') || s.textContent?.includes('cursorReactive'))
    return {
      motionScriptCount: motionScripts.length,
      bodyClasses: document.body.className,
      htmlClasses: document.documentElement.className,
    }
  })
  console.log("=== MOTION STATE ===")
  console.log(JSON.stringify(motionState, null, 2))

  // 4. Check section reveal state
  const sectionState = await page.evaluate(() => {
    const sections = document.querySelectorAll('section')
    const revealDivs = document.querySelectorAll('div[style*="opacity"]')
    const results: Array<{index: number; opacity: string; transform: string; text: string}> = []
    revealDivs.forEach((el, i) => {
      if (i < 10) {
        const s = el as HTMLElement
        results.push({
          index: i,
          opacity: s.style.opacity,
          transform: s.style.transform,
          text: s.textContent?.substring(0, 40) || "",
        })
      }
    })
    return {
      sectionCount: sections.length,
      revealDivCount: revealDivs.length,
      firstReveals: results,
    }
  })
  console.log("=== SECTION STATE ===")
  console.log(JSON.stringify(sectionState, null, 2))

  // 5. Check hero overlays
  const heroState = await page.evaluate(() => {
    const overlays = document.querySelectorAll('.glass-surface, [class*="rounded-lg"][class*="absolute"]')
    const heroPocketDivs = document.querySelectorAll('[style*="left:"][style*="top:"]')
    return {
      overlayCount: overlays.length,
      heroPocketCount: heroPocketDivs.length,
      firstOverlay: overlays[0] ? {
        opacity: (overlays[0] as HTMLElement).style.opacity,
        transform: (overlays[0] as HTMLElement).style.transform,
        filter: (overlays[0] as HTMLElement).style.filter,
        transition: (overlays[0] as HTMLElement).style.transition,
      } : null,
    }
  })
  console.log("=== HERO OVERLAY STATE ===")
  console.log(JSON.stringify(heroState, null, 2))

  // 6. Check ECG
  const ecgState = await page.evaluate(() => {
    const ecg = document.querySelector('.ecg-draw') as SVGElement | null
    return {
      ecgExists: !!ecg,
      ecgClass: ecg?.getAttribute("class"),
    }
  })
  console.log("=== ECG STATE ===")
  console.log(JSON.stringify(ecgState, null, 2))

  // 7. Check connect cue
  const cueState = await page.evaluate(() => {
    const cue = document.querySelector('.connect-cue')
    return {
      cueExists: !!cue,
      cueVisible: cue ? window.getComputedStyle(cue).display !== "none" : false,
    }
  })
  console.log("=== CONNECT CUE STATE ===")
  console.log(JSON.stringify(cueState, null, 2))

  // 8. Screenshot
  await page.screenshot({ path: "test-results/debug-initial.png", fullPage: false })
  console.log("Screenshot saved: test-results/debug-initial.png")

  // 9. Move mouse and check stethoscope
  await page.mouse.move(500, 400)
  await page.waitForTimeout(300)

  const stethAfterMove = await page.evaluate(() => {
    const svg64 = document.querySelector('svg[width="64"][height="64"]') as HTMLElement | null
    return {
      exists: !!svg64,
      opacity: svg64?.style.opacity,
      transform: svg64?.style.transform,
      boundingBox: svg64 ? svg64.getBoundingClientRect() : null,
    }
  })
  console.log("=== STETHOSCOPE AFTER MOVE ===")
  console.log(JSON.stringify(stethAfterMove, null, 2))

  await page.screenshot({ path: "test-results/debug-after-move.png", fullPage: false })
  console.log("Screenshot saved: test-results/debug-after-move.png")
})
