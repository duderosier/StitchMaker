import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();
const CODES = ['310', '321', '699', '3865'];

// A whole chart as a reading: value(x, y) gives an index into CODES, or -1 for bare fabric.
function reading(cols, rows, value, x0 = 0, y0 = 0) {
  const cells = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const v = value(x + x0, y + y0); cells.push(v < 0 ? CODES.length : v); }
  return { cols, rows, cells, splits: [], lines: [], groups: CODES.map(() => ({})).concat([{ paper: true }]) };
}
const imported = r => E.createImportedPattern({ read: r, flosses: CODES.concat([null]) });
const design = (x, y) => ((x * 7 + y * 3) % 11 < 3 ? -1 : (x * x + y) % 4);

test('a page that continues to the right is found to repeat its first columns, and joins into the whole chart', () => {
  const whole = imported(reading(30, 12, design));
  const left = imported(reading(18, 12, design)), right = imported(reading(14, 12, design, 16, 0)); // columns 16, 17 repeated
  const at = E.chartPartOffset(left, right, { side: 'right', x: 18, y: 0 });
  assert.deepEqual(at, { x: 16, y: 0, overlap: 2 });
  const joined = E.joinChartPart(left, right, at);
  assert.equal(joined.cols, 30); assert.equal(joined.rows, 12);
  assert.deepEqual(joined.cells, whole.cells);
  assert.deepEqual(joined.blank, E.chartBlank(30, 12, 14, 'framed'));
  assert.deepEqual(E.palette(joined).map(f => [f.code, f.count]), E.palette(whole).map(f => [f.code, f.count]));
});

test('a new row of pages starts below, with no repeated rows when there are none', () => {
  const top = imported(reading(20, 10, design)), bottom = imported(reading(20, 9, design, 0, 10));
  const at = E.chartPartOffset(top, bottom, { side: 'below', x: 0, y: 10 });
  assert.deepEqual(at, { x: 0, y: 10, overlap: 0 });
  const joined = E.joinChartPart(top, bottom, at);
  assert.deepEqual(joined.cells, imported(reading(20, 19, design)).cells);
});

test('four pages, two by two, join row by row into the whole chart', () => {
  const whole = imported(reading(26, 22, design));
  const part = (x, y, w, h) => imported(reading(w, h, design, x, y));
  let p = part(0, 0, 14, 12);
  let at = E.chartPartOffset(p, part(13, 0, 13, 12), { side: 'right', x: 14, y: 0 });
  assert.equal(at.overlap, 1);
  p = E.joinChartPart(p, part(13, 0, 13, 12), at);
  at = E.chartPartOffset(p, part(0, 11, 14, 11), { side: 'below', x: 0, y: 12 });
  assert.equal(at.overlap, 1);
  p = E.joinChartPart(p, part(0, 11, 14, 11), at);
  at = E.chartPartOffset(p, part(13, 11, 13, 11), { side: 'right', x: 14, y: 11 });
  assert.deepEqual(at, { x: 13, y: 11, overlap: 1 });
  p = E.joinChartPart(p, part(13, 11, 13, 11), at);
  assert.deepEqual(p.cells, whole.cells);
});

test('joining keeps Backstitches and Split Cells from both pages, with the overlap counted once', () => {
  let a = imported(reading(10, 6, design)), b = imported(reading(10, 6, design, 9, 0));
  a = E.apply(a, { type: 'backstitch', floss: '310', lines: [[0, 0, 10, 0]] });
  b = E.apply(b, { type: 'backstitch', floss: '310', lines: [[0, 0, 1, 0], [2, 2, 3, 3]] });
  b = E.apply(b, { type: 'split', diagonal: '/', a: '321', b: null, cells: [[5, 5]] });
  const j = E.joinChartPart(a, b, { x: 9, y: 0 });
  assert.equal(j.cols, 19);
  assert.deepEqual(E.backstitches(j).map(l => [l.x0, l.y0, l.x1, l.y1]), [[0, 0, 10, 0], [11, 2, 12, 3]]);
  assert.deepEqual(E.splitList(j), [{ x: 14, y: 5, diagonal: '/', a: '321', b: null }]);
  assert.equal(j.extraStitches, true);
  assert.equal(E.canUndo(j), false);
});
