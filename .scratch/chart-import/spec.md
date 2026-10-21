# Spec: Import a Source Chart

Status: ready-for-agent

## Problem Statement

I own cross-stitch charts made by other people: PDFs from shops and pages in printed kit books. I want to bring one into StitchMaker so I can edit it (swap threads, fix stitches, put it on a Blank with an Overcast edge) and print my own Chart, instead of only starting from a photo or drawing by hand.

## Solution

An "Import a chart" button next to "Choose photo" takes an image or a PDF. The app finds the chart's grid (I adjust the four corners and the stitch counts if needed), reads every cell, groups cells that look alike, and asks me to confirm each group's DMC number from the chart's key. The result is a Pattern at full size on a custom Blank that I edit like any other. Everything runs on the phone (ADR 0001); PDFs are drawn with pdf.js, loaded only when needed (ADR 0002).

Delivered in three slices: (1) full Stitches only, (2) Split Cells, (3) Backstitch.

## User Stories

### Bringing a chart in
1. As a stitcher, I want an "Import a chart" button next to "Choose photo", so that I can start from a chart I own.
2. As a stitcher, I want to import a PNG/JPEG (a screenshot or a phone photo of a printed page), so that book charts work.
3. As a stitcher, I want to import a PDF, so that shop charts work without screenshots.
4. As a stitcher, I want to pick the page from thumbnails when a PDF has several pages, so that I can skip cover and key pages.
5. As a stitcher, I want PDF import to keep working offline after the first time, so that the app stays an offline app.

### Finding the grid
6. As a stitcher, I want the app to guess where the chart's grid is, so that clean PDFs need no adjusting.
7. As a stitcher, I want four draggable corners with a magnifier, so that I can line up an angled phone photo precisely.
8. As a stitcher, I want the app to suggest how many stitches across and down, and to let me type them, so that the grid matches the chart.
9. As a stitcher, I want the grid drawn over the chart while I adjust, so that I can see when it lines up.

### Reading the cells
10. As a stitcher, I want cells grouped by how they look, so that I confirm each thread once, not each cell.
11. As a stitcher, I want a white cell that carries a symbol read as a Stitch, and only a plain empty cell read as Unstitched, so that white thread isn't lost.
12. As a stitcher, I want each group shown with its printed color, a close-up of its symbol, its cell count and a DMC guess, so that I can match it to the key.
13. As a stitcher, I want to type the DMC number from the key (with the thread name shown to confirm), or mark a group as bare fabric, so that the Palette uses real thread.
14. As a stitcher, I want groups I give the same DMC number to become one Floss, so that the Palette never lists a Floss twice.
15. As a stitcher, I want cells crossed by Backstitch lines to still read as the color under them, so that outlines don't spoil the reading.

### The imported Pattern
16. As a stitcher, I want the import to land at full size on a custom Blank sized stitches ÷ Fabric Count (14 by default), so that it is stitched cell for cell.
17. As a stitcher, I want changing the Fabric Count of an imported Pattern to keep every Stitch and change the size in inches, so that I can try other fabrics.
18. As a stitcher, I want custom sizes up to 12", so that big charts fit.
19. As a stitcher, I want the Photo and Background steps and the Color Count controls hidden for an imported Pattern, so that only steps that apply are shown.
20. As a stitcher, I want Palette editing, Stitch editing, Edge/Finish and the Chart to work as usual, so that an import is a normal Pattern.
21. As a stitcher, I want "Show original" to lay the straightened Source Chart over the Pattern, so that I can check the reading.
22. As a stitcher, I want "Re-read chart" to reopen the corners and counts, warning me before it discards my edits, so that I can fix a bad reading.
23. As a stitcher, I want imported Patterns saved in My patterns with their Source Chart, so that re-read and Show original work after reopening.

### Split Cells (slice 2)
24. As a stitcher, I want diagonally split cells on the chart read as Split Cells with a Floss (or Unstitched) per triangle, so that ¾ stitches are kept.
25. As a stitcher, I want a Split tool to make or change a Split Cell (diagonal and triangle colors), so that I can fix or add them.
26. As a stitcher, I want Split Cells drawn as two triangles in the preview and on the Chart, each with a small Symbol, and counted in the legend, so that I can stitch them.

### Backstitch (slice 3)
27. As a stitcher, I want Backstitch lines on the chart detected and shown highlighted for review, so that outlines are kept.
28. As a stitcher, I want a Line tool (tap a corner, tap another corner; tap a line to remove it) with a chosen Floss, so that I can add and fix Backstitches.
29. As a stitcher, I want Backstitches printed as thick lines in their thread color with a "Backstitch" legend section giving each Floss and its length in stitches, so that I can buy and stitch them.
30. As a stitcher, I want Backstitches not to count toward the Color Count, so that outlines don't take Palette slots.

### Photo Patterns
31. As a stitcher, I want a per-Pattern "Extra stitch types" switch, off by default, that shows the Split and Line tools on any Pattern, and that is on automatically for imports that contain them, so that the editor stays simple unless I want more.

## Implementation Decisions

- **Engine seam, as before.** Chart reading is pure data: RGBA image + four corners + counts in, cell samples and groups out. New engine functions: a grid guess (corners) from long grid lines, a stitch-count estimate from gridline periodicity inside the corners, perspective sampling of each cell's inner area (median color and ink fraction), grouping, and creating an imported Pattern. The UI only supplies the image, the dragged corners and the confirmed DMC numbers.
- **Perspective:** corners define a homography from the unit grid to the image, so angled photos are read correctly. Page curvature is not modelled.
- **Bare fabric:** a cell is Unstitched when it is near the page's paper color and has little ink. Paper color is estimated from the lightest common cell color.
- **Grouping:** cells are clustered by printed color (CIELAB) plus ink fraction, so a white cell with a symbol stays apart from plain paper. Tiny groups fold into their nearest group.
- **DMC guess:** nearest DMC to the printed color; always editable. Reading the key automatically (local OCR/AI) is later.
- **Imported Pattern:** a custom Blank (`wIn = cols / count`, `hIn = rows / count`, Framed by default). The saved record keeps the Source Chart image, its corners, counts and the group→Floss answers, plus a straightened copy for Show original. Hand-drawn Patterns are unchanged.
- **pdf.js** (pinned 3.x UMD build from cdnjs) is injected on the first PDF import and cached by the service worker (ADR 0002).
- **Split Cells** (slice 2) extend a cell from one Floss to an optional diagonal plus two triangle values; saving gains a version step that reads old Patterns unchanged.
- **Backstitch** (slice 3) is a list of segments between grid corners, each with a Floss, stored on the Pattern and undoable like Stitch edits.

## Testing Decisions

- Engine tests with synthetic chart images: a clean axis-aligned grid with colored, symbol and plain cells; the same grid under a perspective warp; heavy black lines crossing cells. Assert on counts, groups, which cells are Unstitched, and the resulting Pattern (Blank size, Palette, Stitches).
- Count changes on an imported Pattern keep every Stitch.
- Save/load round-trips the imported Pattern.
- Smoke test: import a generated chart image through the UI, confirm the groups, land on Edit with the right grid size.
- Manual: the user's photographed book page (not committed) and a real PDF.

## Out of Scope

- Black-and-white symbol-only charts (needs symbol recognition).
- Charts spanning several pages.
- Reading the key's DMC numbers automatically.
- Half stitches (single diagonal leg), lone quarter stitches, French knots.
- Shrinking an imported chart to fit a smaller Blank (later).

## Further Notes

- Glossary terms added: Source Chart, Split Cell, Backstitch.
- Decisions came from a grilling session on 2026-10-20.
