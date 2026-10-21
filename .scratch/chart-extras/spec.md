# Spec: Chart extras

Status: resolved

## Problem Statement

Importing a Source Chart works for one colored page stitched cell for cell. Real charts are often bigger than a keychain, list their threads in a key I have to retype, are printed in black and white, run across several pages, and use half stitches, quarter stitches and French knots. I want all of these to work without leaving the app.

## Solution

Five slices, each usable on its own:

1. **Shrink to fit.** Putting an imported or hand-drawn Pattern on a Blank too small for it shrinks the design to fit inside the shape (choice: Shrink to fit or Crop), keeping the Palette.
2. **Key numbers.** The thread step has a "Numbers from the key" field. Typing (or pasting) the key's DMC numbers makes every group's guess the nearest of those numbers by color, each number used once where possible. For a PDF the field is filled from the PDF's own text, so most shop charts need no typing.
3. **Symbol-only charts.** When a chart has no printed colors, cells are grouped by the shape of their symbol instead, and each group's close-up shows its symbol for matching against the key.
4. **Several pages.** An imported Pattern can "Add a chart page": the next page is read the same way, then placed to the right of the last page or at the start of a new row, with the repeated rows or columns between pages found automatically (adjustable).
5. **More stitch types.** Half stitches (one diagonal leg), lone quarter stitches (corner to centre) and French knots (at a corner or a cell centre), with Half, Quarter and Knot tools behind "Extra stitch types", drawn in the preview and on the Chart with legend counts.

## Implementation Decisions

- Engine seam as before: `shrinkToFit(pattern, blank)`, `keyGuesses(groups, codes)`, `keyCodesFromText(text)`, symbol grouping inside `readChart`, `chartPartOffset` / `joinChartPart`, and the new stitch types in the Pattern state with edits, undo, save/load, swap/merge/unstitch and reshape.
- Shrinking: the stitched area's bounding box is scaled by the largest factor (at most 1) that keeps every shrunk Stitch inside the Blank's shape, centred; each new cell takes the most common value (a Floss or Unstitched, Split Cell triangles counting half) of the cells it covers; Backstitches and knots scale to the nearest corner; lines that collapse are dropped. No new Flosses appear.
- Key numbers: an assignment by smallest colour difference first, one code per group until codes run out; text parsing accepts DMC codes (numbers, B5200, Blanc, Ecru) and ignores numbers that aren't DMC codes.
- Symbol grouping applies when nearly every non-paper cell is pale and grey (a black-and-white chart). The symbol is compared as a 12 × 12 ink map, allowing a one-pixel shift.
- Joined pages: the Pattern grows on a custom Blank; Show original shows the pages side by side; Re-read chart is hidden for joined Patterns (it would only re-read one page).
- Half and quarter stitches are Palette Flosses and count as parts in the legend; French knots, like Backstitches, have their own Floss outside the Palette and Color Count and their own legend section.

## Testing Decisions

- Engine tests for each slice (shrinking keeps colors and stays inside a round Blank; key guesses use only listed codes; a synthetic black-and-white chart with three symbols reads as three groups; two halves of a chart with one repeated column join into the whole; each new stitch type edits, undoes, saves and reloads).
- Smoke: Shrink to fit on an imported chart; the key field fills from the test PDF; the new tools add stitches.

## Out of Scope

- Reading key numbers from photos (needs OCR).
- Matching symbols to the key automatically.
- Detecting half stitches, quarter stitches and French knots on imported charts.
