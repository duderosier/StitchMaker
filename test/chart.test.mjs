import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, image } from './harness.mjs';

const E = loadEngine();
const rainbow = (finish, shape = { shape: 'preset', presetId: 'round-2' }) => E.createPattern({
  image: image(28, 28, (x, y) => [x * 9, y * 9, 120]), blank: { ...shape, count: 14, finish }, colorCount: 8,
});

test('every Floss gets its own Symbol and the legend counts match the Stitches on the grid', () => {
  const C = E.chartLayout(rainbow('framed'));
  const symbols = C.legend.map(r => r.symbol);
  assert.equal(new Set(symbols).size, symbols.length);
  for (const row of C.legend) {
    const onGrid = C.cells.filter(c => c.symbol === row.symbol).length;
    assert.equal(onGrid, row.count, row.code);
    assert.match(row.code, /^\w+$/); assert.ok(row.name && row.hex);
  }
  assert.deepEqual(C.legend.map(r => r.code), E.palette(rainbow('framed')).map(f => f.code));
});

test('a Framed Chart covers the Blank grid with bold lines every 10 Stitches and the shape outline', () => {
  const C = E.chartLayout(rainbow('framed'));
  assert.equal(C.width, 28); assert.equal(C.height, 28);
  assert.deepEqual(C.boldLinesX, [0, 10, 20, 28]);
  assert.deepEqual(C.boldLinesY, [0, 10, 20, 28]);
  assert.ok(C.outline.length > 0);
  assert.deepEqual(C.edgeLegend, []);
  assert.equal(C.edges.length, 0);
});

test('an Overcast Chart covers the whole cut piece including the Ring Tab, and has an Edge section', () => {
  const p = rainbow('overcast');
  const C = E.chartLayout(p);
  const L = E.overcastLayout(p);
  assert.equal(C.width, L.bounds.x1 - L.bounds.x0 + 1);
  assert.equal(C.height, L.bounds.y1 - L.bounds.y0 + 1);
  assert.ok(C.height > 28, 'tab above the round');
  assert.equal(C.boldLinesY.at(-1), C.height);
  assert.equal(C.edges.length, L.edges.length);
  assert.ok(C.edgeLegend.length >= 1);
  assert.equal(C.holes.length, 4);
  assert.ok(C.edges.every(e => e.symbol && e.hex));
});

test('the Chart header states the Blank, Fabric Count and finished size', () => {
  const C = E.chartLayout(rainbow('framed'));
  assert.equal(C.header.blank, 'Round 2"');
  assert.equal(C.header.finish, 'Framed');
  assert.equal(C.header.count, '14ct');
  assert.equal(C.header.size, '2" × 2" (28 × 28 stitches)');
});

test('a Cut-Out with no Stitches still produces a Chart instead of failing', () => {
  const empty = E.createPattern({ image: image(20, 20, () => [0, 0, 0, 0]), blank: { shape: 'cutout', longIn: 2, count: 10, finish: 'overcast' }, colorCount: 4 });
  const C = E.chartLayout(empty);
  assert.equal(C.cells.length, 0);
  assert.deepEqual(C.legend, []);
});

test('the first 24 Symbols contain no easily confused pairs', () => {
  const confusable = [['Z', '2'], ['S', '5'], ['O', 'D'], ['O', '0'], ['B', '8'], ['G', '6'], ['I', '1'], ['Q', 'O'], ['U', 'V']];
  const first = E.SYMBOLS.slice(0, 24);
  assert.equal(new Set(first).size, 24);
  for (const [a, b] of confusable) assert.ok(!(first.includes(a) && first.includes(b)), `${a} and ${b}`);
});
