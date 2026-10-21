# 06: Match symbols to the key (PDFs)

**What to build:** When a PDF prints its chart symbols and key as text, each color takes the DMC number beside its symbol in the key, with no typing, even for black-and-white charts.

**Blocked by:** 02, 03

**Status:** resolved

- [x] Engine `keyPairsFromText`, `cellSymbols`, `symbolKeyGuesses` (tests first)
- [x] PDF page glyph positions; matching after reading; smoke fixture

## Comments

- 2026-10-21: Done. `keyPairsFromText` pairs a one-character symbol right before (or after) a DMC number on each key line. The full-size PDF page render also records every printed character's middle on the page (`glyphs`); `cellSymbols` puts each one in the cell whose centre it sits near (within 35% of a cell, so gridline rulers and labels outside the grid don't count); `symbolKeyGuesses` gives each group the code of the symbol at least 60% of its symbol-carrying cells show. Matches win over color guesses from key numbers; colors set by hand win over both. Fixture `chart-symbols.pdf` (black-and-white vector chart, symbols and key as text, with its generator). Photos still need typing: no text to read.
