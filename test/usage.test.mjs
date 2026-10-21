import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();
const custom = (w, h, count, finish = 'framed') => ({ shape: 'custom', wIn: w, hIn: h, count, finish });
function filled(blank, code, n) {
  let p = E.createBlankPattern({ blank, palette: [code] });
  const cells = []; for (let i = 0; i < n; i++) cells.push([i % p.cols, Math.floor(i / p.cols)]);
  return E.apply(p, { type: 'paint', floss: code, cells });
}

test('strands follow the Fabric Count; Backstitch uses half as many', () => {
  assert.deepEqual(E.threadUsage(filled(custom(2, 2, 14), '310', 1)).strands, { cross: 2, back: 1, knot: 2 });
  assert.deepEqual(E.threadUsage(filled(custom(2, 2, 7, 'overcast'), '310', 1)).strands, { cross: 6, back: 3, knot: 6 });
  assert.deepEqual(E.threadUsage(filled(custom(2, 2, 11), '310', 1)).strands, { cross: 3, back: 2, knot: 3 });
});

test('skeins: about 1,560 full crosses per skein on 14 count with two strands, rounded up per thread', () => {
  const small = E.threadUsage(filled(custom(4, 4, 14), '310', 100)).threads;
  assert.deepEqual(small.map(t => [t.code, t.skeins]), [['310', 1]]);
  assert.ok(small[0].meters >= 0.4 && small[0].meters < 1, `100 crosses ≈ ${small[0].meters} m of six-strand floss`);
  const big = E.threadUsage(filled(custom(12, 12, 14), '310', 1600)).threads[0];
  assert.equal(big.skeins, 2, '1,600 crosses need a second skein');
  const pc = E.threadUsage(filled(custom(12, 12, 7, 'overcast'), '310', 300)).threads.find(t => t.code === '310');
  assert.equal(pc.skeins >= 2, true, 'plastic canvas with six strands uses far more');
});

test('part stitches, Backstitch, French knots and Edge Stitches all count, each thread once', () => {
  let p = E.createBlankPattern({ blank: custom(2, 2, 14), palette: ['310', '321'] });
  p = E.apply(p, { type: 'half', diagonal: '/', floss: '321', cells: [[0, 0]] });
  p = E.apply(p, { type: 'backstitch', floss: '310', lines: [[0, 0, 10, 0]] });
  p = E.apply(p, { type: 'knot', floss: '3865', points: [[3, 3]] });
  const u = E.threadUsage(p);
  assert.deepEqual(u.threads.map(t => [t.code, t.uses.sort().join('+')]), [['321', 'half'], ['310', 'backstitch'], ['3865', 'knot']]);
  assert.ok(u.threads.every(t => t.skeins === 1));
  const over = E.threadUsage(E.reshape(filled(custom(1, 1, 7, 'overcast'), '310', 9), custom(1, 1, 7, 'overcast')));
  assert.ok(over.threads.some(t => t.uses.includes('edge')), 'Overcast edges use thread too');
});

test('the Chart legend carries strands and skeins', () => {
  const c = E.chartLayout(filled(custom(2, 2, 14), '310', 10));
  assert.deepEqual(c.strands, { cross: 2, back: 1, knot: 2 });
  assert.equal(c.legend[0].skeins, 1);
});
