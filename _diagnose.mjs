import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

async function main() {
  await mkdir('D:/dr/screenshots', { recursive: true });
  const browser = await chromium.launch({ headless: true });

  // ===== PART 1: PUBLIC HOME JITTER + COLLAGE TEST =====
  console.log('\n===== PUBLIC HOME DIAGNOSTIC =====');
  const pubCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const pubPage = await pubCtx.newPage();

  await pubPage.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
  await pubPage.waitForTimeout(3000); // Wait for entrance animations

  // Screenshot home at 1920
  await pubPage.screenshot({ path: 'D:/dr/screenshots/home-1920.png', fullPage: true });
  console.log('home-1920.png saved');

  // JITTER TEST: Record spotlight bounding box 5 times with 500ms intervals
  console.log('\n--- JITTER TEST (5 measurements, 500ms apart) ---');
  const jitterResults = [];
  for (let i = 0; i < 5; i++) {
    const box = await pubPage.evaluate(() => {
      const sections = document.querySelectorAll('section');
      for (const s of sections) {
        if (s.textContent?.includes('Professional Spotlight') || s.textContent?.includes('Trusted Clinical')) {
          const r = s.getBoundingClientRect();
          return { top: r.top, height: r.height, bottom: r.bottom, width: r.width };
        }
      }
      return null;
    });
    jitterResults.push(box);
    console.log(`  Measurement ${i + 1}: top=${box?.top?.toFixed(1)} height=${box?.height?.toFixed(1)} bottom=${box?.bottom?.toFixed(1)}`);
    if (i < 4) await pubPage.waitForTimeout(500);
  }

  // Check for jitter
  const tops = jitterResults.map(b => b?.top);
  const heights = jitterResults.map(b => b?.height);
  const topVar = Math.max(...tops) - Math.min(...tops);
  const heightVar = Math.max(...heights) - Math.min(...heights);
  console.log(`  Top variance: ${topVar.toFixed(2)}px`);
  console.log(`  Height variance: ${heightVar.toFixed(2)}px`);
  console.log(`  JITTER: ${topVar > 1 || heightVar > 1 ? 'DETECTED' : 'STABLE'}`);

  // Check collage visibility
  console.log('\n--- COLLAGE VISIBILITY ---');
  const collageInfo = await pubPage.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    const spotlightImgs = [];
    for (const img of imgs) {
      const parent = img.closest('section');
      if (parent && (parent.textContent?.includes('Professional Spotlight') || parent.textContent?.includes('Trusted Clinical'))) {
        const r = img.getBoundingClientRect();
        const style = window.getComputedStyle(img);
        spotlightImgs.push({
          src: img.src.substring(0, 80),
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: r.width,
          displayHeight: r.height,
          visible: r.width > 0 && r.height > 0,
          opacity: style.opacity,
          display: style.display,
        });
      }
    }
    return spotlightImgs;
  });
  console.log(`  Photos found in spotlight: ${collageInfo.length}`);
  collageInfo.forEach((img, i) => {
    console.log(`  Photo ${i + 1}: ${img.naturalWidth}x${img.naturalHeight} visible=${img.visible} display=${img.displayWidth.toFixed(0)}x${img.displayHeight.toFixed(0)}`);
  });

  // Check for horizontal scrollbar
  console.log('\n--- PUBLIC HORIZONTAL OVERFLOW ---');
  const pubOverflow = await pubPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    bodyClientWidth: document.body.clientWidth,
  }));
  console.log(`  scrollWidth: ${pubOverflow.scrollWidth}, clientWidth: ${pubOverflow.clientWidth}`);
  console.log(`  Horizontal overflow: ${pubOverflow.scrollWidth > pubOverflow.clientWidth ? 'YES' : 'NO'}`);

  // Check gap after spotlight
  console.log('\n--- GAP AFTER SPOTLIGHT ---');
  const gapInfo = await pubPage.evaluate(() => {
    const sections = document.querySelectorAll('section');
    let spotlightBottom = 0;
    let nextSectionTop = Infinity;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (s.textContent?.includes('Trusted Clinical')) {
        spotlightBottom = r.bottom + window.scrollY;
      }
    }
    // Find the next visible element after spotlight
    const allElements = document.querySelectorAll('section, [class*="hero"], [class*="Hero"]');
    for (const el of allElements) {
      const r = el.getBoundingClientRect();
      const absTop = r.top + window.scrollY;
      if (absTop > spotlightBottom + 10) {
        nextSectionTop = Math.min(nextSectionTop, absTop);
      }
    }
    return { spotlightBottom, nextSectionTop, gap: nextSectionTop - spotlightBottom };
  });
  console.log(`  Spotlight bottom: ${gapInfo.spotlightBottom?.toFixed(0)}px`);
  console.log(`  Next section top: ${gapInfo.nextSectionTop === Infinity ? 'N/A' : gapInfo.nextSectionTop?.toFixed(0) + 'px'}`);
  console.log(`  Gap: ${gapInfo.gap === Infinity ? 'N/A' : gapInfo.gap?.toFixed(0) + 'px'}`);

  await pubCtx.close();

  // ===== PART 2: ADMIN SPOTLIGHT OVERFLOW + RESPONSIVE TEST =====
  console.log('\n===== ADMIN SPOTLIGHT DIAGNOSTIC =====');
  const adminCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const adminPage = await adminCtx.newPage();

  // Login
  await adminPage.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
  await adminPage.waitForTimeout(1500);
  await adminPage.click('#email');
  await adminPage.keyboard.type('admin@example.com', { delay: 30 });
  await adminPage.click('#password');
  await adminPage.keyboard.type('admin123', { delay: 30 });
  await adminPage.waitForTimeout(500);
  await adminPage.click('button[type="submit"]:has-text("Sign In")');
  try { await adminPage.waitForURL('**/admin/**', { timeout: 15000 }); } catch {}
  await adminPage.waitForTimeout(2000);

  // Go to spotlight
  await adminPage.goto('http://localhost:3000/admin/spotlight', { waitUntil: 'networkidle', timeout: 30000 });
  await adminPage.waitForTimeout(3000);

  // Overflow test at multiple viewports
  const viewports = [
    { w: 1024, h: 768 },
    { w: 1280, h: 720 },
    { w: 1366, h: 768 },
    { w: 1440, h: 900 },
    { w: 1536, h: 864 },
    { w: 1920, h: 1080 },
    { w: 2560, h: 1440 },
  ];

  for (const vp of viewports) {
    await adminPage.setViewportSize({ width: vp.w, height: vp.h });
    await adminPage.waitForTimeout(1500);

    const overflow = await adminPage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    const hasOverflow = overflow.scrollWidth > overflow.clientWidth + 1;
    console.log(`\n  ${vp.w}x${vp.h}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth} overflow=${hasOverflow ? 'YES !!' : 'NO'}`);

    // Find overflowing element if any
    if (hasOverflow) {
      const overflowing = await adminPage.evaluate((vpWidth) => {
        const results = [];
        const walk = (el) => {
          const r = el.getBoundingClientRect();
          if (r.right > vpWidth + 1 || r.left < -1) {
            results.push({
              tag: el.tagName,
              class: el.className?.substring?.(0, 80) || '',
              right: r.right.toFixed(1),
              left: r.left.toFixed(1),
              width: r.width.toFixed(1),
            });
          }
          for (const child of el.children) walk(child);
        };
        walk(document.body);
        return results.slice(0, 10);
      }, vp.w);
      console.log(`    Overflowing elements:`);
      overflowing.forEach(e => console.log(`      <${e.tag}> right=${e.right} left=${e.left} width=${e.width} class="${e.class}"`));
    }

    await adminPage.screenshot({ path: `D:/dr/screenshots/admin-spotlight-${vp.w}.png`, fullPage: false });
  }

  await adminCtx.close();
  await browser.close();
  console.log('\n===== DONE =====');
}

main().catch(console.error);
