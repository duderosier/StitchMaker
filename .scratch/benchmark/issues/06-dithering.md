# 06: Dithering option

**What to build:** See spec slice 6.

**Blocked by:** none

**Status:** resolved

## Comments

- 2026-10-21: Done. `reduce(..., dither)`: the Flosses are chosen as before (k-means, nearest DMC); with dithering each cell takes the nearest of them to its color plus the error carried from earlier cells, and passes its own error on right and below (Floyd–Steinberg 7/3/5/1 in Lab, only between stitched cells). Confetti cleanup is skipped while dithering (it would undo it) and its buttons are disabled. `dither` is a Pattern setting, saved and restored. Colors step: "Dithering Off / On", off by default since small keychain designs read better flat. Also: rebuilding from the photo now keeps stitching progress when the grid size is unchanged.
