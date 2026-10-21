import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();
const blank = { shape: 'custom', wIn: 1, hIn: 1, count: 10, finish: 'framed' };
const fresh = () => E.createBlankPattern({ blank, palette: ['310'] });
const roundTrip = p => E.deserialize(JSON.parse(JSON.stringify(E.serialize(p))));

test('a half stitch is one diagonal leg of a Palette Floss; it replaces the cell and can be cleared', () => {
  let p = E.apply(fresh(), { type: 'paint', floss: '310', cells: [[2, 2]] });
  p = E.apply(p, { type: 'half', diagonal: '/', floss: '321', cells: [[2, 2], [3, 2]] });
  assert.equal(E.cellAt(p, 2, 2), null, 'the full Stitch gave way');
  assert.deepEqual(E.halfList(p), [{ x: 2, y: 2, diagonal: '/', code: '321' }, { x: 3, y: 2, diagonal: '/', code: '321' }]);
  const row = E.palette(p).find(f => f.code === '321');
  assert.equal(row.halves, 2); assert.equal(row.count, 0);
  p = E.apply(p, { type: 'half', diagonal: '/', floss: null, cells: [[3, 2]] });
  assert.equal(E.halfList(p).length, 1);
  p = E.apply(p, { type: 'paint', floss: '310', cells: [[2, 2]] });
  assert.equal(E.halfList(p).length, 0, 'painting a full Stitch over it replaces it');
});

test('quarter stitches go in a cell\'s corners, up to four, each with its own Floss', () => {
  let p = E.apply(fresh(), { type: 'quarter', corner: 'nw', floss: '310', cells: [[1, 1]] });
  p = E.apply(p, { type: 'quarter', corner: 'se', floss: '321', cells: [[1, 1]] });
  assert.deepEqual(E.quarterList(p), [{ x: 1, y: 1, corner: 'nw', code: '310' }, { x: 1, y: 1, corner: 'se', code: '321' }]);
  p = E.apply(p, { type: 'quarter', corner: 'nw', floss: null, cells: [[1, 1]] });
  assert.deepEqual(E.quarterList(p), [{ x: 1, y: 1, corner: 'se', code: '321' }]);
  p = E.apply(p, { type: 'half', diagonal: '\\', floss: '310', cells: [[1, 1]] });
  assert.deepEqual(E.quarterList(p), [], 'a half stitch replaces the quarters');
  assert.throws(() => E.apply(p, { type: 'quarter', corner: 'up', floss: '310', cells: [[0, 0]] }));
});

test('French knots sit on corners or cell centres with their own Floss, outside the Palette', () => {
  let p = E.apply(fresh(), { type: 'knot', floss: '3865', points: [[2, 2], [2.5, 3.5], [2.3, 1]] });
  assert.deepEqual(E.knots(p).map(k => [k.x, k.y, k.code]), [[2, 2, '3865'], [2.5, 3.5, '3865']], 'off-grid points are refused');
  assert.equal(E.palette(p).some(f => f.code === '3865'), false);
  assert.deepEqual(E.knotLegend(p).map(r => [r.code, r.count]), [['3865', 2]]);
  p = E.apply(p, { type: 'knot', floss: '310', points: [[2, 2]] });
  assert.deepEqual(E.knots(p).map(k => k.code), ['310', '3865'], 'a knot in the same place is recolored');
  p = E.apply(p, { type: 'unknot', points: [[2.5, 3.5]] });
  assert.equal(E.knots(p).length, 1);
});

test('the new stitch types undo, save and reload, and follow Swap, Merge and Drop', () => {
  let p = E.apply(fresh(), { type: 'half', diagonal: '/', floss: '321', cells: [[0, 0]] });
  p = E.apply(p, { type: 'quarter', corner: 'ne', floss: '321', cells: [[1, 0]] });
  p = E.apply(p, { type: 'knot', floss: '321', points: [[1, 1]] });
  const back = roundTrip(p);
  assert.deepEqual([E.halfList(back), E.quarterList(back), E.knots(back)], [E.halfList(p), E.quarterList(p), E.knots(p)]);
  assert.equal(E.halfList(E.undo(E.undo(E.undo(p)))).length, 0);
  const swapped = E.apply(p, { type: 'swap', from: '321', to: '699' });
  assert.deepEqual([E.halfList(swapped)[0].code, E.quarterList(swapped)[0].code, E.knots(swapped)[0].code], ['699', '699', '699']);
  const dropped = E.apply(p, { type: 'unstitch', floss: '321' });
  assert.deepEqual([E.halfList(dropped).length, E.quarterList(dropped).length, E.knots(dropped).length], [0, 0, 1], 'knots are not Palette stitches');
  assert.equal(E.isEdited(roundTrip(fresh())), false);
});

test('the Chart lists half and quarter stitches with their Floss and French knots in their own legend section', () => {
  let p = E.apply(fresh(), { type: 'half', diagonal: '\\', floss: '321', cells: [[0, 0]] });
  p = E.apply(p, { type: 'quarter', corner: 'sw', floss: '321', cells: [[1, 0]] });
  p = E.apply(p, { type: 'knot', floss: '310', points: [[3, 3]] });
  const c = E.chartLayout(p);
  assert.deepEqual(c.halves.map(h => [h.x, h.y, h.diagonal, h.code]), [[0, 0, '\\', '321']]);
  assert.deepEqual(c.quarters.map(q => [q.x, q.y, q.corner, q.code]), [[1, 0, 'sw', '321']]);
  assert.deepEqual(c.knots.map(k => [k.x, k.y, k.code]), [[3, 3, '310']]);
  const row = c.legend.find(r => r.code === '321');
  assert.equal(row.halves, 1); assert.equal(row.quarters, 1);
  assert.deepEqual(c.knotLegend.map(r => [r.code, r.count]), [['310', 1]]);
});

test('moving to another Blank or shrinking keeps them in place', () => {
  let p = E.apply(fresh(), { type: 'half', diagonal: '/', floss: '321', cells: [[5, 5]] });
  p = E.apply(p, { type: 'knot', floss: '310', points: [[5, 5]] });
  const bigger = E.reshape(p, { ...blank, wIn: 2, hIn: 2 });
  assert.deepEqual(E.halfList(bigger), [{ x: 10, y: 10, diagonal: '/', code: '321' }]);
  assert.deepEqual(E.knots(bigger).map(k => [k.x, k.y]), [[10, 10]]);
  assert.equal(E.fitsBlank(p, { ...blank, wIn: 0.5, hIn: 0.5 }), true, 'a lone half stitch near the middle fits a smaller Blank');
});
