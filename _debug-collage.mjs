import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
const pc = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const pp = await pc.newPage();
await pp.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
await pp.waitForTimeout(3000);

// Deep inspection of FreeformCollage rendering
const debug = await pp.evaluate(() => {
  const sections = document.querySelectorAll('section');
  for (const s of sections) {
    if (s.textContent?.includes('Professional Spotlight') || s.textContent?.includes('Trusted Clinical')) {
      // Find the collage container (relative div with paddingBottom: 70%)
      const allDivs = s.querySelectorAll('div');
      let collageContainer = null;
      for (const d of allDivs) {
        if (d.style.paddingBottom === '70%' && d.style.position === 'relative') {
          collageContainer = d;
          break;
        }
      }
      
      if (!collageContainer) {
        // Try to find by class
        for (const d of allDivs) {
          const cs = window.getComputedStyle(d);
          if (cs.position === 'relative' && cs.paddingBottom && parseFloat(cs.paddingBottom) > 100) {
            collageContainer = d;
            break;
          }
        }
      }
      
      if (!collageContainer) return { error: 'no collage container found', allDivCount: allDivs.length };
      
      const containerRect = collageContainer.getBoundingClientRect();
      const containerStyle = collageContainer.getAttribute('style');
      const containerComputed = window.getComputedStyle(collageContainer);
      
      // Find all absolutely positioned children (the images)
      const absChildren = [];
      for (const child of collageContainer.children) {
        const cs = window.getComputedStyle(child);
        if (cs.position === 'absolute') {
          const rect = child.getBoundingClientRect();
          const img = child.querySelector('img');
          absChildren.push({
            left: child.style.left,
            top: child.style.top,
            width: child.style.width,
            height: child.style.height,
            transform: child.style.transform,
            zIndex: child.style.zIndex,
            renderedRect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
            imgSrc: img?.src?.substring(img.src.lastIndexOf('/') + 1, img.src.lastIndexOf('/') + 30) || 'none',
          });
        }
      }
      
      return {
        containerRect: { x: containerRect.x, y: containerRect.y, w: containerRect.width, h: containerRect.height },
        containerStyle,
        paddingBottom: containerStyle?.match(/paddingBottom:\s*([^;]+)/)?.[1],
        computedPaddingBottom: containerComputed.paddingBottom,
        absChildren,
      };
    }
  }
  return { error: 'no spotlight section' };
});

console.log(JSON.stringify(debug, null, 2));

await pc.close();
await b.close();
