# 06: Background tools

**What to build:** I remove the Background on the photo before reduction: magic wand with tolerance, one-tap remove-border, an erase/restore brush, transparent PNG areas, and undo. Background cells are Unstitched and never use up Palette slots.

**Blocked by:** 04

**Status:** resolved

- [x] Magic wand removes connected similar colors with a tolerance slider
- [x] Remove-border clears edge-connected Background
- [x] Brush erases and restores with adjustable size
- [x] Transparent PNG areas become Background
- [x] Background edits can be undone
- [x] Background never consumes Palette slots

## Comments

- 2026-10-20: Implemented and live on https://duderosier.github.io/StitchMaker/ (see git log).
