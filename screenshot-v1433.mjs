import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const widths = [1280, 1366, 1440, 1920, 2560];
const HEIGHT = 900;

async function main() {
  await mkdir('D:/dr/screenshots', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: HEIGHT } });
  const page = await ctx.newPage();

  // Login
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Click email field, clear and type
  await page.click('#email');
  await page.keyboard.type('admin@example.com', { delay: 30 });
  await page.click('#password');
  await page.keyboard.type('admin123', { delay: 30 });
  await page.waitForTimeout(500);

  // Click the Sign In button
  await page.click('button[type="submit"]:has-text("Sign In")');

  // Wait for navigation away from login
  try {
    await page.waitForURL('**/admin/**', { timeout: 15000 });
  } catch (e) {
    console.log('Navigation timeout, current URL:', page.url());
  }
  await page.waitForTimeout(2000);
  console.log('After login URL:', page.url());

  // Navigate to spotlight
  await page.goto('http://localhost:3000/admin/spotlight', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('Spotlight URL:', page.url());

  for (const w of widths) {
    await page.setViewportSize({ width: w, height: HEIGHT });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `D:/dr/screenshots/spotlight-v1433-${w}.png`, fullPage: false });
    console.log(`Screenshot: ${w}px`);
  }

  await browser.close();
  console.log('Done');
}

main().catch(console.error);
