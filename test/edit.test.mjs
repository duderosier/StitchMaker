import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, image } from './harness.mjs';

const E = loadEngine();
const blank = { shape: 'custom', wIn: 1, hIn: 1, count: 10, finish: 'framed' };
// Three vertical bands: black, white, red → Flosses 310, B5200 and a red.
const bands = () => E.createPattern({
  image: image(10, 10, x => (x < 3 ? [0, 0, 0] : x < 6 ? [255, 255, 255] : [200, 16, 46])),
  blank, colorCount: 3, confetti: 0,
});
const counts = p => Object.fromEntries(E.palette(p).map(f => [f.code, f.count]));

test('the Palette lists each Floss with DMC number, name, color and Stitch count', () => {
  const p = bands();
  const black = E.palette(p).find(f => f.code === '310');
  assert.deepEqual(black, { code: '310', name: 'Black', hex: '#000000', count: 30 });
});

test('Merge reassigns every Stitch of one Floss to another and drops it from the Palette', () => {
  const p = E.apply(bands(), { type: 'merge', from: 'B5200', into: '310' });
  assert.equal(counts(p)['310'], 60);
  assert.equal(counts(p)['B5200'], undefined);
});

test('Swap replaces a Floss with any DMC Floss, keeping its Stitches in place', () => {
  const p = E.apply(bands(), { type: 'swap', from: '310', to: '3371' });
  assert.equal(E.cellAt(p, 0, 0).code, '3371');
  assert.equal(counts(p)['3371'], 30);
  assert.equal(counts(p)['310'], undefined);
});

test('marking a Floss Unstitched turns its Stitches to bare fabric', () => {
  const p = E.apply(bands(), { type: 'unstitch', floss: 'B5200' });
  assert.equal(E.cellAt(p, 4, 4), null);
  assert.equal(E.palette(p).length, 2);
});

test('+ Floss adds a DMC Floss to the Palette for painting, even before it has Stitches', () => {
  const p = E.apply(bands(), { type: 'addFloss', floss: '742' });
  assert.equal(counts(p)['742'], 0);
  const painted = E.apply(p, { type: 'paint', floss: '742', cells: [[0, 0], [1, 0]] });
  assert.equal(counts(painted)['742'], 2);
  assert.equal(counts(painted)['310'], 28);
});

test('the pencil only paints inside the Blank; the eraser makes cells Unstitched', () => {
  const round = { shape: 'preset', presetId: 'round-1.5', count: 14, finish: 'framed' };
  let p = E.createPattern({ image: image(21, 21, () => [0, 0, 0]), blank: round, colorCount: 2 });
  p = E.apply(p, { type: 'paint', floss: '310', cells: [[0, 0]] });
  assert.equal(E.cellAt(p, 0, 0), null, 'corner is outside the round');
  p = E.apply(p, { type: 'erase', cells: [[10, 10]] });
  assert.equal(E.cellAt(p, 10, 10), null);
});

test('undo and redo walk back and forth through Palette and Stitch edits', () => {
  const start = bands();
  assert.equal(E.isEdited(start), false);
  let p = E.apply(start, { type: 'merge', from: 'B5200', into: '310' });
  p = E.apply(p, { type: 'erase', cells: [[0, 0]] });
  assert.equal(E.isEdited(p), true);
  p = E.undo(p);
  assert.equal(E.cellAt(p, 0, 0).code, '310');
  p = E.undo(p);
  assert.deepEqual(counts(p), counts(start));
  assert.equal(E.canUndo(p), false);
  p = E.redo(p);
  assert.equal(counts(p)['B5200'], undefined);
  p = E.apply(p, { type: 'erase', cells: [[9, 9]] });
  assert.equal(E.canRedo(p), false, 'a new edit clears redo');
});

test('a Pattern survives saving and loading exactly, including undo history', () => {
  let p = E.apply(bands(), { type: 'swap', from: '310', to: '3371' });
  const back = E.deserialize(JSON.parse(JSON.stringify(E.serialize(p))));
  assert.deepEqual(E.palette(back), E.palette(p));
  assert.equal(E.cellAt(back, 0, 0).code, '3371');
  assert.equal(E.cellAt(E.undo(back), 0, 0).code, '310');
});

test('swapping a Floss for itself changes nothing', () => {
  const before = bands();
  const after = E.apply(before, { type: 'swap', from: '310', to: '310' });
  assert.deepEqual(E.palette(after), E.palette(before));
});
