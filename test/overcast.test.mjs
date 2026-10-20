import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, image } from './harness.mjs';

const E = loadEngine();
const ones = m => m.reduce((n, v) => n + (v ? 1 : 0), 0);
const sq10 = finish => ({ shape: 'custom', wIn: 1, hIn: 1, count: 10, finish });
const bands = finish => E.createPattern({
  image: image(10, 10, x => (x < 5 ? [0, 0, 0] : [255, 255, 255])), blank: sq10(finish), colorCount: 2, confetti: 0,
});
const noRing = p => E.apply(p, { type: 'ring', mode: 'none' });

test('Framed Blanks have no Cut Line, Ring Hole or Edge Stitches', () => {
  assert.equal(E.overcastLayout(bands('framed')), null);
  assert.deepEqual(E.edgeLegend(bands('framed')), []);
});

test('an Overcast Preset Shape is cut along its own outline, with one Edge Stitch per cut edge', () => {
  const L = E.overcastLayout(noRing(bands('overcast')));
  assert.equal(ones(L.cut), 100);
  assert.equal(L.edges.length, 40);
});

test('whole-edge mode colors every Edge Stitch with one Floss, which does not count toward the Color Count', () => {
  const p = E.apply(noRing(bands('overcast')), { type: 'edgeMode', mode: 'whole', floss: '796' });
  assert.ok(E.overcastLayout(p).edges.every(e => e.floss === '796'));
  assert.deepEqual(E.palette(p).map(f => f.code).sort(), ['310', 'B5200']);
  assert.deepEqual(E.edgeLegend(p), [{ code: '796', name: 'Royal Blue Dark', hex: E.DMC.find(f => f.code === '796').hex, count: 40 }]);
});

test('auto-match gives each Edge Stitch the Floss of the Stitch next to it', () => {
  const p = E.apply(noRing(bands('overcast')), { type: 'edgeMode', mode: 'match' });
  const edges = E.overcastLayout(p).edges;
  const leftSide = edges.filter(e => e.side === 'w');
  const rightSide = edges.filter(e => e.side === 'e');
  assert.ok(leftSide.every(e => e.floss === '310'));
  assert.ok(rightSide.every(e => e.floss === 'B5200'));
});

test('individually repainted Edge Stitches keep their Floss when the edge mode changes, and can be undone', () => {
  let p = noRing(bands('overcast'));
  const id = E.overcastLayout(p).edges[0].id;
  p = E.apply(p, { type: 'edgePaint', floss: '666', segments: [id] });
  p = E.apply(p, { type: 'edgeMode', mode: 'match' });
  assert.equal(E.overcastLayout(p).edges.find(e => e.id === id).floss, '666');
  p = E.undo(E.undo(p));
  assert.notEqual(E.overcastLayout(p).edges.find(e => e.id === id).floss, '666');
});

test('an outside Ring Hole sits on a Ring Tab joined to the Cut Line, without changing the stated size', () => {
  const p = E.apply(bands('overcast'), { type: 'ring', mode: 'outside', x: 5, y: -3, size: 2 });
  const L = E.overcastLayout(p);
  // 10×10 square plus a 4-wide, 3-tall tab above it (one row overlaps the square), minus a 2×2 hole.
  assert.equal(ones(L.cut), 108);
  assert.equal(ones(L.hole), 4);
  assert.equal(L.edges.length, 40 + 6 + 8);
  assert.deepEqual(L.designSize, { w: 1, h: 1 });
  assert.deepEqual(L.overallSize, { w: 1, h: 1.3 });
});

test('an inside Ring Hole clears its cells to Unstitched and gets its own Edge Stitches', () => {
  const p = E.apply(bands('overcast'), { type: 'ring', mode: 'inside', x: 5, y: 5, size: 2 });
  const L = E.overcastLayout(p);
  assert.equal(ones(L.cut), 96);
  assert.equal(L.edges.length, 48);
  assert.equal(E.cellAt(p, 4, 4), null);
  assert.equal(E.cellAt(p, 5, 5), null);
  assert.equal(E.palette(p).reduce((n, f) => n + f.count, 0), 96);
});

// A ring-shaped subject on a transparent Background.
const donut = (x, y) => {
  const d = Math.hypot(x - 9.5, y - 9.5);
  return d >= 3 && d <= 7 ? [200, 30, 30] : [0, 0, 0, 0];
};
const cutOut = margin => E.apply(
  E.apply(E.createPattern({ image: image(20, 20, donut), blank: { shape: 'cutout', longIn: 2, count: 10, finish: 'overcast' }, colorCount: 2 }),
    { type: 'ring', mode: 'none' }),
  { type: 'margin', margin });

test('a Cut-Out is cut around the stitched area with inner gaps filled', () => {
  const L = E.overcastLayout(cutOut(0));
  const stitched = E.palette(cutOut(0)).reduce((n, f) => n + f.count, 0);
  assert.ok(ones(L.cut) > stitched, 'the centre gap is filled');
  const centre = (L.offset + 10) * L.cols + (L.offset + 10);
  assert.equal(L.cut[centre], 1);
});

test('the Margin grows the Cut Line by whole cells', () => {
  const c0 = ones(E.overcastLayout(cutOut(0)).cut);
  const c1 = ones(E.overcastLayout(cutOut(1)).cut);
  const c2 = ones(E.overcastLayout(cutOut(2)).cut);
  assert.ok(c0 < c1 && c1 < c2);
  assert.deepEqual(E.overcastLayout(cutOut(1)).designSize, { w: 1.4, h: 1.4 }, 'design size is the stitched area, not the Margin');
});

test('Overcast settings and Edge Stitch overrides survive saving and loading', () => {
  let p = E.apply(bands('overcast'), { type: 'ring', mode: 'inside', x: 5, y: 5, size: 2 });
  p = E.apply(p, { type: 'edgeMode', mode: 'whole', floss: '796' });
  const back = E.deserialize(JSON.parse(JSON.stringify(E.serialize(p))));
  assert.deepEqual(E.overcastLayout(back).edges, E.overcastLayout(p).edges);
});
