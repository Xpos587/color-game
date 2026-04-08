import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
});

const dir = 'docs/design-references/dialed.gg';

async function captureAll(label, url, prefix) {
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'commit', timeout: 15000 });
  await page.waitForSelector('body', { timeout: 10000 });
  await page.waitForTimeout(3000);

  // Desktop
  await page.screenshot({ path: `${dir}/${prefix}-desktop.png` });
  console.log(`  ${label} desktop`);

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${dir}/${prefix}-mobile.png` });
  console.log(`  ${label} mobile`);

  await ctx.close();
}

await captureAll('ORIGINAL', 'https://dialed.gg/', 'ref');
await captureAll('OUR CLONE', 'http://localhost:3000', 'clone');

await browser.close();
console.log('\nDone!');
