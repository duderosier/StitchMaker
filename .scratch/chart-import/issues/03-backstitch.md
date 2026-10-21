# 03: Backstitch

**What to build:** A Pattern has Backstitches: segments between grid corners, each with a Floss, not counted toward the Color Count. Import detects the chart's lines and highlights them for review; a Line tool adds (corner, then corner) and removes (tap a line) them with the picked Floss; the preview draws them; the Chart prints thick colored lines and a "Backstitch" legend section with each Floss and its length in stitches. Shown only with "Extra stitch types" on.

**Blocked by:** 01

**Status:** resolved

- [x] Engine model, edits, undo, save/load (tests first)
- [x] Import detection and review highlight
- [x] Line tool
- [x] Preview and Chart PDF drawing, legend section

## Comments

- 2026-10-20: Done. Engine: `backstitches` [{x0,y0,x1,y1,f}] on the Pattern, `backstitch`/`unbackstitch` edits (redrawing a line recolors it), swap/merge recolor them, undo, save/load, reshape (lines that no longer fit drop), outside the Palette and Color Count; `backstitchLegend` gives line count and length in stitches. Reading finds unit lines (cell sides and diagonals) that are dark corner to corner, darker than both sides, and (for sides) wider than a bold gridline, grouped by color; on the user's photo it finds 178 lines tracing the outlines, with gaps where curves don't follow corners. Import lists line colors under "Backstitch lines" (DMC or Skip). Line tool: tap a corner, then corners to chain, tap the last corner to stop, tap a line to remove it. Preview draws haloed lines; the Chart PDF prints thick lines and a Backstitch legend section with lengths. Also fixed: count estimate picking a shoulder beside the true gridline repeat; `[hidden]` now always hides.
