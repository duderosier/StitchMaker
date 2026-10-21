# 02: Half stitches from chart lines

**What to build:** See spec slice 2.

**Blocked by:** none

**Status:** resolved

## Comments

- 2026-10-21: Decision: no automatic half-stitch detection. Charts draw a half stitch as one diagonal across a square, which is indistinguishable from a one-square diagonal Backstitch, so guessing would turn outlines into half stitches. Instead each Backstitch line color with diagonals gets a "Half stitches" toggle on the thread step: its one-square diagonals over bare squares become Half Stitches (Palette Floss), everything else stays Backstitch. Saved with the Source Chart for Re-read. Fixed along the way: a bare square crossed by one diagonal line read as a white Stitch (the line's ink); reading now re-measures pale squares crossed by exactly one diagonal without the line (finding where the line really runs within ±0.2 square, as the fitted grid leans toward heavy lines) and returns them to bare fabric when nothing else is printed there.
