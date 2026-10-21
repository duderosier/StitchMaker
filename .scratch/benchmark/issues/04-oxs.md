# 04: .oxs export and import

**What to build:** See spec slice 4.

**Blocked by:** none

**Status:** resolved

## Comments

- 2026-10-21: Done. Engine `oxsExport(p, { title })` writes Ursa-style `.oxs`: properties (size, title, stitches per inch), `palette_item`s ("DMC 310", color, strands, symbol; index 0 cloth), full stitches, part stitches (Split Cells as directions 1/2 with each triangle's color, Half Stitches as 3/4), Backstitches, and French knots plus Quarter Stitches (XSPro `quarter` with `petit="false"`) as ornaments. `oxsImport(text)` reads that and other programs' variants (`<color>` palettes, bare numbers): DMC threads by number, other brands by nearest DMC color (with a warning), unknown objects (beads, petite stitches, lines on half squares) counted in warnings; threads listed but unused stay in the Palette, Backstitch/knot-only threads don't. Chart step: "Save .oxs file" (share sheet or download); "Import a chart" opens `.oxs` as a ready pattern. Edge Stitches have no place in `.oxs` and are left out of exports. Format details from github.com/Kate-nc/cross-stitch (the official Ursa page was unreachable from the sandbox); worth a check with a real WinStitch/MacStitch file.
