# 08: Match symbols to a key drawn as pictures

**What to build:** A black-and-white chart in a picture (JPEG, PNG, photo) whose key draws each symbol beside its DMC number: Read the key matches every symbol to its number, as 06 does for PDFs whose symbols are text.

**Blocked by:** 03, 06

**Status:** resolved

- [x] Black-and-white charts with small cells (about 9 px) read as symbol charts
- [x] Engine `keyIcons`, `keyIconGuesses` (tests first)
- [x] Read the key on this page / Key in another photo use them for symbol charts

## Comments

- 2026-10-21: Reported by the user with a "Home Freebie" chart (900 × 655 JPEG, 61 × 67 cells of about 9 px, nine symbols, key table Symbol / name / DMC). Two faults: (1) at that size a symbol's ink made cells look like Split Cells, so the chart was not seen as black-and-white and was grouped into three groups by darkness; (2) for pictures, Read the key only filled numbers and guessed by printed color, which means nothing on a black-and-white chart.
- 2026-10-21: Done. The black-and-white test now runs before Split Cell detection (no Split Cells on such charts). Symbol glyphs sample between pixels and are centred on their ink; below 12 px per cell symbols must be closer to join (0.32 rather than 0.38), since the key joins over-split groups again by giving them one number. For symbol charts, Read the key runs text recognition in sparse-text mode (finds a table's numbers as words of their own), and `keyIcons` takes each lone DMC number's row, skips its name words, and takes the nearest mark to their left as the icon (box frames, table lines, specks and rows of ruler numbers are left out; a number listed twice keeps its top row). Icons and chart symbols are compared as shapes scaled to fit 12 × 12; `keyIconGuesses` gives each group the closest icon, each icon once while they last. On the user's chart all nine rows are found and 32 of 32 hand-checked cells get the right number. Falls back to reading numbers when fewer than two icons are found. Not covered: keys whose symbol is right of the number, and non-DMC keys (Anchor numbers are read as DMC numbers).
