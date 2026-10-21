import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();
const blank = { shape: 'custom', wIn: 1, hIn: 1, count: 14, finish: 'framed' };

function everything() {
  let p = E.createBlankPattern({ blank, palette: ['310', '321', 'B5200'] });
  p = E.apply(p, { type: 'paint', floss: '310', cells: [[0, 0], [1, 0], [5, 5]] });
  p = E.apply(p, { type: 'split', diagonal: '/', a: '321', b: null, cells: [[2, 2]] });
  p = E.apply(p, { type: 'split', diagonal: '\\', a: '310', b: 'B5200', cells: [[3, 2]] });
  p = E.apply(p, { type: 'half', diagonal: '/', floss: '321', cells: [[4, 4]] });
  p = E.apply(p, { type: 'half', diagonal: '\\', floss: 'B5200', cells: [[6, 4]] });
  p = E.apply(p, { type: 'quarter', corner: 'se', floss: '310', cells: [[7, 7]] });
  p = E.apply(p, { type: 'quarter', corner: 'nw', floss: '321', cells: [[7, 7]] });
  p = E.apply(p, { type: 'backstitch', floss: '3865', lines: [[0, 0, 3, 0], [3, 0, 4, 1]] });
  p = E.apply(p, { type: 'knot', floss: '310', points: [[9, 9], [8.5, 2.5]] });
  return p;
}
const view = p => ({
  size: [p.cols, p.rows],
  cells: p.cells.map((f, i) => (f >= 0 ? [i % p.cols, Math.floor(i / p.cols), E.DMC[f].code] : null)).filter(Boolean),
  splits: E.splitList(p), halves: E.halfList(p), quarters: E.quarterList(p),
  back: E.backstitches(p).map(b => [b.x0, b.y0, b.x1, b.y1, b.code]), knots: E.knots(p).map(k => [k.x, k.y, k.code])
});

test('a Pattern written as .oxs reads back the same: every stitch type, Floss and the Fabric Count', () => {
  const p = everything(), xml = E.oxsExport(p, { title: 'Bee & "friends"' });
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<chart>/);
  assert.match(xml, /<properties oxsversion="1.0" software="StitchMaker"[^>]*chartwidth="14" chartheight="14"[^>]*charttitle="Bee &amp; &quot;friends&quot;"/);
  assert.match(xml, /<palette_item index="0" number="cloth"/);
  assert.match(xml, /<palette_item index="\d+" number="DMC 310" name="Black" color="000000"/);
  assert.match(xml, /<partstitch x="4" y="4" palindex1="\d+" palindex2="0" direction="3"/);
  assert.match(xml, /<object x1="7.5" y1="7.5" palindex="\d+" objecttype="quarter" petit="false"/);
  assert.match(xml, /<object x1="8.5" y1="2.5" palindex="\d+" objecttype="knot"/);
  const back = E.oxsImport(xml);
  assert.deepEqual(back.warnings, []);
  assert.equal(back.title, 'Bee & "friends"');
  assert.deepEqual(view(back.pattern), view(p));
  assert.equal(back.pattern.blank.count, 14);
  assert.equal(back.pattern.extraStitches, true);
  assert.deepEqual(E.palette(back.pattern).map(f => f.code).sort(), ['310', '321', 'B5200'], 'Backstitch-only threads stay out of the Palette');
  const unused = E.oxsImport(E.oxsExport(E.createBlankPattern({ blank, palette: ['310', '699'] })));
  assert.deepEqual(E.palette(unused.pattern).map(f => f.code), ['310', '699'], 'threads not yet stitched are kept');
});

test('.oxs from other programs: <color> palettes, bare numbers, unknown threads by color, and what cannot be kept', () => {
  const xml = `<?xml version="1.0"?>
<chart>
  <properties chartwidth="4" chartheight="3" stitchesperinch="18" charttitle="Imported"/>
  <palette>
    <color index="0" number="cloth" name="cloth" color="FFFFFF"/>
    <color index="1" number="310" name="Black" color="000000"/>
    <color index="2" number="Anchor 9046" name="Red" color="C72B3B"/>
  </palette>
  <fullstitches><stitch x="0" y="0" palindex="1"/><stitch x="3" y="2" palindex="2"/><stitch x="1" y="1" palindex="0"/></fullstitches>
  <partstitches><partstitch x="2" y="0" palindex1="1" palindex2="2" direction="2"/></partstitches>
  <backstitches><backstitch x1="0" y1="0" x2="4" y2="0" palindex="1" objecttype="backstitch"/><backstitch x1="0.5" y1="0" x2="1" y2="1" palindex="1" objecttype="backstitch"/></backstitches>
  <ornaments_inc_knots_and_beads><object x1="1" y1="1" palindex="1" objecttype="knot"/><object x1="2" y1="2" palindex="2" objecttype="bead"/></ornaments_inc_knots_and_beads>
</chart>`;
  const r = E.oxsImport(xml);
  const p = r.pattern;
  assert.equal(p.cols, 4); assert.equal(p.rows, 3); assert.equal(p.blank.count, 18);
  assert.equal(E.cellAt(p, 0, 0).code, '310');
  assert.equal(E.cellAt(p, 1, 1), null, 'cloth is Unstitched');
  assert.equal(E.cellAt(p, 3, 2).code, '321', 'a non-DMC thread becomes the nearest DMC Floss');
  assert.deepEqual(E.splitList(p), [{ x: 2, y: 0, diagonal: '/', a: '310', b: '321' }]);
  assert.deepEqual(E.backstitches(p).map(b => [b.x0, b.y0, b.x1, b.y1]), [[0, 0, 4, 0]]);
  assert.deepEqual(E.knots(p).map(k => [k.x, k.y]), [[1, 1]]);
  assert.deepEqual(r.warnings.sort(), ['1 bead left out', '1 line between half squares left out', 'Anchor 9046 matched to DMC 321 by color'].sort());
});

test('a file that is not an .oxs chart is refused', () => {
  assert.throws(() => E.oxsImport('<html><body>hi</body></html>'), /not an .oxs chart/);
  assert.throws(() => E.oxsImport('<chart><properties chartwidth="0" chartheight="5"/></chart>'), /size/);
});
