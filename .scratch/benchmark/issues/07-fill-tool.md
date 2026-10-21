# 07: Fill (paint bucket) tool

**What to build:** A paint-bucket tool in the Edit step for filling backgrounds and areas quickly, matching how other chart editors fill: the tapped square and every square of its color joined side to side take the current Floss. Option to take every square of that color instead.

**Blocked by:** none

**Status:** resolved

## Comments

- 2026-10-21: Asked for from a phone screenshot of a portrait keychain with a bare background. Done. Engine: `fillCells(p, x, y, { all })` returns the squares (full Stitches of the tapped Floss, or Unstitched squares) joined side to side, inside the Blank; split, half and quarter squares are walls and can't be filled; Backstitches are not walls. The app paints them with one `paint` edit, so one Undo reverses it. Edit step: "Fill" tool with "Touching squares / All of this color", a toast with the count. Tests in `test/fill.test.mjs`; smoke fills around a drawing and undoes it.
