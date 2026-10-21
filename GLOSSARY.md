# StitchMaker

Turning a photo into a cross-stitch Pattern that fits a keychain Blank and can be stitched with real thread.

## Language

### The physical piece

**Blank**:
The physical keychain piece a Pattern is made for, defined by its shape, its Finish, its Fabric Count and the stitch grid that fits inside it.
_Avoid_: Frame, template, keychain (when meaning the size/shape)

**Preset Shape**:
A ready-made Blank outline (round, heart, square, rectangle, oval, hexagon) at a given size; a custom width × height is also a Preset Shape.
_Avoid_: Template, preset (on its own)

**Cut-Out**:
A Blank whose shape comes from the stitched design itself rather than a Preset Shape; always Overcast.
_Avoid_: Custom shape, silhouette, die-cut

**Finish**:
How the stitched piece becomes a keychain: Framed or Overcast.
_Avoid_: Mounting, style

**Framed**:
A Finish where the stitched fabric is pressed into a ready-made keychain frame that hides its edge and carries its own ring; only for Preset Shapes.
_Avoid_: Insert, mounted

**Overcast**:
A Finish where plastic canvas is cut along the Cut Line and its edge is wrapped in Edge Stitches, with its own Ring Hole.
_Avoid_: Whipstitched, bound, plastic canvas (when meaning the Finish)

**Cut Line**:
The outline an Overcast Blank is cut along: the Preset Shape's outline, or for a Cut-Out the stitched area with inner gaps filled, grown by the Margin.
_Avoid_: Border, outline (when meaning the cut)

**Margin**:
The number of bare canvas cells left between a Cut-Out's outermost Stitches and its Cut Line.
_Avoid_: Padding, bleed

**Ring Hole**:
The hole a jump ring passes through on an Overcast Blank, placed either on a Ring Tab outside the design or inside the design itself; its size comes from a preset or is set by hand.
_Avoid_: Keyring, loop, eyelet

**Ring Tab**:
A small extension beyond the Blank's outline that holds an outside Ring Hole; it does not count toward the Blank's stated size.
_Avoid_: Ear, tab, hanger

**Fabric Count**:
How many stitches fit per inch of fabric (e.g. 14ct Aida, 7ct plastic canvas).
_Avoid_: Mesh, resolution

**Floss**:
A specific purchasable thread color, identified by its DMC number.
_Avoid_: Color (when meaning a thread), thread, yarn

### The design

**Pattern**:
The stitch grid for one Blank, where every cell is either a Stitch of one Floss or Unstitched.
_Avoid_: Design, image, chart (the Chart is the printout of a Pattern)

**Stitch**:
One full cross stitch occupying one cell of the Pattern.
_Avoid_: Pixel, cell (when meaning a stitched cell)

**Edge Stitch**:
One stitch wrapping the cut edge of an Overcast Blank (its Cut Line or an inside Ring Hole); each has its own Floss, which does not count toward the Color Count.
_Avoid_: Whipstitch, border stitch, binding

**Background**:
The part of the photo the person removes so it becomes Unstitched instead of using up Flosses.
_Avoid_: Backdrop, transparent area

**Unstitched**:
A cell left as bare fabric: outside the Blank's shape, part of the Background, inside a Ring Hole, or erased by hand.
_Avoid_: Transparent, empty, erased

**Palette**:
The set of Flosses used in a Pattern.
_Avoid_: Colors, swatches

**Color Count**:
The number of Flosses the automatic reduction aims for when building the Palette of design Stitches.
_Avoid_: Colors, levels, depth

### Editing the Palette

**Merge**:
Reassign every Stitch of one Floss to another Floss already in the Palette, shrinking the Palette by one.
_Avoid_: Combine, collapse

**Swap**:
Replace one Floss in the Palette with a different DMC Floss, keeping its Stitches where they are.
_Avoid_: Recolor, replace

### Output

**Chart**:
The printable PDF of a Pattern: the symbol grid plus a legend of its Palette.
_Avoid_: Printout, export, pattern (when meaning the PDF)

**Symbol**:
The glyph that stands for one Floss on the Chart.
_Avoid_: Icon, marker
