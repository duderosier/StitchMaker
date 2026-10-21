import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();

// A printed-looking Source Chart: pale tinted cells with dark symbols, white cells with symbols, plain paper cells,
// thin grey gridlines with bold lines every 10, all on a page with a margin. kind(x, y) returns
// null for plain paper, or { tint: [r, g, b], symbol: 'x' | 'dot' | 'tri' }.
const YELLOW = [246, 238, 160], BLUE = [190, 214, 222], WHITE = [255, 255, 255];
function chart(cols, rows, kind, { cell = 14, margin = 30, warp = null, lines = [] } = {}) {
  const W = cols * cell + 2 * margin, H = rows * cell + 2 * margin;
  const data = new Uint8ClampedArray(W * H * 4).fill(255);
  // paint in chart space, map through optional warp (chart → page)
  const page = (u, v) => (warp ? warp(u, v) : [margin + u, margin + v]);
  const put = (u, v, rgb) => {
    const [px, py] = page(u, v), x = Math.round(px), y = Math.round(py);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    data.set([rgb[0], rgb[1], rgb[2], 255], (y * W + x) * 4);
  };
  const S = cell;
  for (let v = 0; v < rows * S; v += warp ? 0.5 : 1) for (let u = 0; u < cols * S; u += warp ? 0.5 : 1) {
    const cx = Math.floor(u / S), cy = Math.floor(v / S), iu = u - cx * S, iv = v - cy * S;
    let k = kind(cx, cy);
    if (k && k.split) { // a Split Cell: two triangles, each tinted (or paper), with a thin diagonal between
      const first = k.split === '/' ? iu + iv < S : iu > iv, onDiag = Math.abs(k.split === '/' ? iu + iv - S : iu - iv) < 0.7;
      if (onDiag) { put(u, v, [150, 150, 150]); continue; }
      k = first ? k.a : k.b;
    }
    let rgb = k ? k.tint : WHITE;
    if (k && k.symbol) {
      const a = iu - S / 2, b = iv - S / 2, r = S * 0.28;
      const on = k.symbol === 'x' ? (Math.abs(Math.abs(a) - Math.abs(b)) < 1.2 && Math.abs(a) < r)
        : k.symbol === 'plus' ? ((Math.abs(a) < 1.2 && Math.abs(b) < r) || (Math.abs(b) < 1.2 && Math.abs(a) < r))
        : k.symbol === 'bar' ? (Math.abs(a) < r && Math.abs(b) < 1.8)
        : k.symbol === 'dot' ? (a * a + b * b < (S * 0.12) ** 2)
        : (b > -r && b < r && Math.abs(a) < (b + r) / 2 && b > r - 2.2) || (b > -r && b < r && Math.abs(Math.abs(a) - (b + r) / 2) < 1.1);
      if (on) rgb = [40, 40, 50];
    }
    put(u, v, rgb);
  }
  // gridlines
  const bold = [90, 90, 90], thin = [190, 190, 190];
  for (let i = 0; i <= cols; i++) for (let v = 0; v <= rows * S; v += 0.5) {
    const c = i % 10 === 0 || i === cols ? bold : thin;
    put(i * S, v, c); if (c === bold) put(i * S + 1, v, c);
  }
  for (let j = 0; j <= rows; j++) for (let u = 0; u <= cols * S; u += 0.5) {
    const c = j % 10 === 0 || j === rows ? bold : thin;
    put(u, j * S, c); if (c === bold) put(u, j * S + 1, c);
  }
  // heavy dark lines (like Backstitch) in chart cell units
  for (const [x0, y0, x1, y1] of lines) {
    const n = Math.hypot(x1 - x0, y1 - y0) * S * 2;
    for (let t = 0; t <= n; t++) {
      const u = (x0 + (x1 - x0) * t / n) * S, v = (y0 + (y1 - y0) * t / n) * S;
      for (let d = -1.5; d <= 1.5; d += 0.5) { put(u + d, v, [10, 10, 10]); put(u, v + d, [10, 10, 10]); }
    }
  }
  const corners = [page(0, 0), page(cols * S, 0), page(cols * S, rows * S), page(0, rows * S)];
  return { image: { width: W, height: H, data }, corners };
}

// 12 × 10: a yellow block with dots, a blue block with triangles, a white block with crosses, the rest plain paper.
function sampleKind(x, y) {
  if (y < 4 && x < 6) return { tint: YELLOW, symbol: 'dot' };
  if (y < 4) return { tint: BLUE, symbol: 'tri' };
  if (y < 7 && x >= 3 && x < 9) return { tint: WHITE, symbol: 'x' };
  return null;
}
function groupAt(read, x, y) { return read.groups[read.cells[y * read.cols + x]]; }

test('reading a clean chart groups cells by look and marks plain paper as bare fabric', () => {
  const { image, corners } = chart(12, 10, sampleKind);
  const read = E.readChart(image, { corners, cols: 12, rows: 10 });
  assert.equal(read.cols, 12); assert.equal(read.rows, 10);
  assert.equal(read.groups.length, 4);
  const yellow = groupAt(read, 0, 0), blue = groupAt(read, 11, 0), cross = groupAt(read, 4, 5), paper = groupAt(read, 0, 9);
  assert.equal(new Set([yellow, blue, cross, paper]).size, 4);
  assert.equal(paper.paper, true);
  assert.equal(cross.paper, false, 'a white cell with a symbol is a Stitch');
  assert.equal(yellow.count, 24); assert.equal(blue.count, 24); assert.equal(cross.count, 18); assert.equal(paper.count, 54);
  for (let y = 0; y < 10; y++) for (let x = 0; x < 12; x++) assert.equal(groupAt(read, x, y), [yellow, blue, cross, paper][[sampleKind(x, y)].map(k => !k ? 3 : k.tint === YELLOW ? 0 : k.tint === BLUE ? 1 : 2)[0]], `cell ${x},${y}`);
});

test('an angled photo of the chart reads the same once its four corners are given', () => {
  const cell = 16, cols = 12, rows = 10;
  // A projective tilt: page = (A·[u v 1]) / (g·u + h·v + 1), in chart pixels.
  const g = 0.0009, h = -0.0006;
  const warp = (u, v) => { const w = g * u + h * v + 1; return [(1.02 * u + 0.12 * v + 60) / w, (-0.08 * u + 0.97 * v + 50) / w]; };
  const { image, corners } = chart(cols, rows, sampleKind, { cell, margin: 80, warp });
  const read = E.readChart(image, { corners, cols, rows });
  assert.equal(read.groups.length, 4);
  const want = (x, y) => groupAt(read, ...({ 0: [0, 0], 1: [11, 0], 2: [4, 5], 3: [0, 9] })[[sampleKind(x, y)].map(k => !k ? 3 : k.tint === YELLOW ? 0 : k.tint === BLUE ? 1 : 2)[0]]);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) assert.equal(groupAt(read, x, y), want(x, y), `cell ${x},${y}`);
});

test('dark outline lines crossing colored cells do not change their group', () => {
  const lines = [[0, 2, 12, 2], [3, 0, 3, 4], [0, 0, 6, 4]];
  const { image, corners } = chart(12, 10, sampleKind, { lines });
  const read = E.readChart(image, { corners, cols: 12, rows: 10 });
  assert.equal(groupAt(read, 2, 1), groupAt(read, 5, 3));
  assert.equal(groupAt(read, 2, 2), groupAt(read, 0, 0));
  assert.equal(groupAt(read, 8, 2), groupAt(read, 11, 0));
  assert.equal(read.groups.filter(gr => !gr.paper).length, 3);
});

test('the stitch counts are suggested from the gridlines inside the corners', () => {
  for (const [cols, rows, cell] of [[12, 10, 14], [37, 23, 11], [71, 68, 9]]) {
    const { image, corners } = chart(cols, rows, sampleKind, { cell });
    assert.deepEqual(E.estimateGridCounts(image, corners), { cols, rows }, `${cols}×${rows}`);
  }
});

test('the counts are suggested on an angled photo too', () => {
  const g = 0.0007, h = 0.0004;
  const warp = (u, v) => { const w = g * u + h * v + 1; return [(0.98 * u - 0.06 * v + 70) / w, (0.05 * u + 1.01 * v + 40) / w]; };
  const { image, corners } = chart(43, 31, sampleKind, { cell: 12, margin: 80, warp });
  assert.deepEqual(E.estimateGridCounts(image, corners), { cols: 43, rows: 31 });
});

test('on a clean page the chart corners are found, ignoring a title and a key beside it', () => {
  const { image, corners } = chart(30, 24, sampleKind, { cell: 12, margin: 90 });
  const W = image.width, paint = (x0, y0, w, h, rgb) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) image.data.set([...rgb, 255], (y * W + x) * 4); };
  paint(100, 20, 160, 14, [30, 30, 30]);                                 // title text
  for (let k = 0; k < 6; k++) paint(10, 100 + k * 30, 40, 20, [80 + k * 20, 120, 160]); // key swatches
  const got = E.guessChartCorners(image);
  got.forEach((p, i) => assert.ok(Math.hypot(p[0] - corners[i][0], p[1] - corners[i][1]) <= 2.5, `corner ${i}: ${p} vs ${corners[i]}`));
});

test('an imported Pattern is the chart at full size on a custom Blank, with the confirmed Flosses', () => {
  const { image, corners } = chart(12, 10, sampleKind);
  const read = E.readChart(image, { corners, cols: 12, rows: 10 });
  const codeFor = gr => gr.paper ? null : gr === groupAt(read, 0, 0) ? '444' : gr === groupAt(read, 11, 0) ? '3761' : 'B5200';
  const p = E.createImportedPattern({ read, flosses: read.groups.map(codeFor), count: 14 });
  assert.equal(p.cols, 12); assert.equal(p.rows, 10);
  assert.deepEqual(E.blankGrid(p.blank).cols, 12);
  assert.equal(p.blank.shape, 'custom'); assert.equal(p.blank.count, 14);
  assert.deepEqual(E.palette(p).map(f => [f.code, f.count]).sort(), [['3761', 24], ['444', 24], ['B5200', 18]]);
  assert.equal(E.cellAt(p, 0, 9), null);
  assert.equal(E.cellAt(p, 4, 5).code, 'B5200');
  assert.deepEqual(E.deserialize(JSON.parse(JSON.stringify(E.serialize(p)))).cells, p.cells);
});

test('groups given the same DMC number become one Floss, and a group can be left as bare fabric', () => {
  const { image, corners } = chart(12, 10, sampleKind);
  const read = E.readChart(image, { corners, cols: 12, rows: 10 });
  const yellow = groupAt(read, 0, 0), blue = groupAt(read, 11, 0);
  const p = E.createImportedPattern({ read, flosses: read.groups.map(gr => gr === yellow || gr === blue ? '310' : null), count: 14 });
  assert.deepEqual(E.palette(p).map(f => [f.code, f.count]), [['310', 48]]);
  assert.equal(E.cellAt(p, 4, 5), null);
});

test('a big chart fits: 71 × 68 at 14 count is a 5.07" × 4.86" custom Blank', () => {
  const read = { cols: 71, rows: 68, cells: new Array(71 * 68).fill(0), groups: [{ paper: false }] };
  const p = E.createImportedPattern({ read, flosses: ['310'], count: 14 });
  assert.equal(p.cols, 71); assert.equal(p.rows, 68);
  assert.equal(E.blankLabel(p.blank), 'Custom 5.07×4.86"');
});

test('changing the Fabric Count of an imported Pattern keeps every Stitch and changes its size', () => {
  const read = { cols: 9, rows: 7, cells: Array.from({ length: 63 }, (_, i) => i % 3 === 0 ? 1 : 0), groups: [{ paper: false }, { paper: true }] };
  const p = E.createImportedPattern({ read, flosses: ['666', null], count: 14 });
  const q = E.reshape(p, E.chartBlank(p.cols, p.rows, 7, 'overcast'));
  assert.equal(q.cols, 9); assert.equal(q.rows, 7);
  assert.deepEqual(q.cells, p.cells);
  assert.equal(E.blankLabel(q.blank), 'Custom 1.29×1"');
});

// A book page photo: tilted, and bowed near the binding (left) so straight gridlines curve by about a cell.
function bowed(cols, rows, cell) {
  const Wc = cols * cell, Hc = rows * cell, g = 0.0004, h = 0.0003;
  return (u, v) => {
    const w = g * u + h * v + 1;
    const x = (u + 0.05 * v + 70) / w + 0.95 * cell * Math.sin(Math.PI * v / Hc) * (1 - u / Wc) ** 2;
    const y = (-0.03 * u + v + 60) / w + 0.7 * cell * Math.sin(Math.PI * u / Wc);
    return [x, y];
  };
}

test('a bowed book page reads correctly: the grid follows the printed gridlines, not just the corners', () => {
  const cols = 34, rows = 26, cell = 14;
  const { image, corners } = chart(cols, rows, (x, y) => sampleKind(x % 12, y % 10), { cell, margin: 100, warp: bowed(cols, rows, cell) });
  const read = E.readChart(image, { corners, cols, rows });
  let wrong = 0;
  const ref = { 0: groupAt(read, 0, 0), 1: groupAt(read, 11, 0), 2: groupAt(read, 4, 5), 3: groupAt(read, 0, 9) };
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const k = sampleKind(x % 12, y % 10), want = ref[!k ? 3 : k.tint === YELLOW ? 0 : k.tint === BLUE ? 1 : 2];
    if (groupAt(read, x, y) !== want) wrong++;
  }
  assert.equal(wrong, 0);
});

test('on a bowed book page the suggested counts are within one of the real ones (the person confirms them)', () => {
  const cols = 34, rows = 26, cell = 14;
  const { image, corners } = chart(cols, rows, (x, y) => sampleKind(x % 12, y % 10), { cell, margin: 100, warp: bowed(cols, rows, cell) });
  const got = E.estimateGridCounts(image, corners);
  assert.ok(Math.abs(got.cols - cols) <= 1 && Math.abs(got.rows - rows) <= 1, JSON.stringify(got));
});

test('when the whole photo is busy the corner guess is a rectangle just inside the edges', () => {
  const W = 300, H = 400, data = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++) data.set([60 + (i % 7) * 10, 60, 70, 255], i * 4); // a dark couch everywhere
  const got = E.guessChartCorners({ width: W, height: H, data });
  assert.ok(got[0][0] > 5 && got[0][1] > 5 && got[2][0] < W - 5 && got[2][1] < H - 5, JSON.stringify(got));
});

test('a straight grid from the corners alone gives each crossing for a live overlay', () => {
  const g = E.cornerGrid([[10, 20], [110, 20], [110, 70], [10, 70]], 10, 5);
  assert.deepEqual(E.gridPoint(g, 0, 0), [10, 20]);
  assert.deepEqual(E.gridPoint(g, 10, 5), [110, 70]);
  assert.deepEqual(E.gridPoint(g, 5, 2.5).map(Math.round), [60, 45]);
});

test('diagonally split cells are read as Split Cells, one group per triangle', () => {
  const RED = [240, 170, 170];
  const kind = (x, y) => {
    if (y === 2 && x === 2) return { split: '/', a: { tint: YELLOW, symbol: null }, b: null };
    if (y === 2 && x === 5) return { split: '\\', a: { tint: BLUE, symbol: null }, b: { tint: RED, symbol: null } };
    if (y === 5 && x === 7) return { split: '/', a: null, b: { tint: RED, symbol: null } };
    if (y < 2) return { tint: YELLOW, symbol: 'dot' };
    if (y >= 7) return { tint: BLUE, symbol: 'tri' };
    if (x === 9) return { tint: RED, symbol: null };
    return null;
  };
  const { image, corners } = chart(12, 10, kind, { cell: 20 });
  const read = E.readChart(image, { corners, cols: 12, rows: 10 });
  const at = (x, y) => read.splits.find(t => t.x === x && t.y === y);
  assert.equal(read.splits.length, 3, JSON.stringify(read.splits.map(t => [t.x, t.y])));
  const yellow = read.cells[0], blue = read.cells[9 * 12], red = read.cells[3 * 12 + 9], paper = read.cells[4 * 12];
  assert.equal(read.groups[paper].paper, true);
  assert.deepEqual([at(2, 2).diagonal, at(2, 2).a, at(2, 2).b], ['/', yellow, paper]);
  assert.deepEqual([at(5, 2).diagonal, at(5, 2).a, at(5, 2).b], ['\\', blue, red]);
  assert.deepEqual([at(7, 5).diagonal, at(7, 5).a, at(7, 5).b], ['/', paper, red]);
  const p = E.createImportedPattern({ read, flosses: read.groups.map(g => (g.paper ? null : g.guess)) });
  assert.equal(p.extraStitches, true);
  assert.equal(E.splitList(p).length, 3);
});

test('a page with no split cells reads none, even photographed at an angle', () => {
  const cell = 16, cols = 12, rows = 10, W = cols * cell + 60, H = rows * cell + 60;
  const warp = (u, v) => { const s = u / (cols * cell), t = v / (rows * cell); return [30 + u + 18 * t - 10 * s * t, 30 + v + 12 * s]; };
  const { image, corners } = chart(cols, rows, sampleKind, { cell, warp });
  const read = E.readChart(image, { corners, cols, rows });
  assert.equal(read.splits.length, 0);
  assert.equal(read.lines.length, 0, 'bold gridlines and cross symbols are not Backstitch');
});

test('heavy lines along grid corners are read as Backstitch, one unit line per cell side or diagonal', () => {
  const { image, corners } = chart(12, 10, sampleKind, { cell: 18, lines: [[1, 5, 6, 5], [6, 5, 6, 8], [3, 6, 6, 9], [10, 2, 10, 4]] });
  const read = E.readChart(image, { corners, cols: 12, rows: 10 });
  const got = read.lines.map(l => [l.x0, l.y0, l.x1, l.y1].join(',')).sort();
  const want = [];
  for (let x = 1; x < 6; x++) want.push(`${x},5,${x + 1},5`);
  for (let y = 5; y < 8; y++) want.push(`6,${y},6,${y + 1}`);
  for (let k = 0; k < 3; k++) want.push(`${3 + k},${6 + k},${4 + k},${7 + k}`);
  want.push('10,2,10,3', '10,3,10,4');
  assert.deepEqual(got, want.sort());
  assert.equal(read.lineGroups.length, 1);
  assert.equal(read.lineGroups[0].guess, '310');
  assert.ok(read.lines.every(l => l.group === 0));
});

test('stitch counts are not fooled by a shoulder beside the gridline repeat', () => {
  const { image, corners } = chart(24, 20, (x, y) => sampleKind(x % 12, y % 10), { cell: 18 });
  assert.deepEqual(E.estimateGridCounts(image, corners), { cols: 24, rows: 20 });
});

// A black-and-white chart: every stitched cell is white paper with a black symbol; only the symbols tell threads apart.
function symbolKind(x, y) {
  if (y < 3) return { tint: WHITE, symbol: x < 6 ? 'x' : 'plus' };
  if (y < 6) return { tint: WHITE, symbol: x < 6 ? 'tri' : 'bar' };
  if (y < 8 && x >= 2 && x < 10) return { tint: WHITE, symbol: 'dot' };
  return null;
}
function checkSymbols(read) {
  const x = groupAt(read, 0, 0), plus = groupAt(read, 11, 0), tri = groupAt(read, 0, 4), bar = groupAt(read, 11, 4), dot = groupAt(read, 5, 6), paper = groupAt(read, 0, 9);
  assert.equal(new Set([x, plus, tri, bar, dot, paper]).size, 6, 'one group per symbol, plus paper');
  assert.equal(read.groups.length, 6);
  assert.deepEqual([x.count, plus.count, tri.count, bar.count, dot.count, paper.count], [18, 18, 18, 18, 16, 32]);
  assert.equal(paper.paper, true);
  assert.equal(read.symbols, true, 'the reading says it grouped by symbol');
}

test('a black-and-white chart groups cells by the shape of their symbol', () => {
  const { image, corners } = chart(12, 10, symbolKind);
  checkSymbols(E.readChart(image, { corners, cols: 12, rows: 10 }));
});

test('symbols are told apart on an angled photo too', () => {
  const g = 0.00012, h = -0.00008, cell = 16;
  const warp = (u, v) => { const w = g * u + h * v + 1; return [(1.02 * u + 0.08 * v + 60) / w, (-0.05 * u + 0.98 * v + 50) / w]; };
  const { image, corners } = chart(12, 10, symbolKind, { cell, margin: 80, warp });
  checkSymbols(E.readChart(image, { corners, cols: 12, rows: 10 }));
});

test('colored charts are still grouped by color, not split by symbol', () => {
  const { image, corners } = chart(12, 10, sampleKind);
  const read = E.readChart(image, { corners, cols: 12, rows: 10 });
  assert.equal(read.symbols, false);
  assert.equal(read.groups.length, 4);
});
