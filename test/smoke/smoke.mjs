// Browser smoke test: drives the real page in Chromium at phone and unfolded-Fold sizes and checks
// what the engine tests can't see (layout, gestures, sliders, PDF export, saving).
// Run with `npm run smoke`. Needs Playwright; set PLAYWRIGHT_MODULE / CHROMIUM_PATH if they're not on the default paths.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const photo = join(root, 'test/smoke/fixtures/cat.jpg');

async function loadPlaywright() {
  for (const spec of [process.env.PLAYWRIGHT_MODULE, 'playwright', '/opt/npm-tools/node_modules/playwright/index.js'].filter(Boolean)) {
    try { const m = await import(spec); return m.default || m; } catch { /* try next */ }
  }
  throw new Error('Playwright not found. Install it (npm i --no-save playwright) or set PLAYWRIGHT_MODULE.');
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.jpg': 'image/jpeg' };
function serve() {
  const server = createServer(async (req, res) => {
    const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/$/, '/index.html'));
    try { res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(await readFile(path)); }
    catch { res.writeHead(404); res.end(); }
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

const failures = [];
function check(ok, what) { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failures.push(what); }

const { chromium, devices } = await loadPlaywright();
const server = await serve();
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const launch = {};
for (const p of [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome']) if (p && existsSync(p)) { launch.executablePath = p; break; }
const browser = await chromium.launch(launch);

async function openPage(contextOptions) {
  const ctx = await browser.newContext(contextOptions);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('dialog', d => d.accept());
  await page.goto(url);
  return { page, errors };
}
const tab = (page, name) => page.click(`[data-tab=${name}]`);
const stageShot = page => page.locator('#stage').screenshot();

try {
  // ---------- phone: photo flow ----------
  const { page, errors } = await openPage({ ...devices['iPhone 13'] });
  await page.setInputFiles('#file', photo);
  await page.waitForTimeout(700);
  await page.click('[data-act=remove-border]');
  await page.waitForTimeout(300);

  const heights = new Set();
  for (const t of ['blank', 'photo', 'background', 'colors', 'edit', 'chart']) {
    await tab(page, t); await page.waitForTimeout(80);
    const m = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, stage: Math.round(document.querySelector('.stage-wrap').getBoundingClientRect().height) }));
    check(m.overflow <= 0, `no sideways overflow on the ${t} step`);
    heights.add(m.stage);
  }
  check(heights.size === 1, `preview keeps one height on every step (${[...heights].join(', ')})`);

  // Sliders: a vertical swipe leaves them alone, a sideways drag moves them.
  await tab(page, 'colors');
  const sl = await page.locator('#colorCount').boundingBox();
  const v0 = await page.inputValue('#colorCount');
  await page.mouse.move(sl.x + sl.width * 0.8, sl.y + sl.height / 2); await page.mouse.down();
  await page.mouse.move(sl.x + sl.width * 0.8, sl.y + sl.height / 2 + 80, { steps: 6 }); await page.mouse.up();
  check(await page.inputValue('#colorCount') === v0, 'vertical swipe over a slider does not change it');
  await page.mouse.move(sl.x + 15, sl.y + sl.height / 2); await page.mouse.down();
  await page.mouse.move(sl.x + sl.width - 4, sl.y + sl.height / 2, { steps: 8 }); await page.mouse.up();
  check(await page.inputValue('#colorCount') === '20', 'sideways drag moves a slider to its end (Colors 20)');

  // Two-finger pinch zooms the preview on a step without a tool.
  const before = await stageShot(page);
  const box = await page.locator('#stage').boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, d) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }] });
  await touch('touchStart', 20);
  for (let d = 30; d <= 110; d += 20) await touch('touchMove', d);
  await touch('touchEnd', 0);
  await page.waitForTimeout(100);
  check(!(await stageShot(page)).equals(before), 'pinch zooms the preview');

  // Compare toggle, full screen.
  await tab(page, 'edit');
  await page.click('.stage-tools .js-compare');
  check(await page.getAttribute('.stage-tools .js-compare', 'aria-pressed') === 'true', 'original photo toggle on Edit');
  await page.click('.stage-tools .js-compare');
  await page.click('#btnFull');
  const full = await page.evaluate(() => document.querySelector('.stage-wrap').getBoundingClientRect().height >= innerHeight - 1);
  check(full, 'full screen fills the screen');
  await page.click('#btnFull');

  // Chart PDF.
  await tab(page, 'chart');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), page.click('[data-act=export]')]);
  const pdf = await readFile(await dl.path(), 'latin1');
  check(pdf.startsWith('%PDF-') && pdf.trimEnd().endsWith('%%EOF') && /\/Count 1\b/.test(pdf), 'Chart PDF is a one-page PDF');

  // Saved and restored after reload.
  await page.waitForTimeout(900);
  await page.reload(); await page.waitForTimeout(900);
  check(await page.isHidden('#empty') && (await page.inputValue('#name')) === 'cat', 'pattern restored after reload');

  // ---------- phone: hand-drawn flow ----------
  await page.click('#btnPatterns'); await page.waitForTimeout(200);
  await page.click('[data-act=new-pattern]'); await page.waitForTimeout(200);
  await page.click('#empty [data-act=start-blank]'); await page.waitForTimeout(200);
  check(await page.getAttribute('[data-tab=edit]', 'aria-selected') === 'true', 'Draw my own opens the Edit step');
  const b2 = await page.locator('#stage').boundingBox();
  await page.mouse.move(b2.x + b2.width / 2 - 30, b2.y + b2.height / 2); await page.mouse.down();
  await page.mouse.move(b2.x + b2.width / 2 + 30, b2.y + b2.height / 2, { steps: 8 }); await page.mouse.up();
  await tab(page, 'colors');
  const drawn = await page.locator('#flossList .floss .ct').first().textContent();
  check(+drawn > 0, `drawing with the pencil adds Stitches (${drawn})`);
  await tab(page, 'blank'); await page.click('[data-preset=heart-2]'); await page.waitForTimeout(150);
  await tab(page, 'colors');
  check(+(await page.locator('#flossList .floss .ct').first().textContent()) > 0, 'drawing survives changing the Blank');
  await page.waitForTimeout(900);
  await page.reload(); await page.waitForTimeout(700);
  check((await page.inputValue('#name')) === 'My drawing' && await page.isHidden('#empty'), 'hand-drawn pattern restored after reload');
  check(errors.length === 0, `no page errors on the phone${errors.length ? ': ' + errors.join(' | ') : ''}`);

  // ---------- unfolded Fold: Pattern left, controls right ----------
  const wide = await openPage({ viewport: { width: 880, height: 760 }, deviceScaleFactor: 2, hasTouch: true });
  await wide.page.setInputFiles('#file', photo); await wide.page.waitForTimeout(700);
  const layout = await wide.page.evaluate(() => {
    const s = document.querySelector('.stage-wrap').getBoundingClientRect(), p = document.querySelector('.panel').getBoundingClientRect();
    return { side: s.right <= p.left + 1, overflow: document.documentElement.scrollWidth - innerWidth };
  });
  check(layout.side && layout.overflow <= 0, 'wide screen: Pattern on the left, controls on the right');
  check(wide.errors.length === 0, 'no page errors on the wide screen');
} finally {
  await browser.close();
  server.close();
}
if (failures.length) { console.error(`\n${failures.length} smoke check(s) failed`); process.exit(1); }
console.log('\nsmoke: all checks passed');
