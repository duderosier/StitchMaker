# Stitch Keychains

Turning a photo into a cross-stitch Pattern that fits a keychain Blank and can be stitched with real thread.

## Language

### The physical piece

**Blank**:
The physical keychain the stitched piece goes into, defined by its shape, its Fabric Count and the stitch grid that fits inside it.
_Avoid_: Frame, template, keychain (when meaning the size/shape)

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

**Unstitched**:
A cell left as bare fabric, either because it is outside the Blank's shape or because its Floss was marked as background.
_Avoid_: Transparent, empty, erased

**Palette**:
The set of Flosses used in a Pattern.
_Avoid_: Colors, swatches

**Color Count**:
The number of Flosses the automatic reduction aims for when building the Palette.
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
