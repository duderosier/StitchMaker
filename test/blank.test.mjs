import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();

test('a custom 1×2 inch Blank at 10ct is a 10×20 grid, all inside', () => {
  const g = E.blankGrid({ shape: 'custom', wIn: 1, hIn: 2, count: 10, finish: 'framed' });
  assert.equal(g.cols, 10); assert.equal(g.rows, 20);
  assert.ok(g.inside.every(v => v === 1));
});

test('the 1.5×2" oval at 14ct is 21×28 and its corners are outside', () => {
  const g = E.blankGrid({ shape: 'preset', presetId: 'oval-1.5x2', count: 14, finish: 'framed' });
  assert.equal(g.cols, 21); assert.equal(g.rows, 28);
  assert.equal(g.inside[0], 0);
  assert.equal(g.inside[14 * 21 + 10], 1);
});

test('the 2" heart has its notch at top-centre and a point at the bottom', () => {
  const g = E.blankGrid({ shape: 'preset', presetId: 'heart-2', count: 14, finish: 'framed' });
  const at = (x, y) => g.inside[y * g.cols + x];
  assert.equal(at(14, 3), 0, 'notch between the lobes');
  assert.equal(at(7, 6), 1, 'left lobe');
  assert.equal(at(20, 6), 1, 'right lobe');
  assert.equal(at(2, 26), 0, 'bottom-left corner');
  assert.equal(at(13, 25), 1, 'near the point');
});

test('every Preset Shape produces a grid with something inside it', () => {
  for (const s of E.PRESET_SHAPES) {
    const g = E.blankGrid({ shape: 'preset', presetId: s.id, count: s.count || 14, finish: s.finish || 'framed' });
    assert.ok(g.inside.some(v => v === 1), s.id);
  }
});

test('Overcast only allows plastic-canvas counts; Framed only applies to Preset Shapes and custom sizes', () => {
  assert.deepEqual(E.allowedCounts({ shape: 'preset', presetId: 'round-2', finish: 'overcast' }), [7, 10, 14]);
  assert.deepEqual(E.allowedCounts({ shape: 'preset', presetId: 'round-2', finish: 'framed' }), [7, 10, 11, 14, 16, 18]);
  assert.deepEqual(E.allowedFinishes({ shape: 'cutout' }), ['overcast']);
  assert.deepEqual(E.allowedFinishes({ shape: 'custom' }), ['framed', 'overcast']);
});
