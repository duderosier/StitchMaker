import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();
const round2 = { shape: 'preset', presetId: 'round-2', count: 14, finish: 'framed' };

test('a blank Pattern starts fully Unstitched with a starter Palette ready to draw with', () => {
  const p = E.createBlankPattern({ blank: round2, palette: ['310', 'B5200'] });
  assert.equal(p.cols, 28); assert.equal(p.rows, 28);
  assert.deepEqual(E.palette(p).map(f => [f.code, f.count]), [['310', 0], ['B5200', 0]]);
  assert.equal(E.cellAt(p, 14, 14), null);
  assert.equal(E.isEdited(p), false);
  const drawn = E.apply(p, { type: 'paint', floss: '310', cells: [[14, 14], [15, 14]] });
  assert.equal(E.palette(drawn)[0].count, 2);
});

test('changing the Blank keeps the drawing centred, dropping only Stitches outside the new shape', () => {
  const small = { shape: 'custom', wIn: 1, hIn: 1, count: 10, finish: 'framed' };
  let p = E.createBlankPattern({ blank: small, palette: ['310'] });
  p = E.apply(p, { type: 'paint', floss: '310', cells: [[5, 5], [0, 0]] });
  const bigger = E.reshape(p, { shape: 'custom', wIn: 2, hIn: 2, count: 10, finish: 'framed' });
  assert.equal(bigger.cols, 20);
  assert.equal(E.cellAt(bigger, 10, 10).code, '310', 'moved by half the growth (5 cells)');
  assert.equal(E.cellAt(bigger, 5, 5).code, '310');
  const round = E.reshape(p, { shape: 'preset', presetId: 'round-1.5', count: 10, finish: 'framed' });
  assert.equal(round.cols, 15);
  assert.equal(E.cellAt(round, 7, 7).code, '310', 'moved by 2 cells');
  assert.equal(E.cellAt(round, 2, 2).code, '310', 'the old corner still fits inside the round');
  const tiny = E.reshape(bigger, { shape: 'preset', presetId: 'round-1.5', count: 7, finish: 'framed' });
  assert.equal(E.cellAt(tiny, 0, 0), null, 'cells outside the round stay Unstitched');
  const smaller = E.reshape(bigger, small);
  assert.equal(E.cellAt(smaller, 5, 5).code, '310', 'shrinking back centres again');
});

test('a drawn Cut-Out is cut around what was drawn', () => {
  let p = E.createBlankPattern({ blank: { shape: 'cutout', longIn: 1, count: 10, finish: 'overcast' }, palette: ['310'] });
  p = E.apply(p, { type: 'ring', mode: 'none' });
  p = E.apply(p, { type: 'paint', floss: '310', cells: [[4, 4], [5, 4], [4, 5], [5, 5]] });
  assert.equal(E.overcastLayout(p).edges.length, 8 + 8, '2×2 block plus 1-cell Margin gives a 4×4 cut');
});
