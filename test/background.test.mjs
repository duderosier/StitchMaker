import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, image } from './harness.mjs';

const E = loadEngine();
const WHITE = [255, 255, 255], BLACK = [0, 0, 0];
const ones = m => m.reduce((n, v) => n + (v ? 1 : 0), 0);

test('magic wand removes the connected, similar Background around the tap and stops at the subject', () => {
  const img = image(10, 10, (x, y) => (x >= 3 && x <= 6 && y >= 3 && y <= 6 ? BLACK : WHITE));
  const bg = E.magicWand(img, 0, 0, 20);
  assert.equal(ones(bg), 100 - 16);
  assert.equal(bg[4 * 10 + 4], 0);
  const subject = E.magicWand(img, 4, 4, 20);
  assert.equal(ones(subject), 16);
});

test('magic wand only takes connected pixels, not similar ones across a divider', () => {
  const img = image(9, 3, x => (x === 4 ? BLACK : WHITE));
  const bg = E.magicWand(img, 0, 1, 20);
  assert.equal(ones(bg), 12);
  assert.equal(bg[1 * 9 + 8], 0);
});

test('magic wand tolerance controls how far from the tapped color it reaches', () => {
  const img = image(6, 1, x => (x < 3 ? WHITE : [230, 230, 230]));
  assert.equal(ones(E.magicWand(img, 0, 0, 5)), 3);
  assert.equal(ones(E.magicWand(img, 0, 0, 20)), 6);
});

test('remove-border clears Background touching the edges and keeps the subject in the middle', () => {
  const img = image(12, 12, (x, y) => ((x - 5.5) ** 2 + (y - 5.5) ** 2 < 9 ? [200, 30, 30] : [240, 240, 235]));
  const bg = E.removeBorder(img, 20);
  assert.equal(bg[0], 1);
  assert.equal(bg[6 * 12 + 6], 0);
  assert.equal(ones(bg) + ones(E.magicWand(img, 6, 6, 20)), 144);
});

test('transparent PNG areas are Background', () => {
  const img = image(4, 1, x => (x < 2 ? [9, 9, 9, 0] : [9, 9, 9, 255]));
  assert.deepEqual(Array.from(E.alphaMask(img)), [1, 1, 0, 0]);
});

test('a Background mask survives being encoded for saving', () => {
  const m = new Uint8Array(1000); m.fill(1, 100, 350); m[999] = 1;
  const back = E.decodeMask(E.encodeMask(m), 1000);
  assert.deepEqual(Array.from(back), Array.from(m));
  assert.ok(E.encodeMask(m).length < 40, 'compact');
});
