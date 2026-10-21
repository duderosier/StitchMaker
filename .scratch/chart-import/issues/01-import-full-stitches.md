# 01: Import a Source Chart (full Stitches)

**What to build:** "Import a chart" takes an image or PDF (page picked from thumbnails), finds the grid (draggable corners with magnifier, suggested and typed counts, grid overlay), reads and groups cells, asks for each group's DMC number or bare fabric, and lands a full-size Pattern on a custom Blank. Imported Patterns hide Photo/Background/Color Count, support Show original and Re-read chart, keep Stitches when the Fabric Count changes, and save with their Source Chart. Custom sizes go up to 12". pdf.js loads on demand and is cached offline.

**Blocked by:** none

**Status:** resolved

- [x] Engine: grid guess, count estimate, perspective cell sampling, grouping, imported Pattern (tests first)
- [x] White-with-symbol cells are Stitches; plain paper cells are Unstitched
- [x] Import dialog: file, PDF page pick, corners + magnifier, counts, overlay, thread confirmation
- [x] Imported Pattern: hidden steps, Show original, Re-read chart (with warning), count change keeps Stitches
- [x] Saved and reopened with its Source Chart
- [x] pdf.js loaded on demand and cached by the service worker
- [x] Smoke check for an image import

## Comments

- 2026-10-21: Implemented. Reading snaps the grid onto the printed gridlines (traced from both ends, then a smooth bend fit), evens out photo lighting, and treats only dark marks as symbols. Counts on a bowed page can be one off; the overlay shows it and the person nudges them. Draw my own also changed (user request): starts on Blank, hides photo-only steps, keeps the drawing centred on resize.
