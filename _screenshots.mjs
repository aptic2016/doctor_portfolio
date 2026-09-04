import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const publicWidths = [1280, 1366, 1440, 1920, 375];
const adminWidths = [1024, 1280, 1366, 1440, 1920, 2560];

async function main() {
  await mkdir('D:/dr/screenshots', { recursive: true });
  const browser = await chromium.launch({ headless: true });

  // Public screenshots
  for (const w of publicWidths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w === 375 ? 812 : 900 } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `D:/dr/screenshots/home-${w}.png`, fullPage: false });
    console.log(`home-${w}.png`);
    await ctx.close();
  }

  // Admin: login once, then screenshot at each width
  const adminCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
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

  for (const w of adminWidths) {
    await adminPage.setViewportSize({ width: w, height: w === 1024 ? 768 : w === 1280 ? 720 : w === 1366 ? 768 : w === 1440 ? 900 : w === 2560 ? 1440 : 1080 });
    await adminPage.waitForTimeout(1500);
    await adminPage.screenshot({ path: `D:/dr/screenshots/admin-spotlight-${w}.png`, fullPage: false });
    console.log(`admin-spotlight-${w}.png`);
  }

  await adminCtx.close();
  await browser.close();
  console.log('Done');
}

main().catch(console.error);
