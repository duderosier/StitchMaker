import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();
const square = { shape: 'custom', wIn: 1, hIn: 1, count: 10, finish: 'framed' };
const blank = () => E.createBlankPattern({ blank: square, palette: ['B5200'] });
const lines = p => E.backstitches(p).map(b => [b.x0, b.y0, b.x1, b.y1, b.code]);

test('Backstitches run between grid corners in their own Floss, outside the Palette', () => {
  let p = blank();
  p = E.apply(p, { type: 'backstitch', floss: '310', lines: [[1, 1, 2, 1], [2, 1, 3, 2]] });
  assert.deepEqual(lines(p), [[1, 1, 2, 1, '310'], [2, 1, 3, 2, '310']]);
  assert.deepEqual(E.palette(p).map(f => f.code), ['B5200'], 'not a Palette Floss, so not counted toward the Color Count');
  const legend = E.backstitchLegend(p);
  assert.equal(legend.length, 1);
  assert.equal(legend[0].code, '310');
  assert.equal(legend[0].length, Math.round((1 + Math.SQRT2) * 10) / 10, 'length in stitches');
});

test('the same line drawn again takes the new Floss; zero-length and off-grid lines are ignored', () => {
  let p = blank();
  p = E.apply(p, { type: 'backstitch', floss: '310', lines: [[1, 1, 2, 1]] });
  p = E.apply(p, { type: 'backstitch', floss: '666', lines: [[2, 1, 1, 1], [3, 3, 3, 3], [9, 9, 11, 9]] });
  assert.deepEqual(lines(p), [[1, 1, 2, 1, '666']]);
});

test('removing Backstitches; Palette swaps reach them; undo and redo', () => {
  let p = blank();
  p = E.apply(p, { type: 'backstitch', floss: '310', lines: [[0, 0, 1, 0], [1, 0, 2, 0]] });
  p = E.apply(p, { type: 'unbackstitch', lines: [[1, 0, 0, 0]] });
  assert.deepEqual(lines(p), [[1, 0, 2, 0, '310']]);
  p = E.apply(p, { type: 'swap', from: '310', to: '3799' });
  assert.deepEqual(lines(p), [[1, 0, 2, 0, '3799']]);
  assert.deepEqual(lines(E.undo(p)), [[1, 0, 2, 0, '310']]);
  assert.equal(lines(E.undo(E.undo(p))).length, 2);
});

test('Backstitches save, reload and move with the drawing onto a new Blank', () => {
  let p = blank();
  p = E.apply(p, { type: 'backstitch', floss: '310', lines: [[5, 5, 6, 6]] });
  const edge = E.apply(p, { type: 'backstitch', floss: '310', lines: [[0, 0, 1, 0]] });
  const back = E.deserialize(JSON.parse(JSON.stringify(E.serialize(p))));
  assert.deepEqual(lines(back), [[5, 5, 6, 6, '310']]);
  assert.deepEqual(lines(E.undo(back)), []);
  const bigger = E.reshape(p, { ...square, wIn: 2, hIn: 2 });
  assert.deepEqual(lines(bigger), [[10, 10, 11, 11, '310']]);
  const smaller = E.reshape(edge, { ...square, wIn: 0.5, hIn: 0.5 });
  assert.deepEqual(lines(smaller), [[2, 2, 3, 3, '310']], 'lines that no longer fit are dropped');
});

test('the Chart lists Backstitches as lines with a legend of lengths', () => {
  let p = blank();
  p = E.apply(p, { type: 'paint', floss: 'B5200', cells: [[2, 2]] });
  p = E.apply(p, { type: 'backstitch', floss: '310', lines: [[2, 2, 3, 2], [3, 2, 3, 3]] });
  const chart = E.chartLayout(p);
  assert.equal(chart.backstitches.length, 2);
  assert.deepEqual(chart.backstitches[0], { x0: 2, y0: 2, x1: 3, y1: 2, code: '310', hex: '#000000' });
  assert.deepEqual(chart.backstitchLegend.map(r => [r.code, r.length]), [['310', 2]]);
  assert.deepEqual(chart.legend.map(r => r.code), ['B5200']);
});

test('an imported reading with lines becomes Backstitches in the chosen Floss, or none when skipped', () => {
  const read = { cols: 2, rows: 1, cells: [0, 1], groups: [{}, { paper: true }], splits: [],
    lines: [{ x0: 0, y0: 0, x1: 1, y1: 1, group: 0 }, { x0: 1, y0: 0, x1: 2, y1: 0, group: 1 }], lineGroups: [{}, {}] };
  const p = E.createImportedPattern({ read, flosses: ['B5200', null], lineFlosses: ['310', null] });
  assert.deepEqual(lines(p), [[0, 0, 1, 1, '310']]);
  assert.equal(p.extraStitches, true);
});
