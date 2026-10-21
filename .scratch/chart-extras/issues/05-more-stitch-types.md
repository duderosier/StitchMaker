# 05: Half stitches, quarter stitches, French knots

**What to build:** Three more stitch types with Half, Quarter and Knot tools behind "Extra stitch types", drawn in the preview and Chart with legend counts.

**Blocked by:** none

**Status:** resolved

- [x] Engine model, edits, undo, save/load, Palette edits, reshape (tests first)
- [x] Tools
- [x] Preview and Chart PDF drawing, legend

## Comments

- 2026-10-21: Done. Engine keeps `halves` { cell: { diagonal, f } }, `quarters` { cell: { nw/ne/sw/se: f } } and `knots` [{ x, y, f }] (x, y in steps of ½) beside `cells`, with `half`, `quarter`, `knot` and `unknot` edits (a null Floss clears; a full Stitch, Split Cell, half or quarter in a cell replaces the others), undo, save/load (older saves load with none), Swap/Merge/Drop (Drop leaves knots, which are outside the Palette), rebase, reshape, Shrink to fit (halves vote half, quarters a quarter), joined pages and Ring Holes. `palette` and the Chart legend count halves and quarters per Floss; `knotLegend` gives a French knots section. Half, Quarter and Knot tools sit behind Extra stitch types (Half uses the Diagonal choice; Quarter takes the tapped corner; Knot snaps to the nearest corner or centre; tapping the same again clears). Preview draws legs and ringed dots; the Chart PDF draws thick legs and dots, with "+ n half + n ¼" in the legend and a French knots section. Import detection of these is out of scope.
