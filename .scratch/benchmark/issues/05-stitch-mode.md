# 05: Stitch mode: mark progress, highlight a thread

**What to build:** See spec slice 5.

**Blocked by:** none

**Status:** resolved

## Comments

- 2026-10-21: Done. Engine: `done` (0/1 per square) with `withDone`, `clearDone`, `isDone` and `progress` (squares done of squares with any stitch, and per Palette thread; a Split Cell counts for both its threads). Not an edit: no undo step, kept through edits and undo, saved (run-length encoded) with the Pattern, cleared on a new Blank; erased squares stop counting. App: a Stitch step after Chart with Mark done / Move; one stroke marks, or unmarks when it starts on a done square; done squares are veiled with a tick; tapping a thread highlights its stitches (others dim); percent done with a bar and stitches left per thread; Start over (with a confirm). Backstitch and French knots are not tracked, like Pattern Keeper.
