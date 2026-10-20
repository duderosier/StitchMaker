import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, image } from './harness.mjs';

const E = loadEngine();
const round2 = { shape: 'preset', presetId: 'round-2', finish: 'framed', count: 14 };

test('a black photo on a 2" round 14ct Blank becomes a 28×28 Pattern of DMC 310 inside the round', () => {
  const grid = E.blankGrid(round2);
  assert.equal(grid.cols, 28);
  assert.equal(grid.rows, 28);
  const p = E.createPattern({ image: image(28, 28, () => [0, 0, 0]), blank: round2, colorCount: 6 });
  const codes = E.palette(p).map(f => f.code);
  assert.deepEqual(codes, ['310']);
  assert.equal(E.cellAt(p, 0, 0), null, 'corner is outside the round, so Unstitched');
  assert.equal(E.cellAt(p, 14, 14).code, '310');
});

const square = (n, count = 14) => ({ shape: 'custom', wIn: n / count, hIn: n / count, finish: 'framed', count });
const codesOf = p => E.palette(p).map(f => f.code);

test('the Palette never has more Flosses than the Color Count, and every Floss is a real DMC color', () => {
  const rainbow = image(20, 20, (x, y) => [x * 12, y * 12, 255 - x * 6]);
  const p = E.createPattern({ image: rainbow, blank: square(20), colorCount: 4 });
  const codes = codesOf(p);
  assert.ok(codes.length >= 2 && codes.length <= 4, `got ${codes.length}`);
  const known = new Set(E.DMC.map(f => f.code));
  for (const c of codes) assert.ok(known.has(c), c);
});

test('pure white snaps to B5200 Snow White', () => {
  const p = E.createPattern({ image: image(4, 4, () => [255, 255, 255]), blank: square(4), colorCount: 2 });
  assert.deepEqual(codesOf(p), ['B5200']);
});

test('reduced colors that snap to the same Floss are combined, so no Floss is listed twice', () => {
  const nearBlacks = image(10, 10, x => (x < 5 ? [0, 0, 0] : [3, 3, 3]));
  const p = E.createPattern({ image: nearBlacks, blank: square(10), colorCount: 2 });
  assert.deepEqual(codesOf(p), ['310']);
});

test('two flat halves stay two flat regions (no dithering)', () => {
  const halves = image(10, 10, x => (x < 5 ? [200, 20, 20] : [20, 40, 200]));
  const p = E.createPattern({ image: halves, blank: square(10), colorCount: 2 });
  const left = new Set(), right = new Set();
  for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) (x < 5 ? left : right).add(E.cellAt(p, x, y).code);
  assert.equal(left.size, 1); assert.equal(right.size, 1);
  assert.notDeepEqual([...left], [...right]);
});

test('confetti cleanup absorbs a lone Stitch into its neighbours by default, and can be turned off', () => {
  const speck = image(9, 9, (x, y) => (x === 4 && y === 4 ? [220, 0, 0] : [20, 40, 200]));
  const cleaned = E.createPattern({ image: speck, blank: square(9), colorCount: 2 });
  assert.equal(codesOf(cleaned).length, 1);
  const raw = E.createPattern({ image: speck, blank: square(9), colorCount: 2, confetti: 0 });
  assert.equal(codesOf(raw).length, 2);
});

test('transparent (Background) cells are Unstitched and never use up a Palette slot', () => {
  const half = image(10, 10, x => (x < 5 ? [0, 0, 0, 0] : [200, 20, 20]));
  const p = E.createPattern({ image: half, blank: square(10), colorCount: 1 });
  assert.equal(E.cellAt(p, 0, 0), null);
  assert.equal(codesOf(p).length, 1);
  assert.notEqual(codesOf(p)[0], '310');
});
