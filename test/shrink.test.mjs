import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();
const custom = (w, h, count = 10) => ({ shape: 'custom', wIn: w, hIn: h, count, finish: 'framed' });

// A 40 × 20 drawing: left half 310, right half 321, a Backstitch along the top.
function bigDrawing() {
  let p = E.createBlankPattern({ blank: custom(4, 2), palette: ['310', '321'] });
  const left = [], right = [];
  for (let y = 0; y < 20; y++) for (let x = 0; x < 40; x++) (x < 20 ? left : right).push([x, y]);
  p = E.apply(p, { type: 'paint', floss: '310', cells: left });
  p = E.apply(p, { type: 'paint', floss: '321', cells: right });
  return E.apply(p, { type: 'backstitch', floss: '3865', lines: [[0, 0, 40, 0]] });
}

test('a design that fits is only moved, as reshape does', () => {
  const p = E.apply(E.createBlankPattern({ blank: custom(1, 1), palette: ['310'] }), { type: 'paint', floss: '310', cells: [[5, 5]] });
  assert.equal(E.fitsBlank(p, custom(2, 2)), true);
  const q = E.shrinkToFit(p, custom(2, 2));
  assert.equal(E.cellAt(q, 10, 10).code, '310');
});

test('shrinking scales the stitched area down to fill the Blank, keeping its colors', () => {
  const p = bigDrawing();
  const blank = custom(2, 2);
  assert.equal(E.fitsBlank(p, blank), false);
  const q = E.shrinkToFit(p, blank);
  assert.equal(q.cols, 20); assert.equal(q.rows, 20);
  const pal = E.palette(q);
  assert.deepEqual(pal.map(f => f.code).sort(), ['310', '321']);
  assert.equal(pal[0].count + pal[1].count, 20 * 10, 'half scale: 20 × 10 Stitches');
  assert.equal(E.cellAt(q, 0, 4), null, 'centred: rows above stay Unstitched');
  assert.equal(E.cellAt(q, 0, 5).code, '310');
  assert.equal(E.cellAt(q, 2, 7).code, '310');
  assert.equal(E.cellAt(q, 17, 7).code, '321');
  const bs = E.backstitches(q);
  assert.equal(bs.length, 1);
  assert.deepEqual([bs[0].x0, bs[0].y0, bs[0].x1, bs[0].y1], [0, 5, 20, 5]);
  assert.equal(E.canUndo(q), false, 'a fresh history, like any Blank change');
});

test('shrinking into a round Blank keeps every Stitch inside the circle', () => {
  const p = bigDrawing();
  const round = { shape: 'preset', presetId: 'round-2', count: 14, finish: 'framed' };
  const q = E.shrinkToFit(p, round);
  const inside = E.blankGrid(round).inside;
  let stitched = 0;
  for (let y = 0; y < q.rows; y++) for (let x = 0; x < q.cols; x++) if (E.cellAt(q, x, y)) { stitched++; assert.equal(inside[y * q.cols + x], 1); }
  assert.ok(stitched > 150, `most of the circle is used (${stitched})`);
  assert.equal(E.fitsBlank(q, round), true);
});

test('only the stitched area counts: empty margins are trimmed before shrinking', () => {
  let p = E.createBlankPattern({ blank: custom(4, 4), palette: ['310'] });
  const cells = []; for (let y = 10; y < 30; y++) for (let x = 10; x < 30; x++) cells.push([x, y]);
  p = E.apply(p, { type: 'paint', floss: '310', cells });
  const q = E.shrinkToFit(p, custom(2, 2));
  assert.equal(E.palette(q)[0].count, 400, '20 × 20 fits a 20 × 20 Blank unshrunk');
});

test('Split Cells vote by half, and the shrunk Pattern saves and reloads', () => {
  let p = E.createBlankPattern({ blank: custom(2, 2), palette: ['310', '321'] });
  const all = []; for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) all.push([x, y]);
  p = E.apply(p, { type: 'split', diagonal: '/', a: '310', b: '321', cells: all });
  const q = E.shrinkToFit(p, custom(1, 1));
  assert.equal(q.cols, 10);
  const pal = E.palette(q);
  assert.equal(pal.reduce((n, f) => n + f.count, 0), 100, 'every cell becomes a full Stitch of one of the two');
  const back = E.deserialize(JSON.parse(JSON.stringify(E.serialize(q))));
  assert.deepEqual(E.palette(back), pal);
});

test('the fit choice is a Pattern setting: imports shrink, drawings crop, and it survives saving', () => {
  const drawn = E.createBlankPattern({ blank: custom(1, 1), palette: ['310'] });
  assert.equal(drawn.fit, 'crop');
  const shrinking = E.withFit(drawn, 'shrink');
  assert.equal(E.deserialize(JSON.parse(JSON.stringify(E.serialize(shrinking)))).fit, 'shrink');
  assert.equal(E.reshape(shrinking, custom(2, 2)).fit, 'shrink');
  const read = { cols: 2, rows: 1, cells: [0, 1], groups: [{}, {}], splits: [], lines: [] };
  assert.equal(E.createImportedPattern({ read, flosses: ['310', null] }).fit, 'shrink');
});
