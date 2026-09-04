import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
const pc = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const pp = await pc.newPage();
await pp.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
await pp.waitForTimeout(3000);

// Debug: find the collage container
const debug = await pp.evaluate(() => {
  const sections = document.querySelectorAll('section');
  for (const s of sections) {
    if (s.textContent?.includes('Professional Spotlight') || s.textContent?.includes('Trusted Clinical')) {
      const allDivs = s.querySelectorAll('div');
      const candidates = [];
      for (const d of allDivs) {
        const style = d.getAttribute('style');
        if (style && style.includes('padding-bottom')) {
          const rect = d.getBoundingClientRect();
          candidates.push({
            style: style.substring(0, 80),
            computedPb: window.getComputedStyle(d).paddingBottom,
            rect: { w: rect.width, h: rect.height },
            childCount: d.children.length,
          });
        }
      }
      return candidates;
    }
  }
  return [];
});

console.log('Candidates with padding-bottom:');
debug.forEach((c, i) => console.log(`  ${i}: style="${c.style}" computed="${c.computedPb}" w=${c.rect.w} h=${c.rect.h} children=${c.childCount}`));

// Also check FreeformCollage rendering
const freeformDebug = await pp.evaluate(() => {
  const sections = document.querySelectorAll('section');
  for (const s of sections) {
    if (s.textContent?.includes('Professional Spotlight') || s.textContent?.includes('Trusted Clinical')) {
      // Find all absolutely positioned images inside the collage
      const allDivs = s.querySelectorAll('div');
      for (const d of allDivs) {
        const style = d.getAttribute('style');
        if (style && style.includes('padding-bottom') && style.includes('55.55')) {
          const rect = d.getBoundingClientRect();
          const absChildren = [];
          for (const child of d.children) {
            const cs = window.getComputedStyle(child);
            if (cs.position === 'absolute') {
              const img = child.querySelector('img');
              const cr = child.getBoundingClientRect();
              absChildren.push({
                left: child.style.left,
                top: child.style.top,
                width: child.style.width,
                height: child.style.height,
                transform: child.style.transform,
                zIndex: child.style.zIndex,
                rendered: { x: cr.x, y: cr.y, w: cr.width, h: cr.height },
                imgSrc: img?.src?.substring(img.src.lastIndexOf('/') + 1, img.src.lastIndexOf('/') + 25),
                naturalWidth: img?.naturalWidth,
              });
            }
          }
          return { containerRect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height }, style, absChildren };
        }
      }
    }
  }
  return null;
});

console.log('\nFreeformCollage container:', JSON.stringify(freeformDebug, null, 2));

await pc.close();
await b.close();
