# 02: Split Cells

**What to build:** A cell can be a Split Cell: a diagonal plus a Floss or Unstitched per triangle. Import detects diagonally split cells; a Split tool creates and changes them; the preview and Chart draw two triangles with small Symbols; the legend counts them; saving reads older Patterns unchanged. The Split tool shows only when the Pattern's "Extra stitch types" switch is on (off by default, on automatically for imports that contain Split Cells).

**Blocked by:** 01

**Status:** resolved

- [x] Engine model, edits, undo, save/load (tests first)
- [x] Import detection
- [x] Split tool and "Extra stitch types" switch
- [x] Preview and Chart PDF drawing, legend counts

## Comments

- 2026-10-20: Done. Engine keeps Split Cells beside `cells` (`splits`, keyed by cell) with `split` edits, Palette edits, undo, save/load (older saves load with none) and reshape. A triangle-pair with one Floss settles to a full Stitch. Reading compares each cell's four quarters between its diagonals; on the user's photographed page it finds 88, which spot checks show are real ¾ stitches (curves, cells under Backstitch). Split tool: pick a diagonal, tap a triangle to give it the current Floss, tap again to clear. Preview fills triangles; the Chart draws them with a diagonal and small Symbols, and the legend lists split halves per Floss. "Extra stitch types" is on the Edit step, off by default, on for imports with Split Cells.
