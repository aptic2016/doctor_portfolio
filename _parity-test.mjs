import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { mkdir } from 'fs/promises';

await mkdir('D:/dr/screenshots', { recursive: true });
const b = await chromium.launch({ headless: true });

// === STEP 1: Set asymmetric positions in DB directly ===
console.log('\n=== STEP 1: Setting asymmetric positions in DB ===');
const p = new PrismaClient();
const targets = [
  { sortOrder: 0, xPercent: 5, yPercent: 8, widthPercent: 42, heightPercent: 55, rotation: -5, zIndex: 1 },
  { sortOrder: 1, xPercent: 55, yPercent: 3, widthPercent: 38, heightPercent: 65, rotation: 2, zIndex: 2 },
  { sortOrder: 2, xPercent: 8, yPercent: 58, widthPercent: 40, heightPercent: 38, rotation: -7, zIndex: 3 },
  { sortOrder: 3, xPercent: 58, yPercent: 52, widthPercent: 36, heightPercent: 44, rotation: 5, zIndex: 4 },
];
for (const t of targets) {
  const img = await p.homeSpotlightImage.findFirst({ where: { sortOrder: t.sortOrder } });
  if (img) {
    await p.homeSpotlightImage.update({ where: { id: img.id }, data: t });
    console.log(`  Set #${t.sortOrder} ${img.altText}: x=${t.xPercent} y=${t.yPercent} w=${t.widthPercent} h=${t.heightPercent} rot=${t.rotation}`);
  }
}
await p.$disconnect();

// === STEP 2: Open Admin and verify positions render ===
console.log('\n=== STEP 2: Admin canvas verification ===');
const ac = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const ap = await ac.newPage();
await ap.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
await ap.waitForTimeout(1500);
await ap.click('#email');
await ap.keyboard.type('admin@example.com', { delay: 30 });
await ap.click('#password');
await ap.keyboard.type('admin123', { delay: 30 });
await ap.waitForTimeout(500);
await ap.click('button[type="submit"]:has-text("Sign In")');
try { await ap.waitForURL('**/admin/**', { timeout: 15000 }); } catch {}
await ap.waitForTimeout(2000);
await ap.goto('http://localhost:3000/admin/spotlight', { waitUntil: 'networkidle', timeout: 30000 });
await ap.waitForTimeout(3000);

const adminImgs = await ap.evaluate(() => {
  const canvas = document.querySelector('[class*="bg-gradient-to-br from-\\[\\#0f2847\\]"]');
  if (!canvas) return [];
  const canvasRect = canvas.getBoundingClientRect();
  const imgs = canvas.querySelectorAll('img');
  return [...imgs].filter(img => {
    const r = img.getBoundingClientRect();
    return r.width > 20 && r.height > 20;
  }).map(img => {
    const r = img.getBoundingClientRect();
    return {
      src: img.src.substring(img.src.lastIndexOf('/') + 1, img.src.lastIndexOf('/') + 25),
      x: ((r.left - canvasRect.left) / canvasRect.width * 100).toFixed(1),
      y: ((r.top - canvasRect.top) / canvasRect.height * 100).toFixed(1),
      w: (r.width / canvasRect.width * 100).toFixed(1),
      h: (r.height / canvasRect.height * 100).toFixed(1),
    };
  });
});
console.log('Admin rendered positions:');
adminImgs.forEach((img, i) => console.log(`  ${i}: x=${img.x}% y=${img.y}% w=${img.w}% h=${img.h}%`));
await ap.screenshot({ path: 'D:/dr/screenshots/v1435-admin-asymmetric.png', fullPage: false });

// === STEP 3: Open Public and verify same positions ===
console.log('\n=== STEP 3: Public homepage verification ===');
const pc = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const pp = await pc.newPage();
await pp.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
await pp.waitForTimeout(3000);

const publicImgs = await pp.evaluate(() => {
  const sections = document.querySelectorAll('section');
  for (const s of sections) {
    if (s.textContent?.includes('Professional Spotlight') || s.textContent?.includes('Trusted Clinical')) {
      // Find the FreeformCollage container (relative div with paddingBottom: 55.55%)
      const allDivs = s.querySelectorAll('div');
      let collageContainer = null;
      for (const d of allDivs) {
        if (d.style.paddingBottom === '55.55%' && d.style.position === 'relative') {
          collageContainer = d;
          break;
        }
      }
      if (!collageContainer) return { error: 'collage container not found' };
      const containerRect = collageContainer.getBoundingClientRect();
      const absChildren = [];
      for (const child of collageContainer.children) {
        const cs = window.getComputedStyle(child);
        if (cs.position === 'absolute') {
          const img = child.querySelector('img');
          const rect = child.getBoundingClientRect();
          absChildren.push({
            src: img?.src?.substring(img.src.lastIndexOf('/') + 1, img.src.lastIndexOf('/') + 25) || 'none',
            x: ((rect.left - containerRect.left) / containerRect.width * 100).toFixed(1),
            y: ((rect.top - containerRect.top) / containerRect.height * 100).toFixed(1),
            w: (rect.width / containerRect.width * 100).toFixed(1),
            h: (rect.height / containerRect.height * 100).toFixed(1),
            transform: child.style.transform,
            naturalWidth: img?.naturalWidth || 0,
          });
        }
      }
      return { containerW: containerRect.width, containerH: containerRect.height, images: absChildren };
    }
  }
  return { error: 'spotlight section not found' };
});

console.log('Public rendered positions:');
if (publicImgs.images) {
  publicImgs.images.forEach((img, i) => {
    console.log(`  ${i}: x=${img.x}% y=${img.y}% w=${img.w}% h=${img.h}% rot=${img.transform} natural=${img.naturalWidth}px`);
  });
}
await pp.screenshot({ path: 'D:/dr/screenshots/v1435-public-asymmetric.png', fullPage: false });

// === STEP 4: PARITY COMPARISON ===
console.log('\n=== STEP 4: PARITY COMPARISON ===');
if (adminImgs.length > 0 && publicImgs.images && publicImgs.images.length > 0) {
  for (let i = 0; i < Math.min(adminImgs.length, publicImgs.images.length); i++) {
    const a = adminImgs[i];
    const pu = publicImgs.images[i];
    const xDiff = Math.abs(parseFloat(a.x) - parseFloat(pu.x));
    const yDiff = Math.abs(parseFloat(a.y) - parseFloat(pu.y));
    const wDiff = Math.abs(parseFloat(a.w) - parseFloat(pu.w));
    const hDiff = Math.abs(parseFloat(a.h) - parseFloat(pu.h));
    const pass = xDiff < 5 && yDiff < 5 && wDiff < 5 && hDiff < 5;
    console.log(`  Photo ${i}: Δx=${xDiff.toFixed(1)}% Δy=${yDiff.toFixed(1)}% Δw=${wDiff.toFixed(1)}% Δh=${hDiff.toFixed(1)}% ${pass ? 'PASS' : 'FAIL'}`);
  }
}

// === STEP 5: GAP MEASUREMENT ===
console.log('\n=== STEP 5: GAP MEASUREMENT ===');
for (const vpW of [1920, 1366]) {
  await pp.setViewportSize({ width: vpW, height: 1080 });
  await pp.waitForTimeout(500);
  const gap = await pp.evaluate(() => {
    const sections = [...document.querySelectorAll('section')];
    let spotlightBottom = 0;
    let nextTop = Infinity;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (s.textContent?.includes('Professional Spotlight') || s.textContent?.includes('Trusted Clinical')) {
        spotlightBottom = r.bottom + window.scrollY;
      }
    }
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      const absTop = r.top + window.scrollY;
      if (absTop > spotlightBottom + 5) { nextTop = Math.min(nextTop, absTop); break; }
    }
    return { spotlightBottom: Math.round(spotlightBottom), nextTop: Math.round(nextTop), gap: Math.round(nextTop - spotlightBottom) };
  });
  console.log(`  ${vpW}px: spotlight=${gap.spotlightBottom}px next=${gap.nextTop}px gap=${gap.gap}px`);
}

// === STEP 6: ADMIN PHOTO LIST SCREENSHOT ===
console.log('\n=== STEP 6: Admin photo list screenshot ===');
await ap.screenshot({ path: 'D:/dr/screenshots/v1435-admin-photolist.png', fullPage: false });

// === STEP 7: Check all photos visible on public ===
console.log('\n=== STEP 7: Public photo visibility ===');
const pubPhotoCheck = await pp.evaluate(() => {
  const sections = document.querySelectorAll('section');
  for (const s of sections) {
    if (s.textContent?.includes('Professional Spotlight') || s.textContent?.includes('Trusted Clinical')) {
      const imgs = s.querySelectorAll('img');
      return [...imgs].map(img => ({
        src: img.src.substring(img.src.lastIndexOf('/') + 1, img.src.lastIndexOf('/') + 25),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        visible: img.getBoundingClientRect().width > 0,
      })).filter(img => img.naturalWidth > 0);
    }
  }
  return [];
});
console.log(`  Photos with naturalWidth > 0: ${pubPhotoCheck.filter(i => i.naturalWidth > 0).length}/${pubPhotoCheck.length}`);
pubPhotoCheck.forEach((img, i) => console.log(`  ${i}: ${img.src} ${img.naturalWidth}x${img.naturalHeight} visible=${img.visible}`));

await ac.close();
await pc.close();
await b.close();
console.log('\n=== ALL TESTS COMPLETE ===');
