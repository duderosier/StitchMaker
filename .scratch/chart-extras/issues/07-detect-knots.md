# 07: Read French knots from charts

**What to build:** Dots printed on grid corners are read as French knots, grouped by color and confirmed on the thread step (DMC number or Skip), landing as French knots on the imported Pattern.

**Blocked by:** 05

**Status:** resolved

- [x] Engine `readKnots` inside `readChart`, knots on the imported Pattern (tests first)
- [x] Thread step "French knots found on the chart"; saved for Re-read; smoke fixture

## Comments

- 2026-10-21: Done. A corner holds a knot when, a fifth of a cell out in the twelve directions that miss the gridlines, the page is uniformly at least 60 darker than the lightest of the four cell corners further out (0.45 diagonally). A dot drags the fitted grid crossing toward itself, so the dot's middle is looked for within ±0.2 cell of each corner. Corners where two or more read Backstitch lines end are skipped (crossing lines look like a dot there). Knots are grouped by color like Backstitch lines; their DMC guesses follow key numbers too. Only corners: a dot in a cell's middle is a symbol as often as a knot. Light knots on white (less than 60 darker) are missed. Fixture `chart-knots.png`. Half and quarter stitches are still not read from charts: printed as a half-colored cell they already read as Split Cells, and as a single leg they look like a one-cell Backstitch.
