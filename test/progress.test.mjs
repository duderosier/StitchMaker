import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();
const blank = { shape: 'custom', wIn: 1, hIn: 1, count: 10, finish: 'framed' };
function sample() {
  let p = E.createBlankPattern({ blank, palette: ['310', '321'] });
  p = E.apply(p, { type: 'paint', floss: '310', cells: [[0, 0], [1, 0], [2, 0]] });
  p = E.apply(p, { type: 'paint', floss: '321', cells: [[0, 1]] });
  return E.apply(p, { type: 'split', diagonal: '/', a: '310', b: '321', cells: [[5, 5]] });
}

test('marking stitches done counts progress overall and per thread; bare squares cannot be marked', () => {
  let p = sample();
  assert.deepEqual(E.progress(p), { done: 0, total: 5, threads: [{ code: '310', name: 'Black', hex: '#000000', done: 0, total: 4 }, { code: '321', name: 'Red', hex: '#C72B3B', done: 0, total: 2 }] });
  p = E.withDone(p, [[0, 0], [1, 0], [5, 5], [9, 9]], true);
  const pr = E.progress(p);
  assert.equal(pr.done, 3); assert.equal(pr.total, 5);
  assert.deepEqual(pr.threads.map(t => [t.code, t.done, t.total]), [['310', 3, 4], ['321', 1, 2]], 'a split square counts for both its threads');
  assert.equal(E.isDone(p, 9, 9), false, 'bare fabric is never done');
  p = E.withDone(p, [[1, 0]], false);
  assert.equal(E.progress(p).done, 2);
});

test('progress is not an edit: no undo step, it survives edits and saving, and a stitch erased stops counting', () => {
  let p = E.withDone(sample(), [[0, 0], [1, 0]], true);
  assert.equal(E.canUndo(p), E.canUndo(sample()));
  p = E.apply(p, { type: 'swap', from: '310', to: '699' });
  assert.equal(E.progress(p).done, 2, 'swapping a thread keeps the marks');
  p = E.apply(p, { type: 'erase', cells: [[0, 0]] });
  assert.equal(E.progress(p).done, 1);
  p = E.undo(p);
  assert.equal(E.progress(p).done, 2, 'undoing an edit does not touch progress');
  const back = E.deserialize(JSON.parse(JSON.stringify(E.serialize(p))));
  assert.equal(E.isDone(back, 1, 0), true);
  assert.equal(E.progress(back).done, 2);
  assert.equal(E.progress(E.clearDone(back)).done, 0);
  assert.equal(E.progress(E.reshape(p, { ...blank, wIn: 2, hIn: 2 })).done, 0, 'a new Blank starts over');
});
