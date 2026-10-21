# 04: Charts on several pages

**What to build:** "Add a chart page" on an imported Pattern reads another page and joins it to the right of the last page or as a new row, with the repeated overlap found automatically and adjustable.

**Blocked by:** none

**Status:** resolved

- [x] Engine `chartPartOffset`, `joinChartPart` (tests first)
- [x] Import flow: placement step with overlap; joined Show original; saved layout

## Comments

- 2026-10-21: Done. Engine `chartPartOffset(p, q, at)` slides the next page back over up to 12 columns (or rows) and keeps the overlap whose stitched cells agree best (≥ 97%, at least 4 compared); `joinChartPart(p, q, pos)` grows the Pattern on a custom Blank at the same count, the first page winning where they overlap, Backstitches lying along an existing one dropped, Split Cells kept, fresh history. App: "Add a chart page" on the Colors step (imported Patterns at full size; a shrunk one joins from its full-size design, and a non-custom Blank asks for Custom size first). After the thread step a place step offers "Right of the last page" / "Start a new row" with the repeated count (editable) and a preview with the new page outlined. The Source Chart gains `joined`, `pages` and `layout`; Show original composes the straightened pages; Re-read chart is hidden for joined charts (it would re-read only the first page).
