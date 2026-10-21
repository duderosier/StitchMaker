# 02: Numbers from the key

**What to build:** A "Numbers from the key" field on the thread step; DMC guesses come from the listed numbers. PDFs fill it from their text.

**Blocked by:** none

**Status:** resolved

- [x] Engine `keyCodesFromText`, `keyGuesses` (tests first)
- [x] Thread step field; PDF text read with pdf.js

## Comments

- 2026-10-21: Done. Engine `keyCodesFromText` finds DMC codes (numbers, B5200, Blanc, Ecru) once each, leaving out sizes ("24 x 20"), counts, page numbers, decimals, inches, percentages and lone digits; with `skipNumberLines` (PDF text) lines without words, such as gridline rulers, are skipped. `keyGuesses` pairs groups and listed codes closest-color first, one code per group while they last, then the nearest listed one. Thread step: "Numbers from the key" field; typing re-guesses every color not set by hand (typed, picked or Bare fabric). A PDF's text (all pages, up to 40) is read with pdf.js while the grid is placed and fills the field when it is empty. The key is saved with the Source Chart for Re-read. Smoke fixture `chart-key.pdf` (with its generator) has a typed key plus distractors.
