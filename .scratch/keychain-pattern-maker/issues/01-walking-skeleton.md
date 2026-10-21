# 01: Walking skeleton: photo to Pattern

**What to build:** A single HTML file containing the Pattern Engine and the DMC Floss table. I pick a photo, it auto-fits a 2" round 14ct Blank, reduces to 6 DMC Flosses and shows the Pattern grid on screen. A Node test harness extracts the engine from the HTML and runs it.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Opening the HTML shows a photo picker
- [x] Picking a photo shows a 28×28 Pattern grid on a round outline in at most 6 DMC Flosses
- [x] Cells outside the round are Unstitched
- [x] Engine tests run under Node's built-in test runner by extracting the engine block from the HTML
- [x] Every Palette Floss is a real DMC entry

## Comments

- 2026-10-20: Implemented and live on https://duderosier.github.io/StitchMaker/ (see git log).
