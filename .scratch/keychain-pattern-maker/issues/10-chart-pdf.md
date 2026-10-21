# 10: Chart PDF

**What to build:** I export a one-page Letter PDF Chart: colored cells with a Symbol per Floss, bold gridlines every 10, row/column numbers, the Blank outline, a legend (Symbol, DMC number, name, Stitch count) and header (name, Blank, count, finished size), with a black-and-white toggle. iOS opens the share sheet; Android downloads.

**Blocked by:** 03, 05

**Status:** resolved

- [x] PDF is one Letter page
- [x] Each Floss has a unique Symbol; legend counts match the grid
- [x] Black-and-white toggle renders symbols only
- [x] Header shows name, Blank, Fabric Count, finished size
- [x] Share sheet on iOS, download fallback elsewhere

## Comments

- 2026-10-20: Implemented and live on https://duderosier.github.io/StitchMaker/ (see git log).
