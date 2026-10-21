import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();
const square = { shape: 'custom', wIn: 1, hIn: 1, count: 10, finish: 'framed' };
const blank = () => E.createBlankPattern({ blank: square, palette: ['310', 'B5200'] });
const codes = s => s && [s.diagonal, s.a && s.a.code, s.b && s.b.code];

test('a Split Cell holds a Floss or Unstitched per triangle and counts as part stitches', () => {
  let p = blank();
  p = E.apply(p, { type: 'split', cells: [[2, 3]], diagonal: '/', a: '310', b: null });
  p = E.apply(p, { type: 'split', cells: [[4, 4]], diagonal: '\\', a: '310', b: '666' });
  assert.equal(E.cellAt(p, 2, 3), null, 'not a full Stitch');
  assert.deepEqual(codes(E.splitAt(p, 2, 3)), ['/', '310', null]);
  assert.deepEqual(codes(E.splitAt(p, 4, 4)), ['\\', '310', '666']);
  assert.equal(E.splitAt(p, 0, 0), null);
  const pal = Object.fromEntries(E.palette(p).map(f => [f.code, [f.count, f.parts]]));
  assert.deepEqual(pal['310'], [0, 2]);
  assert.deepEqual(pal['666'], [0, 1], 'a triangle Floss joins the Palette');
});

test('a split with the same Floss on both sides is a full Stitch; painting or erasing replaces a split', () => {
  let p = blank();
  p = E.apply(p, { type: 'split', cells: [[1, 1]], diagonal: '/', a: '310', b: '310' });
  assert.equal(E.splitAt(p, 1, 1), null); assert.equal(E.cellAt(p, 1, 1).code, '310');
  p = E.apply(p, { type: 'split', cells: [[1, 1]], diagonal: '/', a: null, b: null });
  assert.equal(E.splitAt(p, 1, 1), null); assert.equal(E.cellAt(p, 1, 1), null, 'both triangles Unstitched clears the cell');
  p = E.apply(p, { type: 'split', cells: [[2, 2], [3, 2]], diagonal: '/', a: '310', b: 'B5200' });
  p = E.apply(p, { type: 'paint', floss: 'B5200', cells: [[2, 2]] });
  assert.equal(E.splitAt(p, 2, 2), null); assert.equal(E.cellAt(p, 2, 2).code, 'B5200');
  p = E.apply(p, { type: 'erase', cells: [[3, 2]] });
  assert.equal(E.splitAt(p, 3, 2), null); assert.equal(E.cellAt(p, 3, 2), null);
});

test('Palette edits reach Split Cell triangles', () => {
  let p = blank();
  p = E.apply(p, { type: 'split', cells: [[1, 1]], diagonal: '/', a: '310', b: 'B5200' });
  p = E.apply(p, { type: 'split', cells: [[2, 1]], diagonal: '/', a: '310', b: '666' });
  p = E.apply(p, { type: 'swap', from: '310', to: '797' });
  assert.deepEqual(codes(E.splitAt(p, 1, 1)), ['/', '797', 'B5200']);
  p = E.apply(p, { type: 'merge', from: '666', into: '797' });
  assert.equal(E.splitAt(p, 2, 1), null, 'merged into one Floss: a full Stitch');
  assert.equal(E.cellAt(p, 2, 1).code, '797');
  p = E.apply(p, { type: 'unstitch', floss: 'B5200' });
  assert.deepEqual(codes(E.splitAt(p, 1, 1)), ['/', '797', null]);
  p = E.apply(p, { type: 'unstitch', floss: '797' });
  assert.equal(E.splitAt(p, 1, 1), null);
});

test('Split Cells undo, save and reload; Patterns saved before Split Cells still load', () => {
  let p = blank();
  const before = E.serialize(p);
  p = E.apply(p, { type: 'split', cells: [[5, 5]], diagonal: '\\', a: null, b: '310' });
  p = E.withExtraStitches(p, true);
  const back = E.deserialize(JSON.parse(JSON.stringify(E.serialize(p))));
  assert.deepEqual(codes(E.splitAt(back, 5, 5)), ['\\', null, '310']);
  assert.equal(back.extraStitches, true);
  assert.equal(E.splitAt(E.undo(back), 5, 5), null);
  assert.deepEqual(codes(E.splitAt(E.redo(E.undo(back)), 5, 5)), ['\\', null, '310']);
  delete before.now.splits; before.past.forEach(s => delete s.splits);
  const old = E.deserialize(before);
  assert.equal(E.splitAt(old, 5, 5), null); assert.equal(old.extraStitches, false);
  assert.equal(blank().extraStitches, false, 'Extra stitch types are off by default');
});

test('Split Cells move with the drawing onto a new Blank and appear on the Chart', () => {
  let p = blank();
  p = E.apply(p, { type: 'split', cells: [[5, 5]], diagonal: '/', a: '310', b: 'B5200' });
  const bigger = E.reshape(p, { ...square, wIn: 2, hIn: 2 });
  assert.deepEqual(codes(E.splitAt(bigger, 10, 10)), ['/', '310', 'B5200']);
  const chart = E.chartLayout(p);
  assert.equal(chart.splits.length, 1);
  const s = chart.splits[0], legend = Object.fromEntries(chart.legend.map(r => [r.code, r]));
  assert.deepEqual([s.x, s.y, s.diagonal, s.a.code, s.b.code], [5, 5, '/', '310', 'B5200']);
  assert.equal(s.a.symbol, legend['310'].symbol);
  assert.equal(legend['310'].parts, 1); assert.equal(legend['B5200'].parts, 1);
});

test('a Ring Hole cuts through Split Cells, and a Cut-Out is cut around them', () => {
  const round = { shape: 'custom', wIn: 1, hIn: 1, count: 10, finish: 'overcast' };
  let p = E.createBlankPattern({ blank: round, palette: ['310'] });
  p = E.apply(p, { type: 'split', cells: [[5, 5]], diagonal: '/', a: '310', b: null });
  p = E.apply(p, { type: 'ring', mode: 'inside', x: 5.5, y: 5.5, size: 2 });
  assert.equal(E.splitAt(p, 5, 5), null, 'inside the Ring Hole');
  let c = E.createBlankPattern({ blank: { shape: 'cutout', longIn: 1, count: 10, finish: 'overcast' }, palette: ['310'] });
  c = E.apply(c, { type: 'ring', mode: 'none' });
  c = E.apply(c, { type: 'split', cells: [[4, 4]], diagonal: '/', a: '310', b: null });
  assert.equal(E.overcastLayout(c).edges.length, 4 + 8, 'a lone Split Cell plus 1-cell Margin gives a 3×3 cut');
});

test('an imported reading with Split Cells keeps them and turns Extra stitch types on', () => {
  const read = { cols: 3, rows: 1, cells: [0, 2, 1], groups: [{}, {}, { paper: true }], splits: [{ x: 1, y: 0, diagonal: '\\', a: 0, b: 2 }, { x: 2, y: 0, diagonal: '/', a: 1, b: 1 }] };
  const p = E.createImportedPattern({ read, flosses: ['310', '666', null] });
  assert.deepEqual(codes(E.splitAt(p, 1, 0)), ['\\', '310', null]);
  assert.equal(E.splitAt(p, 2, 0), null); assert.equal(E.cellAt(p, 2, 0).code, '666', 'one Floss both sides: a full Stitch');
  assert.equal(p.extraStitches, true);
  const plain = E.createImportedPattern({ read: { cols: 1, rows: 1, cells: [0], groups: [{}] }, flosses: ['310'] });
  assert.equal(plain.extraStitches, false);
});
