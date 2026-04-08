import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
});

const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  viewport: { width: 1440, height: 900 },
  ignoreHTTPSErrors: true
});

const page = await ctx.newPage();
await page.goto('https://dialed.gg/', { waitUntil: 'commit', timeout: 15000 });
await page.waitForSelector('body', { timeout: 10000 });
await page.waitForTimeout(4000);

// Extract computed styles from key elements
const audit = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el);
  const props = [
    'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
    'textTransform','backgroundColor','padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
    'margin','marginTop','marginRight','marginBottom','marginLeft',
    'width','height','maxWidth','minWidth','maxHeight','minHeight',
    'display','flexDirection','justifyContent','alignItems','gap',
    'borderRadius','border','boxShadow','overflow','position','top','right','bottom','left','zIndex',
    'opacity','transform','transition','cursor','whiteSpace'
  ];

  function extract(el) {
    if (!el) return null;
    const s = cs(el);
    const result = {};
    for (const p of props) {
      const v = s[p];
      if (v !== undefined && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)' && v !== '') {
        result[p] = v;
      }
    }
    result.tagName = el.tagName;
    result.className = el.className?.toString().split(' ').slice(0, 5).join(' ') || '';
    result.id = el.id || '';
    result.text = (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) ? el.textContent.trim().slice(0, 100) : null;
    result.rect = el.getBoundingClientRect();
    return result;
  }

  // Card container
  const card = document.querySelector('.game-card, [style*="border-radius: 16px"], main > div > div');
  const cardInfo = card ? {
    width: cs(card).width,
    height: cs(card).height,
    borderRadius: cs(card).borderRadius,
    boxShadow: cs(card).boxShadow,
    background: cs(card).backgroundColor,
    overflow: cs(card).overflow,
    position: cs(card).position,
  } : null;

  // Title
  const title = document.querySelector('#intro-title, h1');

  // Body text
  const body = document.querySelector('#intro-body, p');

  // Play button
  const playBtn = document.querySelector('#intro-solo, .intro-mode-btn');

  // Mode toggle
  const toggle = document.querySelector('#intro-toggle, .mode-toggle');

  // Toggle track
  const toggleTrack = toggle?.querySelector('button') || toggle?.querySelector('[role="switch"]');

  // Credit footer
  const credit = document.querySelector('#intro-credit, footer');

  // Easy label
  const easyLabel = toggle?.querySelector('span') || toggle?.firstElementChild;

  // Hard label
  const hardLabel = toggle?.querySelector('span:last-of-type') || toggle?.lastElementChild;

  // Close button (desktop)
  const closeBtn = document.querySelector('#ci-close, [aria-label="Close"]');

  // Desktop logo
  const logo = document.querySelector('#dialed-logo');

  // Round indicator
  const roundInd = document.querySelector('.round-indicator');

  // Go button
  const goBtn = document.querySelector('.go-btn');

  // Watermark
  const watermark = document.querySelector('#memorize-wm, #picker-wm, .watermark');

  // Picker strips
  const strips = document.querySelectorAll('#h-strip, #s-strip, #b-strip, [class*="strip"]');
  const stripInfo = [...strips].map(s => ({
    id: s.id || s.className?.split(' ')[0],
    width: cs(s).width,
    height: cs(s).height,
    borderRadius: cs(s).borderRadius,
    background: cs(s).backgroundImage?.slice(0, 100),
    position: cs(s).position,
  }));

  // Picker handle
  const handle = document.querySelector('#h-handle, #s-handle, #b-handle');
  const handleInfo = handle ? {
    width: cs(handle).width,
    height: cs(handle).height,
    borderRadius: cs(handle).borderRadius,
    border: cs(handle).border,
    boxShadow: cs(handle).boxShadow,
  } : null;

  // Picker label
  const pickerLabel = document.querySelector('#picker-label, #picker-channel-label');

  // Result score
  const resultScore = document.querySelector('#result-score');

  // Timer
  const timer = document.querySelector('#timer-value');

  // Total score
  const totalScore = document.querySelector('#total-score');

  // Swatch cards
  const swatches = document.querySelectorAll('.swatch-card');
  const swatchInfo = swatches.length > 0 ? {
    count: swatches.length,
    firstWidth: cs(swatches[0]).width,
    firstHeight: cs(swatches[0]).height,
    borderRadius: cs(swatches[0]).borderRadius,
  } : null;

  return {
    card: cardInfo,
    title: extract(title),
    body: extract(body),
    playBtn: extract(playBtn),
    toggle: extract(toggle),
    toggleTrack: toggleTrack ? extract(toggleTrack) : null,
    credit: extract(credit),
    easyLabel: easyLabel ? extract(easyLabel) : null,
    hardLabel: hardLabel ? extract(hardLabel) : null,
    closeBtn: closeBtn ? extract(closeBtn) : null,
    logo: logo ? extract(logo) : null,
    roundInd: extract(roundInd),
    goBtn: extract(goBtn),
    watermark: extract(watermark),
    pickerLabel: extract(pickerLabel),
    resultScore: extract(resultScore),
    timer: extract(timer),
    totalScore: extract(totalScore),
    strips: stripInfo,
    handle: handleInfo,
    swatches: swatchInfo,
    bodyBg: cs(document.body).backgroundColor,
    bodyFont: cs(document.body).fontFamily,
    htmlOverflow: cs(document.documentElement).overflow,
    bodyOverflow: cs(document.body).overflow,
  };
});

console.log(JSON.stringify(audit, null, 2));
await browser.close();
