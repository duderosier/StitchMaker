# 03: Symbol-only charts

**What to build:** Black-and-white charts group cells by symbol shape.

**Blocked by:** none

**Status:** resolved

- [x] Engine symbol grouping (tests first)
- [x] Smoke or manual check on a black-and-white chart

## Comments

- 2026-10-21: Done. `readChart` switches to symbol grouping when at least 90% of marked cells are pale and grey and there are no Split Cells (`read.symbols`). Each marked cell's symbol is a 12 × 12 soft ink map from the middle 70% of the cell, thresholded against the cell's own paper and softened by a pixel; distance is 1 − soft overlap at the best one-pixel shift. Greedy join (0.38), three settling passes, joining alike groups, then folding specks. Groups start on distinct, easy-to-tell Flosses (310, 321, 797, …) rather than the white nearest the print, and the thread step says to match each symbol to the key. Reliable from about 14 px per cell (a 2000 px page holds about 100 columns at 20 px); at 10–12 px the synthetic X and + merge. Smoke fixture `chart-bw.png`.
