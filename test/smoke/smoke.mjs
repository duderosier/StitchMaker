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
const chartPng = join(root, 'test/smoke/fixtures/chart.png'), chartPdf = join(root, 'test/smoke/fixtures/chart.pdf');
// pdf.js normally comes from cdnjs (ADR 0002); the test serves the same version from node_modules instead.
const pdfjsDir = process.env.PDFJS_DIR || join(root, 'node_modules/pdfjs-dist/build');
// Likewise the HEIC decoder (heic2any) normally comes from jsDelivr.
const heicDir = process.env.HEIC2ANY_DIR || join(root, 'node_modules/heic2any/dist');

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
  // The web font is cosmetic; serve nothing so the test doesn't depend on Google Fonts being reachable.
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.fulfill({ body: '', contentType: 'text/css' }));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/**', async route => {
    const name = new URL(route.request().url()).pathname.split('/').pop();
    try { await route.fulfill({ body: await readFile(join(pdfjsDir, name)), contentType: 'text/javascript' }); } catch { await route.abort(); }
  });
  await page.route('https://cdn.jsdelivr.net/npm/heic2any@*/dist/*', async route => {
    const name = new URL(route.request().url()).pathname.split('/').pop();
    try { await route.fulfill({ body: await readFile(join(heicDir, name)), contentType: 'text/javascript' }); } catch { await route.abort(); }
  });
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
  check(await page.getAttribute('[data-tab=blank]', 'aria-selected') === 'true', 'Draw my own opens the Blank step');
  check(await page.isHidden('[data-tab=photo]') && await page.isHidden('[data-tab=background]'), 'a drawing hides the Photo and Background steps');
  await tab(page, 'edit');
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
  await tab(page, 'blank'); await page.click('[data-shape=custom]'); await page.click('[data-finish=overcast]'); await page.waitForTimeout(150);
  check(await page.isVisible('[data-tab=edge]'), 'a drawing can be Overcast and gets the Edge step');
  await tab(page, 'edit');
  check(await page.isHidden('#toolSplit'), 'the Split tool is hidden until Extra stitch types is on');
  await page.click('[data-extra="1"]'); await page.waitForTimeout(100);
  check(await page.getAttribute('#toolSplit', 'aria-pressed') === 'true', 'Extra stitch types on picks the Split tool');
  const b3 = await page.locator('#stage').boundingBox();
  await page.mouse.click(b3.x + b3.width / 2 + 3, b3.y + b3.height / 2 + 45);
  await page.waitForTimeout(100);
  await page.click('#toolLine');
  await page.mouse.click(b3.x + b3.width / 2 - 30, b3.y + b3.height / 2 - 40);
  await page.mouse.click(b3.x + b3.width / 2 + 30, b3.y + b3.height / 2 - 40);
  await page.waitForTimeout(100);
  await page.click('[data-tool=half]');
  await page.mouse.click(b3.x + b3.width / 2 - 60, b3.y + b3.height / 2 + 60);
  await page.click('[data-tool=quarter]');
  await page.mouse.click(b3.x + b3.width / 2 + 60, b3.y + b3.height / 2 + 60);
  await page.click('[data-tool=knot]');
  await page.mouse.click(b3.x + b3.width / 2, b3.y + b3.height / 2 + 90);
  await page.waitForTimeout(100);
  await tab(page, 'chart');
  const chartTxt = await page.textContent('#chartSummary');
  check(/1 half stitch\b/.test(chartTxt) && /1 quarter stitch\b/.test(chartTxt) && /1 French knot\b/.test(chartTxt), `the Half, Quarter and Knot tools add their stitches (${chartTxt})`);
  check(/1 backstitch lines?/.test(chartTxt), `the Line tool stitches a Backstitch between two corners (${chartTxt})`);
  await tab(page, 'colors');
  const splitTxt = (await page.locator('#flossList .floss .ct').allTextContents()).join(' ');
  check(/split/.test(splitTxt), `tapping with the Split tool makes a Split Cell (${splitTxt})`);
  await page.waitForTimeout(900);
  await page.reload(); await page.waitForTimeout(700);
  await tab(page, 'edit');
  check(await page.isVisible('#toolSplit'), 'Extra stitch types stays on after reload');

  // ---------- phone: importing a Source Chart ----------
  await page.setInputFiles('#chartFile', chartPng);
  await page.waitForSelector('.imp-step[data-step=grid].on');
  await page.waitForTimeout(300);
  check(await page.inputValue('#impCols') === '24' && await page.inputValue('#impRows') === '20', 'chart import finds the 24 × 20 grid');
  await page.click('[data-act=imp-read]');
  await page.waitForSelector('.imp-step[data-step=threads].on', { timeout: 20000 });
  const threads = await page.$$('#impThreads .thread');
  check(threads.length === 4, `chart import finds 3 thread colors plus bare fabric (${threads.length})`);
  await page.click('[data-act=imp-make]'); await page.waitForTimeout(300);
  check((await page.textContent('#readout')).startsWith('24 × 20 stitches, 3 colors'), 'imported chart becomes a 24 × 20 Pattern');
  await page.click('.stage-tools .js-compare');
  check(await page.getAttribute('.stage-tools .js-compare', 'aria-pressed') === 'true', 'original chart toggle on an import');
  await page.click('.stage-tools .js-compare');
  await tab(page, 'blank'); await page.selectOption('#count', '18'); await page.waitForTimeout(150);
  check((await page.textContent('#readout')).startsWith('24 × 20'), 'a new Fabric Count keeps every imported stitch');
  await page.waitForTimeout(900);
  await page.reload(); await page.waitForTimeout(900);
  check((await page.inputValue('#name')) === 'chart' && (await page.textContent('#readout')).startsWith('24 × 20'), 'imported chart restored after reload');
  await tab(page, 'colors'); await page.click('[data-act=reread-chart]');
  await page.waitForSelector('.imp-step[data-step=grid].on');
  check(await page.inputValue('#impCols') === '24', 'Re-read chart reopens the saved grid');
  await page.click('#importer [data-act=close-dialog]');
  await page.click('[data-act=add-chart-page]');
  await page.setInputFiles('#chartFile', chartPng);
  await page.waitForSelector('.imp-step[data-step=grid].on');
  await page.waitForTimeout(300);
  await page.click('[data-act=imp-read]');
  await page.waitForSelector('.imp-step[data-step=threads].on', { timeout: 20000 });
  await page.click('[data-act=imp-make]');
  await page.waitForSelector('.imp-step[data-step=place].on');
  const overlap = +(await page.inputValue('#impOverlap'));
  await page.click('[data-act=imp-join]'); await page.waitForTimeout(200);
  const joinedRead = await page.textContent('#readout');
  check(joinedRead.startsWith(`${48 - overlap} × 20`), `Add a chart page joins a second page to the right (${overlap} repeated columns; ${joinedRead})`);
  await tab(page, 'colors');
  check(!(await page.isVisible('[data-act=reread-chart]')) && await page.isVisible('[data-act=add-chart-page]'), 'a joined chart offers Add a chart page but not Re-read');
  await tab(page, 'blank');
  const stitchCount = async () => (await page.locator('#flossList .floss .ct').allTextContents()).reduce((n, t) => n + (parseInt(t, 10) || 0), 0);
  const fullCount = await stitchCount();
  await page.click('[data-preset="round-1.5"]'); await page.waitForTimeout(150);
  const shrunk = await stitchCount(), shrunkRead = await page.textContent('#readout');
  check(shrunkRead.startsWith('27 × 27') && shrunk > 0 && shrunk < fullCount && await page.getAttribute('[data-fit=shrink]', 'aria-pressed') === 'true', `a smaller Blank shrinks an imported chart to fit (${fullCount} → ${shrunk})`);
  await page.click('[data-fit=crop]'); await page.waitForTimeout(150);
  const cropped = await stitchCount();
  await page.click('[data-fit=shrink]'); await page.waitForTimeout(150);
  check(cropped !== shrunk && await stitchCount() === shrunk, `Crop and Shrink to fit redo the Blank change (${cropped} cropped)`);
  await page.setInputFiles('#chartFile', chartPdf);
  await page.waitForSelector('#impPages button[data-page="2"]', { timeout: 20000 }).catch(() => {});
  const hasPages = await page.locator('#impPages button').count();
  check(hasPages === 2, `a two-page PDF offers its pages (${hasPages})`);
  if (hasPages === 2) {
    await page.click('#impPages button[data-page="2"]');
    await page.waitForSelector('.imp-step[data-step=grid].on', { timeout: 20000 });
    await page.waitForTimeout(300);
    check(await page.inputValue('#impCols') === '24', `PDF page 2 shows the chart grid (${await page.inputValue('#impCols')} across)`);
  }
  await page.click('#importer [data-act=close-dialog]');
  await page.setInputFiles('#chartFile', join(root, 'test/smoke/fixtures/chart-bw.png'));
  await page.waitForSelector('.imp-step[data-step=grid].on');
  await page.waitForTimeout(300);
  await page.click('[data-act=imp-read]');
  await page.waitForSelector('.imp-step[data-step=threads].on', { timeout: 20000 });
  const bwRows = await page.$$eval('#impThreads .thread input', els => els.map(e => e.value));
  check(bwRows.length === 6 && new Set(bwRows.filter(Boolean)).size === 5 && /no colors/.test(await page.textContent('#impThreads')),
    `a black-and-white chart reads one row per symbol, each starting on its own thread (${bwRows.join(' ')})`);
  await page.setInputFiles('#chartFile', join(root, 'test/smoke/fixtures/chart-key.pdf'));
  await page.waitForSelector('.imp-step[data-step=grid].on', { timeout: 20000 });
  await page.waitForTimeout(300);
  await page.click('[data-act=imp-read]');
  await page.waitForSelector('.imp-step[data-step=threads].on', { timeout: 20000 });
  await page.waitForFunction(() => document.querySelector('#impKey').value, null, { timeout: 10000 }).catch(() => {});
  const keyNums = await page.inputValue('#impKey');
  const keyed = await page.$$eval('#impThreads .thread input', els => els.map(e => e.value).join(' '));
  check(keyNums === '745, 3752, Blanc' && keyed.trim() === '745 3752 Blanc', `a PDF's key fills in the DMC numbers (${keyNums} → ${keyed.trim()})`);
  await page.fill('#impKey', '727, 827'); await page.waitForTimeout(500);
  const retyped = await page.$$eval('#impThreads .thread input', els => els.map(e => e.value).join(' '));
  check(retyped.startsWith('727 827'), `typed key numbers change the guesses (${retyped.trim()})`);
  await page.evaluate(() => { document.querySelector('#impCols').value = ''; });
  await page.setInputFiles('#chartFile', join(root, 'test/smoke/fixtures/chart.heic'));
  await page.waitForFunction(() => !document.querySelector('#importer').open || (document.querySelector('#impBusy').hidden && document.querySelector('#impCols').value), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(300);
  const heicCols = await page.inputValue('#impCols'), heicOpen = await page.evaluate(() => document.querySelector('#importer').open);
  check(heicOpen && heicCols === '24', `a HEIC photo of a chart opens (${heicCols} across)`);
  await page.click('#importer [data-act=close-dialog]');
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
