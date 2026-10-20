# Spec: Keychain Pattern Maker (v1)

Status: ready-for-agent

## Problem Statement

I make cross-stitch keychains and want to turn my own photos (pets, people, objects, drawings) into stitchable patterns sized for a specific keychain. Desktop tools like Cricut Design Space let you simplify an image to a few colors, but they don't produce a cross-stitch Chart, don't know real thread colors, don't understand keychain Blanks (framed inserts, plastic canvas shapes, cut-outs with a ring hole and overcast edge), and aren't built for my phone. I want to do the whole thing on my iPhone (and test it on my Android Fold) without uploading my photos anywhere.

## Solution

A single-page app, delivered as one self-contained HTML file served from GitHub Pages and added to the phone's home screen (see ADR 0001). I pick a Blank (shape + Finish + Fabric Count), load a photo, frame it inside the outline, remove the Background, choose a Color Count and get a Pattern snapped to DMC Floss with flat color regions. I clean it up with Palette operations (Merge, Swap, mark Unstitched) and Stitch-level pencil/eraser with undo. For Overcast Blanks I set the Cut Line, place a Ring Hole and color the Edge Stitches. I export a one-page Letter PDF Chart with Symbols and a legend. Work auto-saves on the phone and I can keep a list of patterns.

## User Stories

### Blank
1. As a stitcher, I want to choose from Preset Shapes (1.5" round, 2" round, 2" heart, 2" square, 2" hexagon, 1.5×2" oval, 1.5×2.5" rectangle), so that the Pattern fits the keychain blanks I buy.
2. As a stitcher, I want to enter a custom width × height in inches, so that I can match a blank that isn't a preset.
3. As a stitcher, I want to choose a Fabric Count from 7, 10, 11, 14, 16 or 18, so that the stitch grid matches my fabric or canvas.
4. As a stitcher, I want to see the resulting stitch grid size (e.g. 28 × 28 Stitches) as I change the Blank, so that I know how much detail I'll get.
5. As a stitcher, I want to choose a Framed Finish for a Preset Shape, so that the Pattern is made for Aida pressed into a keychain frame.
6. As a stitcher, I want to choose an Overcast Finish for any shape, so that the Pattern is made for plastic canvas cut out and edged.
7. As a stitcher, I want Overcast to limit Fabric Count to 7, 10 or 14, so that I only get plastic-canvas counts.
8. As a stitcher, I want to choose a Cut-Out shape sized by its longest side in inches, so that the keychain takes the shape of the design itself.
9. As a stitcher, I want Cut-Out to always use the Overcast Finish, so that I'm never offered a combination that can't be made.
10. As a stitcher, I want cells outside a Preset Shape's outline to be Unstitched automatically, so that I never stitch where the fabric won't show.
11. As a stitcher, I want to change the Blank after loading a photo and keep my photo framing where possible, so that I can compare sizes without starting over.

### Photo and framing
12. As a stitcher, I want to pick a photo from my phone's library or take one with the camera, so that I can use any image I have.
13. As a stitcher, I want to pan, zoom (pinch) and rotate the photo inside the Blank's outline, starting from an automatic fit, so that the subject fills the small keychain well.
14. As a stitcher, I want to see the Blank outline over the photo while framing, so that I can tell what will be cut off.
15. As a stitcher, I want large phone photos to load quickly, so that the app stays responsive.
16. As a stitcher, I want photo orientation from the camera to be respected, so that portrait shots aren't sideways.

### Background
17. As a stitcher, I want to tap the Background with a magic wand that removes connected, similar colors, so that I can clear a plain backdrop in one tap.
18. As a stitcher, I want a tolerance slider for the magic wand, so that I can control how much it grabs.
19. As a stitcher, I want a one-tap "remove border" that removes Background-looking color touching the photo's edges, so that simple photos clean up instantly.
20. As a stitcher, I want an erase/restore brush with an adjustable size, so that I can fix spots the automatic tools got wrong.
21. As a stitcher, I want transparent areas of an uploaded PNG treated as Background, so that I can use my phone's built-in "lift subject" cutout.
22. As a stitcher, I want Background removal to happen on the photo before color reduction, so that Background colors never use up Palette slots.
23. As a stitcher, I want Background cells to be Unstitched in the Pattern, so that bare fabric shows through.
24. As a stitcher, I want to undo Background edits, so that a bad tap isn't permanent.

### Color reduction
25. As a stitcher, I want a Color Count slider from 2 to 16, so that I can simplify the design like Cricut does.
26. As a stitcher, I want every Floss in the Palette to be a real DMC color with its number and name, so that I can buy the thread.
27. As a stitcher, I want colors chosen to look as close as possible to the photo, so that the Pattern resembles the subject.
28. As a stitcher, I want flat color regions with no dithering, so that the Pattern is pleasant to stitch.
29. As a stitcher, I want confetti cleanup (stray isolated Stitches absorbed into their neighbours) on by default with an adjustable strength, so that the Pattern isn't noisy.
30. As a stitcher, I want the Pattern to update as I move the Color Count slider, so that I can compare quickly.
31. As a stitcher, I want two reduced colors that snap to the same DMC Floss to be combined, so that the Palette never lists a Floss twice.
32. As a stitcher, I want to see before/after (photo vs Pattern), so that I can judge the simplification.

### Palette editing
33. As a stitcher, I want to see the Palette with each Floss's swatch, DMC number, name and Stitch count, so that I know what's in the design.
34. As a stitcher, I want to Merge one Floss into another, so that I can drop colors that barely matter.
35. As a stitcher, I want to Swap a Floss for any DMC Floss using a searchable picker (by number, name or by browsing swatches), so that I can use thread I already own.
36. As a stitcher, I want to mark a Floss as Unstitched, so that I can drop a color region to bare fabric.
37. As a stitcher, I want my manual Palette edits to survive small changes (e.g. confetti strength) where possible, and to be warned before a Color Count change discards them, so that I don't lose work silently.
38. As a stitcher, I want tapping a Floss to highlight its Stitches on the grid, so that I can see where it's used.

### Stitch editing
39. As a stitcher, I want a pencil that paints single Stitches with a chosen Palette Floss, so that I can fix eyes and outlines by hand.
40. As a stitcher, I want a "+ Floss" button that adds any DMC Floss to the Palette for painting, so that I can add an accent color.
41. As a stitcher, I want an eraser that makes cells Unstitched, so that I can remove Stitches.
42. As a stitcher, I want to drag to paint or erase multiple cells in one stroke, so that editing is fast.
43. As a stitcher, I want to zoom and pan the grid with two fingers while editing, so that single cells are easy to hit on a phone.
44. As a stitcher, I want undo and redo for all Pattern edits, so that I can experiment freely.
45. As a stitcher, I want an eyedropper that selects the Floss of a tapped Stitch, so that I can paint with an existing color quickly.
46. As a stitcher, I want gridlines and bold lines every 10 Stitches on screen, so that I can count like on paper.

### Overcast: Cut Line, Ring Hole, Edge Stitches
47. As a stitcher, I want a Cut-Out's Cut Line computed from the stitched area with inner gaps filled, so that I get one clean outline to cut.
48. As a stitcher, I want to set the Margin from 0 to 2 cells, so that I can leave canvas between the design and the edge.
49. As a stitcher, I want a Preset Shape with Overcast Finish to use the shape's outline as its Cut Line, so that rounds and hearts can be cut and edged too.
50. As a stitcher, I want to place a Ring Hole anywhere on an Overcast Blank, so that the keychain hangs the way I like.
51. As a stitcher, I want to toggle the Ring Hole between a Ring Tab outside the design and a hole inside the design, so that I can choose a look.
52. As a stitcher, I want an outside Ring Hole to sit on a Ring Tab that joins the Cut Line, so that the tab is cut as part of the piece.
53. As a stitcher, I want an inside Ring Hole to clear its cells to Unstitched and get its own ring of Edge Stitches, so that the hole is finished properly.
54. As a stitcher, I want Ring Hole size presets plus a custom size, so that it fits my jump rings.
55. As a stitcher, I want the stated Blank size to exclude the Ring Tab and the app to show the true overall size, so that I cut the right amount of canvas.
56. As a stitcher, I want Edge Stitches along the Cut Line and around an inside Ring Hole, so that the Chart shows the finished edge.
57. As a stitcher, I want to color all Edge Stitches with one Floss, so that the edge is uniform.
58. As a stitcher, I want an auto-match mode where each Edge Stitch takes the Floss of its neighbouring Stitch, so that the edge blends into the design.
59. As a stitcher, I want to repaint individual Edge Stitches on top of either mode, so that I can fine-tune the edge.
60. As a stitcher, I want Edge Flosses not to count toward the Color Count, so that the edge doesn't steal design colors.
61. As a stitcher, I want Framed Blanks to offer no Ring Hole or Edge Stitches, so that I'm not shown options that don't apply.

### Chart (PDF)
62. As a stitcher, I want to export a one-page Letter PDF Chart, so that I can print it or keep it on my phone.
63. As a stitcher, I want the Chart grid to show colored cells with a distinct Symbol per Floss, so that I can read it in color or in black and white.
64. As a stitcher, I want bold gridlines every 10 Stitches and row/column numbers, so that I can keep my place.
65. As a stitcher, I want the Blank outline or Cut Line drawn on the Chart, so that I know where the edge is.
66. As a stitcher, I want Edge Stitches and the Ring Hole drawn on the Chart, so that finishing is documented.
67. As a stitcher, I want a legend with Symbol, DMC number, name and Stitch count for each Floss, and a separate "Edge" section, so that I can gather thread.
68. As a stitcher, I want a black-and-white (symbols only) toggle, so that I can print cheaply.
69. As a stitcher, I want the Chart to include the pattern name, Blank, Fabric Count and finished size, so that it's self-explanatory.
70. As a stitcher, I want Symbols to be easy to tell apart even when the Palette has 16+ Flosses, so that the Chart stays readable.
71. As an iPhone user, I want the PDF to open the share sheet (Save to Files, Print, AirDrop), so that saving works on iOS.

### Saving
72. As a stitcher, I want my current work auto-saved on the phone, so that closing the app doesn't lose anything.
73. As a stitcher, I want a "My patterns" list where I can open, rename and delete saved Patterns, so that I can keep several projects.
74. As a stitcher, I want a saved Pattern to restore its Blank, photo framing, Background, Palette edits, Stitch edits and Overcast settings, so that I can keep working where I left off.
75. As a stitcher, I want to be told if the phone runs out of storage, so that I know a save failed.

### App and layout
76. As an iPhone user, I want to add the app to my home screen and have it open full-screen, so that it feels like an app.
77. As a phone user, I want a single-column layout with tools along the bottom, so that it's usable one-handed.
78. As a Fold user, I want photo and Pattern side by side on the unfolded screen, so that I use the space.
79. As a user, I want the app to work offline once loaded, so that I can use it anywhere.
80. As a user, I want my photos never to leave my phone, so that my pictures stay private.
81. As a user, I want controls large enough to tap and clearly labelled, so that it's easy to use on a small screen.

## Implementation Decisions

- **One file, no build** (ADR 0001): everything ships in a single HTML file — markup, styles, scripts, the DMC Floss table and any PDF library — inlined so the app works offline. Served from GitHub Pages; a minimal web app manifest and service worker may be inlined or added only if they don't require a second hand-maintained source file (if a separate tiny manifest/service-worker file is unavoidable for "Add to Home Screen" offline support, generate it from the same HTML at publish time or accept it as the one exception and note it).
- **Pattern Engine** — the one deep module, a self-contained script block in the HTML with no DOM, canvas or storage access. It takes plain data and returns plain data:
  - Input image: width, height and RGBA pixel array (already cropped/scaled to the stitch grid by the UI, plus a Background mask).
  - Blank: shape (Preset Shape id with size, custom width × height, or Cut-Out with longest side), Finish (Framed/Overcast), Fabric Count. The engine derives the stitch grid and the inside-the-shape mask.
  - Settings: Color Count, confetti strength, Margin, Ring Hole (placement, inside/outside, size), Edge mode.
  - Commands on a Pattern state: reduce, Merge, Swap, mark Floss Unstitched, add Floss, paint, erase, set Edge Floss (whole / auto-match / individual), place Ring Hole, set Margin, undo, redo.
  - Derived outputs: the Pattern grid (Floss id or Unstitched per cell), Palette with Stitch counts, Cut Line polygon/cell set, Ring Tab cells, Edge Stitch list with Flosses, finished overall size, and a **Chart layout** (Symbol per Floss, legend rows, gridline positions, outline, edge marks) as data.
  - Pattern state is serializable to JSON for saving.
- **Background tools** (magic wand flood fill with tolerance, remove-border, brush, PNG alpha) operate on the photo at stitch-grid-adjacent resolution and produce a Background mask the engine consumes. The mask-building logic (flood fill with tolerance, border fill, alpha threshold) lives in the Pattern Engine so it is testable; the UI only supplies taps and brush strokes.
- **Color matching** uses a perceptual color space (CIELAB distance) for both reduction and snapping to DMC. Reduction clusters the non-Background stitch-grid pixels to the Color Count, snaps each cluster to its nearest DMC Floss, and combines clusters that land on the same Floss. No dithering. Confetti cleanup reassigns small isolated groups to the most common neighbouring Floss.
- **DMC Floss table**: full standard DMC list (number, name, RGB) embedded as data. Values come from a published public reference; record the source in a comment.
- **Symbols**: a fixed ordered set of high-contrast glyphs assigned by Palette order, distinct enough for at least 24 Flosses plus edge marks.
- **UI shell** (thin): Blank picker, photo framing (pan/pinch/rotate), Background tools, Color Count and Palette panel, grid editor with pencil/eraser/eyedropper and undo, Overcast panel, export. Responsive: single column below a width breakpoint, side by side above it.
- **Chart rendering**: draws the engine's Chart layout into a one-page Letter PDF with an embedded PDF library; on iOS delivers via the Web Share API with a file, falling back to a download link.
- **Persistence**: IndexedDB stores saved Patterns (engine JSON plus a downscaled copy of the source photo and framing). Current work auto-saves after edits (debounced). "My patterns" lists, renames and deletes. All storage access is wrapped so failures are reported, not fatal.
- **Image loading**: decode with EXIF orientation respected; downscale large photos before processing.

## Testing Decisions

- **One seam: the Pattern Engine.** Tests extract the engine's script block from the single HTML file and run it under Node's built-in test runner with no dependencies. Nothing else is unit-tested.
- Good tests exercise external behavior only: given an input image (small synthetic RGBA arrays — stripes, blocks, a circle on a plain background, a transparent PNG-like alpha mask), a Blank and settings, assert on the resulting Pattern, Palette, Cut Line, Edge Stitches and Chart layout. Never assert on internal clustering steps or private helpers.
- Areas to cover:
  - Blank → stitch grid sizing for presets, custom sizes and Cut-Outs; cells outside the shape are Unstitched.
  - Background: magic wand tolerance, remove-border, alpha treated as Background, Background never consuming Palette slots.
  - Reduction: Palette size ≤ Color Count, every Floss is a real DMC entry, duplicates combined, flat regions on block images, confetti cleanup removes isolated Stitches.
  - Palette ops: Merge, Swap, mark Unstitched, add Floss; Stitch counts stay correct.
  - Stitch edits and undo/redo round-trips.
  - Overcast: Cut Line fills inner gaps and respects Margin; Ring Tab joins the Cut Line and doesn't change stated size; inside Ring Hole clears cells and gets Edge Stitches; Edge modes (whole, auto-match, individual overrides); Edge Flosses excluded from Color Count; Framed Blanks have no edge or hole.
  - Chart layout: unique Symbol per Floss, legend counts match the grid, Edge section present only for Overcast.
  - Save/load: engine state JSON round-trips exactly.
- No prior art exists in the repo; these are the first tests.
- **Manual device checklist** (iPhone Safari home-screen app and Galaxy Z Fold 8, folded and unfolded): photo pick and camera, EXIF orientation, pinch framing, Background tools by touch, grid editing precision, PDF share sheet on iOS and download on Android, auto-save after closing the app, offline use after first load, layout breakpoint on the Fold.

## Out of Scope

- Half stitches, quarter stitches, backstitch and French knots.
- Dithering.
- A built-in AI subject cutout (use the phone's own "lift subject" and a transparent PNG instead).
- Accounts, cloud sync, sharing patterns between phones, a server of any kind.
- PNG or other export formats besides the PDF Chart; A4 or multi-page Charts.
- Thread brands other than DMC; skein/length estimates.
- A stitching mode for ticking off Stitches.

## Further Notes

- Glossary terms (Blank, Preset Shape, Cut-Out, Finish, Framed, Overcast, Cut Line, Margin, Ring Hole, Ring Tab, Edge Stitch, Background, Pattern, Stitch, Unstitched, Palette, Color Count, Merge, Swap, Chart, Symbol, Floss, Fabric Count) are defined in `GLOSSARY.md`; use them in code names and UI copy.
- Preset Shape sizes are typical retail sizes, not a verified industry list; keep them in one editable data table.
- Publishing: a GitHub repository with Pages enabled; the user has a GitHub account.
