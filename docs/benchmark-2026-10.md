# Benchmark: popular cross-stitch software (October 2026)

What the widely used design and stitching programs do with stitch types and features, and what StitchMaker adopts. Research by web search; several vendor pages could not be opened from the research sandbox, so app-store listings, reviews and one open-source implementation fill in. Treat feature claims as "as advertised".

## Programs looked at

| Program | Kind | Notes |
|---|---|---|
| WinStitch / MacStitch (Ursa) | Desktop design | Top-rated Windows pick in reviews; ~30 thread brands; created the open **OXS** file format; multi-page printing shades the overlap. |
| PCStitch (M&R) | Desktop design | Longest-established; full, half, quarter stitches, backstitch, French knots; beads in the top tier; auto backstitch; own file format, no direct PDF. |
| FlossCross | Web design | Free, no account; photo or blank; PDF with a thread chart; exports OXS for MacStitch/WinStitch; 300 × 300 limit. |
| Stitch Fiddle | Web design | Usual free online pick. |
| Pattern Keeper | Mobile stitching | Opens shop PDFs, highlights a symbol and shows its thread, marks finished stitches by swiping or a whole 10 × 10 block, tracks stitches left per thread; full crosses only. |
| Cross Stitch Saga | Mobile stitching | Half, quarter, petite, backstitch, long stitch, French knots, beads; marking, statistics, parking; opens XSD, XSP, PAT, OXS (not PDF or images). |
| StitchHub, Stitchwork, Cross Stitch Creator | Mobile | Fractional stitches, marking, percent complete, stitches left, OXS/XSD import. |
| stitchx (Kate-nc/cross-stitch, open source) | Web suite | Cross, half (both ways), quarter, three-quarter, backstitch, knots, beads; per-thread strands and skein estimates; OXS, PDF, PNG export; tracker with marking, highlight views, parking. |

## Stitch types

| Stitch | How charts and programs show it | StitchMaker |
|---|---|---|
| Full cross | Symbol (and color) in the square | Stitch |
| Half stitch (one leg, "tent") | A diagonal line, or a half-size symbol on the diagonal; OXS `partstitch` direction 3 (/) or 4 (\\) | Half Stitch |
| Quarter stitch | Tiny symbol in a corner; OXS (XSPro extension) `object objecttype="quarter" petit="false"` at the corner's half position | Quarter Stitch |
| Three-quarter stitch | Triangle of color or a symbol in the larger part; often paired with a quarter of another color in the same square; OXS `partstitch` direction 1 (\\) or 2 (/) with a color each side | Split Cell (a triangle left Unstitched is a lone ¾) |
| Petite (mini cross) | Small cross in a quarter square, mostly on evenweave | Not adopted: rare on Aida and plastic canvas keychains |
| Backstitch | Thick line in thread color; legend lists line threads separately | Backstitch |
| French knot | Dot on a corner (sometimes a square's middle); separate legend section; OXS `object objecttype="knot"` | French Knot |
| Beads, long stitch, specialty | Beads in PCStitch/Saga/stitchx; long and specialty stitches in a few | Not adopted for now (see Later) |

## Features most programs share

1. **Thread list with stitch counts, strands and skeins.** Charts tell you how many strands to use and how many skeins to buy. Planning rule of thumb: about 1,500 full crosses per skein on 14-count with two strands (estimates range 1,050–2,400; a forum formula is stitches per skein ≈ 223 × count ÷ strands); round up per color.
2. **Interchange via OXS.** WinStitch/MacStitch, FlossCross, Cross Stitch Saga, StitchHub and stitchx read or write `.oxs`, so a pattern made in one opens in the others.
3. **Stitching mode on the phone.** Pattern Keeper, Saga, StitchHub and others: highlight one thread's stitches, mark stitches done by tap or drag (or a whole block), percent complete and stitches left per thread.
4. **Photo conversion controls.** Color count, cleanup of stray stitches and an optional dithering mode for photographs; small, bold designs look best without dithering.
5. **Reading other people's charts.** Pattern Keeper reads shop PDFs (full crosses only); stitchx reads PDFs and images; scanned pages work with limits.

## What StitchMaker adopts (October 2026)

| From the benchmark | Ticket |
|---|---|
| Reading the key from a photo (on-demand text recognition) | `.scratch/benchmark/issues/01` |
| Half stitches from charts that draw them as one-square diagonal lines | `.scratch/benchmark/issues/02` |
| Strands and skeins per thread on the Colors step and the Chart | `.scratch/benchmark/issues/03` |
| `.oxs` export and import | `.scratch/benchmark/issues/04` |
| Stitch mode: highlight a thread, mark stitches done, progress | `.scratch/benchmark/issues/05` |
| Dithering option for photos | `.scratch/benchmark/issues/06` |
| Fill (paint bucket) in the Edit step | `.scratch/benchmark/issues/07` |

Later, if wanted: beads, petite stitches, other thread brands (Anchor), parking marks, stash/shopping list.

## Fill tool (added 2026-10-21)

Every desktop chart editor and the web ones have a fill, and paint programs set the convention users expect: tap a square and every square of the same color joined to it side to side takes the new color; squares touching only at a corner are not joined. Desktop editors also offer replacing a color everywhere, which here already exists as Swap on the Colors step for whole threads. Searches did not find the exact fill options in the WinStitch, PCStitch, Stitch Fiddle or FlossCross manuals, so the details follow the common paint-bucket behavior rather than one program.

Adopted: a Fill tool with "Touching squares" (default) or "All of this color". "All" is the quick way to fill a background with holes, such as the inside of a letter. The fill stays inside the Blank; split, half and quarter squares act as walls; Backstitch lines do not. A fill is one edit, so one Undo takes it back.

## Sources

- Reviews and rankings: lordlibidan.com best cross stitch pattern software; gitnux.org cross-stitch designer software; alternativeto.net (Stitchmate, FlossCross).
- PCStitch: techjockey.com and softradar.com listings; Etsy community thread.
- Pattern Keeper: Google Play / apkcombo listing; Kooler Design help page.
- MacStitch: needlenthread.com review (2012); Ursa Software OXS format page (ursasoftware.com/OXSFormat).
- Cross Stitch Saga, StitchHub, Stitchwork: App Store, Bluestacks and mwm.ai listings; mrxstitch.com mobile apps review.
- Skeins: crossstitchforum.com "Estimating needed floss"; makebead.com, stitchthis.io and crewelghoul.com floss calculators.
- OXS details: github.com/Kate-nc/cross-stitch `import-formats.js` (open source reader and writer); FlossCross gist by danwakefield.
