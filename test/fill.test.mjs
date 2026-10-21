import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();
const blank = { shape: 'custom', wIn: 1, hIn: 1, count: 10, finish: 'framed' }; // 10 x 10
const fresh = () => E.createBlankPattern({ blank, palette: ['310'] });
const key = cells => cells.map(c => c.join(',')).sort();

// A ring of 310 from (2,2) to (6,6) with a hole inside it.
function ring() {
  const cells = [];
  for (let i = 2; i <= 6; i++) cells.push([i, 2], [i, 6], [2, i], [6, i]);
  return E.apply(fresh(), { type: 'paint', floss: '310', cells });
}

test('fill reaches the touching squares of the tapped color, side to side, and stops at other colors', () => {
  const p = ring();
  const outside = E.fillCells(p, 0, 0);
  assert.equal(outside.length, 100 - 16 - 9, 'the background around the ring, not the hole inside it');
  assert.ok(!key(outside).includes('4,4'));
  assert.deepEqual(key(E.fillCells(p, 4, 4)), key([3, 4, 5].flatMap(x => [3, 4, 5].map(y => [x, y]))), 'the hole alone');
  assert.equal(E.fillCells(p, 2, 2).length, 16, 'the ring itself');
});

test('squares touching only at a corner are not joined', () => {
  const p = E.apply(fresh(), { type: 'paint', floss: '310', cells: [[0, 0], [1, 1]] });
  assert.deepEqual(E.fillCells(p, 0, 0), [[0, 0]]);
});

test('"all of this color" takes every square of it, holes too', () => {
  const p = ring();
  assert.equal(E.fillCells(p, 0, 0, { all: true }).length, 100 - 16);
  assert.equal(E.fillCells(p, 3, 2, { all: true }).length, 16);
});

test('split, half and quarter squares are walls and cannot be filled', () => {
  let p = E.apply(fresh(), { type: 'split', diagonal: '/', a: '310', b: null, cells: [[1, 0]] });
  p = E.apply(p, { type: 'half', diagonal: '/', floss: '321', cells: [[1, 1]] });
  p = E.apply(p, { type: 'quarter', corner: 'nw', floss: '321', cells: [[0, 2]] });
  p = E.apply(p, { type: 'paint', floss: '310', cells: [[1, 2]] });
  // (0,0) and (0,1) are boxed in by the split, the half, the quarter and the left edge.
  assert.deepEqual(key(E.fillCells(p, 0, 0)), ['0,0', '0,1']);
  assert.deepEqual(E.fillCells(p, 1, 0), []);
  assert.deepEqual(E.fillCells(p, 0, 2), []);
  assert.deepEqual(E.fillCells(p, -1, 0), [], 'off the grid');
});

test('fill stays inside the Blank and painting the result is one undoable edit', () => {
  const round = E.createBlankPattern({ blank: { shape: 'preset', presetId: 'round-1.5', count: 14, finish: 'framed' }, palette: ['310'] });
  const inside = E.blankGrid(round.blank).inside, c = Math.floor(round.cols / 2);
  const cells = E.fillCells(round, c, c);
  assert.equal(cells.length, inside.filter(Boolean).length, 'the whole round, none of its corners');
  assert.deepEqual(E.fillCells(round, 0, 0), [], 'a corner outside the round');
  const p = E.apply(ring(), { type: 'paint', floss: '321', cells: E.fillCells(ring(), 4, 4) });
  assert.equal(E.cellAt(p, 4, 4).code, '321');
  assert.equal(E.cellAt(p, 0, 0), null);
  assert.equal(E.cellAt(E.undo(p), 4, 4), null);
});
