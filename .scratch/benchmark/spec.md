# Spec: Adopting what popular cross-stitch software does

Status: ready-for-agent

## Problem Statement

Stitchers move between StitchMaker and the programs they already know (WinStitch/MacStitch, PCStitch, FlossCross, Pattern Keeper, Cross Stitch Saga). Those programs share habits StitchMaker lacks: the key tells you strands and skeins, patterns move between programs as `.oxs`, the phone doubles as the chart while stitching, and photos of keys can be read. See `docs/benchmark-2026-10.md`.

## Solution

Six slices:

1. **Key from a photo.** On the thread step, "Read the key from a photo" (this page or another picture) recognizes the key's text on the phone with Tesseract, downloaded the first time it is used and then kept offline (like pdf.js, ADR 0002), and fills "Numbers from the key".
2. **Half stitches from charts.** A Backstitch line color on the thread step can be marked "Half stitches": its one-square diagonal lines become Half Stitches, the rest stay Backstitches.
3. **Strands and skeins.** Each thread on the Colors step and the Chart legend shows the strands to use for the Fabric Count and the skeins to buy (rounded up per color; part stitches and Backstitch length included).
4. **`.oxs` export and import.** The Chart step saves an `.oxs` file; "Import a chart" also opens `.oxs`. Full stitches, Split Cells (¾ + ¼), Half and Quarter Stitches, Backstitches and French Knots carry over; DMC threads only.
5. **Stitch mode.** A Stitch step: tap or drag to mark stitches done (again to unmark), highlight one thread's stitches, percent done and stitches left per thread. Saved with the pattern.
6. **Dithering.** Colors step: Dithering Off/On for photos (Floyd–Steinberg in Lab against the chosen Flosses).

## Implementation Decisions

- Engine stays the seam: `oxsExport(p, opts)` / `oxsImport(text)`, `threadUsage(p)`, half-stitch conversion in `createImportedPattern` (`lineHalf` per line group), progress as plain data (`progress` set of done stitches keyed like the Chart), dithered reduction in `reduce`.
- Tesseract.js pinned on jsDelivr with its core and English data, loaded only on first use and cached by the service worker (ADR 0002 addendum).
- Skeins: stitches per skein = 223 × count ÷ strands per full cross (half stitch ½, quarter ¼, ¾ ¾); Backstitch length × 1.5 per stitch; strands by count (7: 6, 10: 4, 11: 3, 14–18: 2; Backstitch 1).
- Progress is not an edit (no undo history), survives saving, and clears stitches that no longer exist.

## Out of Scope

Beads, petite stitches, other brands, parking, stash.
