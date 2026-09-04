import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

async function main() {
  await mkdir('D:/dr/screenshots', { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // ===== PUBLIC DEEP DIAGNOSTIC =====
  console.log('\n===== PUBLIC DEEP DIAGNOSTIC =====');
  const pubCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const pubPage = await pubCtx.newPage();

  await pubPage.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
  await pubPage.waitForTimeout(4000);

  // Check spotlight section DOM in detail
  const spotlightDetail = await pubPage.evaluate(() => {
    const sections = document.querySelectorAll('section');
    let spotlightSection = null;
    for (const s of sections) {
      if (s.textContent?.includes('Trusted Clinical')) {
        spotlightSection = s;
        break;
      }
    }
    if (!spotlightSection) return { error: 'Spotlight section not found' };

    // Get all images in spotlight
    const allImgs = spotlightSection.querySelectorAll('img');
    const imgDetails = [];
    for (const img of allImgs) {
      const r = img.getBoundingClientRect();
      imgDetails.push({
        src: img.src?.substring(0, 120),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayRect: { x: r.x.toFixed(0), y: r.y.toFixed(0), w: r.width.toFixed(0), h: r.height.toFixed(0) },
        opacity: window.getComputedStyle(img).opacity,
        display: window.getComputedStyle(img).display,
        visibility: window.getComputedStyle(img).visibility,
        parentClass: img.parentElement?.className?.substring(0, 100),
        grandparentClass: img.parentElement?.parentElement?.className?.substring(0, 100),
      });
    }

    // Check collage container
    const collageContainer = spotlightSection.querySelector('[class*="relative"][style*="paddingBottom"]') ||
                             spotlightSection.querySelector('[class*="grid"]');

    // Check the grid layout
    const grid = spotlightSection.querySelector('.grid');
    const gridInfo = grid ? {
      class: grid.className,
      childCount: grid.children.length,
      rect: grid.getBoundingClientRect(),
      computedDisplay: window.getComputedStyle(grid).display,
      computedGridTemplateColumns: window.getComputedStyle(grid).gridTemplateColumns,
    } : null;

    // Check motion divs
    const motionDivs = spotlightSection.querySelectorAll('[style*="transform"]');
    const motionInfo = [];
    for (const md of motionDivs) {
      const r = md.getBoundingClientRect();
      motionInfo.push({
        class: md.className?.substring(0, 80),
        rect: { x: r.x.toFixed(0), y: r.y.toFixed(0), w: r.width.toFixed(0), h: r.height.toFixed(0) },
        style: md.getAttribute('style')?.substring(0, 100),
      });
    }

    // Section overall
    const sectionRect = spotlightSection.getBoundingClientRect();

    return {
      sectionRect: { x: sectionRect.x.toFixed(0), y: sectionRect.y.toFixed(0), w: sectionRect.width.toFixed(0), h: sectionRect.height.toFixed(0) },
      imgCount: allImgs.length,
      imgDetails,
      gridInfo,
      motionDivs: motionInfo.length,
      motionInfo: motionInfo.slice(0, 5),
      hasPhotosAttr: spotlightSection.querySelector('[data-photos]') !== null,
      innerHTMLLength: spotlightSection.innerHTML.length,
    };
  });
  console.log(JSON.stringify(spotlightDetail, null, 2));

  // Check section order and gaps
  const sectionGaps = await pubPage.evaluate(() => {
    const allSections = document.querySelectorAll('body > div > div > section, body > div > div > div > section');
    const results = [];
    let prevBottom = 0;
    for (const s of allSections) {
      const r = s.getBoundingClientRect();
      const absTop = r.top + window.scrollY;
      const gap = absTop - prevBottom;
      const text = s.textContent?.substring(0, 50)?.trim() || '(no text)';
      results.push({
        text,
        absTop: absTop.toFixed(0),
        height: r.height.toFixed(0),
        gap: gap.toFixed(0),
      });
      prevBottom = absTop + r.height;
    }
    return results;
  });
  console.log('\n--- SECTION GAPS ---');
  sectionGaps.forEach(s => console.log(`  ${s.text} | top=${s.absTop} h=${s.height} gap=${s.gap}`));

  await pubCtx.close();

  // ===== ADMIN DETAILED OVERFLOW DIAGNOSTIC =====
  console.log('\n===== ADMIN OVERFLOW DEEP DIAGNOSTIC =====');
  const adminCtx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const adminPage = await adminCtx.newPage();

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
  await adminPage.goto('http://localhost:3000/admin/spotlight', { waitUntil: 'networkidle', timeout: 30000 });
  await adminPage.waitForTimeout(3000);

  // Deep overflow diagnostic
  const adminDetail = await adminPage.evaluate(() => {
    const vpWidth = window.innerWidth;

    // Walk the DOM tree and find elements wider than viewport
    const offending = [];
    const walk = (el, depth = 0) => {
      if (depth > 15) return;
      const r = el.getBoundingClientRect();
      if (r.right > vpWidth + 2 && r.width > 0) {
        offending.push({
          tag: el.tagName,
          class: (el.className || '').toString().substring(0, 120),
          right: r.right.toFixed(1),
          width: r.width.toFixed(1),
          left: r.left.toFixed(1),
          overflow: window.getComputedStyle(el).overflow,
          minWidth: window.getComputedStyle(el).minWidth,
          maxWidth: window.getComputedStyle(el).maxWidth,
          position: window.getComputedStyle(el).position,
        });
      }
      for (const child of el.children) walk(child, depth + 1);
    };
    walk(document.body);

    // Also check the spotlight admin root
    const spotlightRoot = document.querySelector('[class*="bg-muted/30"][class*="flex"][class*="flex-col"][class*="h-screen"]');

    // Check the main layout div
    const mainDiv = document.querySelector('.flex-1.flex.flex-col.min-h-screen');

    return {
      vpWidth,
      offendingCount: offending.length,
      offending: offending.slice(0, 15),
      spotlightRoot: spotlightRoot ? {
        class: spotlightRoot.className.substring(0, 100),
        rect: spotlightRoot.getBoundingClientRect(),
        overflow: window.getComputedStyle(spotlightRoot).overflow,
      } : null,
      mainDiv: mainDiv ? {
        rect: mainDiv.getBoundingClientRect(),
        overflow: window.getComputedStyle(mainDiv).overflow,
        minWidth: window.getComputedStyle(mainDiv).minWidth,
      } : null,
    };
  });
  console.log(JSON.stringify(adminDetail, null, 2));

  await adminCtx.close();
  await browser.close();
  console.log('\n===== DONE =====');
}

main().catch(console.error);
