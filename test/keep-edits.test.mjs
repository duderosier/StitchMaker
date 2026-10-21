import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, image } from './harness.mjs';

const E = loadEngine();
const blank = { shape: 'custom', wIn: 1, hIn: 1, count: 10, finish: 'framed' };
const photo = image(10, 10, x => (x < 3 ? [0, 0, 0] : x < 6 ? [255, 255, 255] : [200, 16, 46]));
const fromPhoto = (opts = {}) => E.createPattern({ image: photo, blank, colorCount: 3, confetti: 0, ...opts });
const codes = p => E.palette(p).map(f => f.code).sort();

test('Palette edits survive rebuilding the Pattern from the photo', () => {
  let p = E.apply(fromPhoto(), { type: 'merge', from: 'B5200', into: '310' });
  p = E.apply(p, { type: 'addFloss', floss: '742' });
  const rebuilt = E.rebase(p, fromPhoto({ confetti: 2 }));
  assert.ok(!codes(rebuilt).includes('B5200'), 'the merge was replayed');
  assert.ok(codes(rebuilt).includes('742'), 'the added Floss is still there');
});

test('hand-placed Stitches survive a rebuild on the same grid', () => {
  let p = E.apply(fromPhoto(), { type: 'paint', floss: '742', cells: [[1, 1]] });
  p = E.apply(p, { type: 'erase', cells: [[8, 8]] });
  const rebuilt = E.rebase(p, fromPhoto({ colorCount: 2 }));
  assert.equal(E.cellAt(rebuilt, 1, 1).code, '742');
  assert.equal(E.cellAt(rebuilt, 8, 8), null);
});

test('edits that no longer apply are skipped instead of failing', () => {
  let p = E.apply(fromPhoto(), { type: 'swap', from: 'B5200', to: '3865' });
  const allBlack = E.createPattern({ image: image(10, 10, () => [0, 0, 0]), blank, colorCount: 3 });
  const rebuilt = E.rebase(p, allBlack);
  assert.deepEqual(codes(rebuilt), ['310']);
});

test('hand-placed Stitches are dropped, but Palette edits kept, when the grid size changes', () => {
  let p = E.apply(fromPhoto(), { type: 'paint', floss: '742', cells: [[1, 1]] });
  p = E.apply(p, { type: 'addFloss', floss: '3865' });
  const big = E.createPattern({ image: photo, blank: { ...blank, wIn: 2, hIn: 2 }, colorCount: 3, confetti: 0 });
  const rebuilt = E.rebase(p, big);
  assert.notEqual(E.cellAt(rebuilt, 1, 1)?.code, '742');
  assert.ok(codes(rebuilt).includes('3865'));
});

test('replayed edits can still be undone one by one, and the edit list is saved', () => {
  let p = E.apply(fromPhoto(), { type: 'merge', from: 'B5200', into: '310' });
  p = E.apply(p, { type: 'paint', floss: '742', cells: [[1, 1]] });
  const rebuilt = E.rebase(E.deserialize(JSON.parse(JSON.stringify(E.serialize(p)))), fromPhoto({ confetti: 1 }));
  assert.equal(E.cellAt(rebuilt, 1, 1).code, '742');
  const once = E.undo(rebuilt);
  assert.notEqual(E.cellAt(once, 1, 1)?.code, '742');
  assert.ok(codes(E.undo(once)).includes('B5200'));
});
