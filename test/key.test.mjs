import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './harness.mjs';

const E = loadEngine();
const hex = code => E.floss(code).hex;
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

test('DMC numbers are found in a key\'s text, once each, in order', () => {
  const text = 'Key  Symbol  DMC  Name\nX 310 Black   O 666 Bright Red  + blanc White  # B5200 Snow White\n= ECRU  @ 3865 Winter White  310 again';
  assert.deepEqual(E.keyCodesFromText(text), ['310', '666', 'Blanc', 'B5200', 'Ecru', '3865']);
});

test('sizes, counts and page numbers are not threads', () => {
  const text = 'Design size 120 x 80 stitches, 14 count Aida, 8.5" x 6". Page 2 of 3. Stitched with 2 strands. DMC 310, 17';
  assert.deepEqual(E.keyCodesFromText(text), ['310', '17']);
  assert.deepEqual(E.keyCodesFromText('5 colors: 9999 1 03'), ['03'], 'not a DMC number, and a lone digit is not 01');
});

test('each group gets the nearest listed thread by color, each used once while they last', () => {
  // Printed colors slightly off three key threads; the overall nearest DMC to each print may be another thread.
  const groups = [
    { rgb: rgb(hex('321')).map(v => Math.min(255, v + 12)) },
    { rgb: rgb(hex('310')).map(v => v + 20) },
    { rgb: [250, 250, 250], paper: true },
    { rgb: rgb(hex('3865')).map(v => v - 6) }
  ];
  assert.deepEqual(E.keyGuesses(groups, ['3865', '310', '321']), ['321', '310', null, '3865']);
  // Two greens and one green thread listed: both get it rather than nothing.
  const greens = [{ rgb: rgb(hex('700')) }, { rgb: rgb(hex('701')) }];
  assert.deepEqual(E.keyGuesses(greens, ['700']), ['700', '700']);
  assert.deepEqual(E.keyGuesses(greens, []), [null, null], 'no key: no guesses from it');
});

test('in a PDF\'s text, lines of bare numbers (gridline rulers) are skipped', () => {
  const text = 'Sunny Day - Design size 24 x 20 stitches, 14 count Aida\n10 20 30\nKey Symbol DMC Name\nO 745 Yellow Pale Light\n+ 3752 Antique Blue Very Light\nX Blanc White\nPage 1 of 1';
  assert.deepEqual(E.keyCodesFromText(text, { skipNumberLines: true }), ['745', '3752', 'Blanc']);
  assert.deepEqual(E.keyCodesFromText('310 321 3865'), ['310', '321', '3865'], 'typed numbers need no words');
});

test('key lines pair a printed symbol with its DMC number', () => {
  const text = 'Key Symbol DMC Name\nO 745 Yellow Pale Light\n+   3752  Antique Blue Very Light\nX Blanc White\nBackstitch: 310 Black\nPage 1 of 1';
  assert.deepEqual(E.keyPairsFromText(text), [{ symbol: 'O', code: '745' }, { symbol: '+', code: '3752' }, { symbol: 'X', code: 'Blanc' }]);
  assert.deepEqual(E.keyPairsFromText('745 O Yellow\n3752 + Blue'), [{ symbol: 'O', code: '745' }, { symbol: '+', code: '3752' }], 'number first works too');
});

test('symbols printed as text land in the chart cells under them', () => {
  const grid = E.cornerGrid([[100, 50], [300, 50], [300, 150], [100, 150]], 10, 5); // 20 px cells
  const glyphs = [{ ch: 'O', x: 110, y: 60 }, { ch: '+', x: 291, y: 141 }, { ch: 'X', x: 120, y: 60 }, { ch: '9', x: 40, y: 60 }];
  const at = E.cellSymbols(grid, glyphs);
  assert.equal(at.length, 50);
  assert.equal(at[0], 'O'); assert.equal(at[49], '+');
  assert.equal(at[1], null, 'a glyph on a gridline belongs to no cell');
  assert.equal(at.filter(Boolean).length, 2, 'rulers outside the grid are ignored');
});

test('groups take the DMC number of the key symbol most of their cells carry', () => {
  const read = { cols: 4, rows: 1, cells: [0, 0, 1, 2], splits: [], groups: [{}, {}, { paper: true }] };
  const pairs = [{ symbol: 'O', code: '745' }, { symbol: '+', code: '3752' }];
  assert.deepEqual(E.symbolKeyGuesses(read, ['O', 'O', '+', null], pairs), ['745', '3752', null]);
  assert.deepEqual(E.symbolKeyGuesses(read, ['O', '+', 'X', null], pairs), [null, null, null], 'no clear majority, or a symbol not in the key: no guess');
});
