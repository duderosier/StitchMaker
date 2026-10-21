# 01: Shrink to fit

**What to build:** A Pattern without a photo (imported or hand-drawn) placed on a Blank too small for its stitched area shrinks to fit inside the shape, unless "Crop" is chosen. The choice shows on the Blank step for such Patterns and is remembered with the Pattern.

**Blocked by:** none

**Status:** resolved

- [x] Engine `shrinkToFit` (tests first)
- [x] Blank step choice, saved with the Pattern

## Comments

- 2026-10-21: Done. Engine `shrinkToFit` scales the stitched area's bounding box by the largest factor that keeps every Stitch inside the Blank's shape, centred, voting each new cell by covered area (Split Cell triangles count half, ties go to the earlier Palette Floss); Backstitches move to the nearest corners and collapsed or duplicate ones drop. `fitsBlank` says whether a plain move keeps every Stitch. The `fit` setting (`shrink` for imports, `crop` for drawings) rides in the serialized Pattern. Blank step: "Too big for the Blank: Shrink to fit / Crop" for Patterns without a photo; the app fits from the design as it was before the last Blank change while it is unedited, so trying a small Blank and switching back, or flipping Shrink/Crop, loses nothing.
