import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

await mkdir('D:/dr/screenshots', { recursive: true });
const b = await chromium.launch({ headless: true });

// === 1. ADMIN SPOTLIGHT ===
console.log('\n=== ADMIN SPOTLIGHT ===');
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

// Get admin canvas image positions
const adminPositions = await ap.evaluate(() => {
  const canvas = document.querySelector('[class*="bg-gradient-to-br from-\\[\\#0f2847\\]"]');
  if (!canvas) return { error: 'no canvas found' };
  const canvasRect = canvas.getBoundingClientRect();
  const imgs = canvas.querySelectorAll('img');
  const positions = [];
  for (const img of imgs) {
    const parent = img.closest('[style*="left"]') || img.closest('[style*="position"]');
    if (!parent) continue;
    const style = parent.getAttribute('style') || '';
    const rect = img.getBoundingClientRect();
    positions.push({
      src: img.src.substring(img.src.lastIndexOf('/') + 1, img.src.lastIndexOf('/') + 30),
      left: rect.left - canvasRect.left,
      top: rect.top - canvasRect.top,
      width: rect.width,
      height: rect.height,
      style: style.substring(0, 120),
    });
  }
  return { canvasWidth: canvasRect.width, canvasHeight: canvasRect.height, positions };
});
console.log('Admin canvas:', JSON.stringify(adminPositions, null, 2));

// Get DB values
const dbValues = await ap.evaluate(async () => {
  const res = await fetch('/api/spotlight-check');
  return null; // No API route, will check DB directly
});

await ap.screenshot({ path: 'D:/dr/screenshots/v1435-admin-1920.png', fullPage: false });
console.log('Admin screenshot saved');

// === 2. PUBLIC HOME ===
console.log('\n=== PUBLIC HOME ===');
const pc = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const pp = await pc.newPage();
await pp.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
await pp.waitForTimeout(3000);

// Get public collage image positions
const publicPositions = await pp.evaluate(() => {
  const sections = document.querySelectorAll('section');
  for (const s of sections) {
    if (s.textContent?.includes('Professional Spotlight') || s.textContent?.includes('Trusted Clinical')) {
      const sectionRect = s.getBoundingClientRect();
      const imgs = s.querySelectorAll('img');
      const positions = [];
      for (const img of imgs) {
        const rect = img.getBoundingClientRect();
        if (rect.width < 10) continue; // skip tiny/broken
        positions.push({
          src: img.src.substring(img.src.lastIndexOf('/') + 1, img.src.lastIndexOf('/') + 30),
          left: rect.left - sectionRect.left,
          top: rect.top - sectionRect.top,
          width: rect.width,
          height: rect.height,
          naturalWidth: img.naturalWidth,
        });
      }
      return { sectionWidth: sectionRect.width, sectionHeight: sectionRect.height, positions };
    }
  }
  return { error: 'spotlight section not found' };
});
console.log('Public collage:', JSON.stringify(publicPositions, null, 2));

// Measure gap
const gapInfo = await pp.evaluate(() => {
  const sections = [...document.querySelectorAll('section')];
  let spotlightBottom = 0;
  let nextTop = Infinity;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const r = s.getBoundingClientRect();
    if (s.textContent?.includes('Professional Spotlight') || s.textContent?.includes('Trusted Clinical')) {
      spotlightBottom = r.bottom + window.scrollY;
    }
  }
  for (const s of sections) {
    const r = s.getBoundingClientRect();
    const absTop = r.top + window.scrollY;
    if (absTop > spotlightBottom + 5) {
      nextTop = Math.min(nextTop, absTop);
      break;
    }
  }
  return { spotlightBottom, nextTop, gap: nextTop - spotlightBottom };
});
console.log('Gap:', JSON.stringify(gapInfo));

await pp.screenshot({ path: 'D:/dr/screenshots/v1435-home-1920.png', fullPage: false });
console.log('Home screenshot saved');

// === 3. MEASURE AT 1366 ===
await pp.setViewportSize({ width: 1366, height: 768 });
await pp.waitForTimeout(1000);
const gap1366 = await pp.evaluate(() => {
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
  return { spotlightBottom, nextTop, gap: nextTop - spotlightBottom };
});
console.log('Gap at 1366:', gap1366.gap?.toFixed(0), 'px');

await pp.screenshot({ path: 'D:/dr/screenshots/v1435-home-1366.png', fullPage: false });

await ac.close();
await pc.close();
await b.close();
console.log('\n=== REPRODUCTION COMPLETE ===');
