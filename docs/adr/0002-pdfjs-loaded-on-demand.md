# Read Source Chart PDFs with pdf.js, loaded only when needed

Importing a Source Chart from a PDF needs the page drawn as an image, which browsers can't do from script on their own. We load pdf.js from a pinned CDN URL the first time someone imports a PDF, and the service worker caches it so later imports work offline. `index.html` stays the whole app (ADR 0001); pdf.js is an optional companion like `sw.js`, and image imports never touch it. Reading the chart itself (grid, colors, Split Cells, Backstitches) still runs on the phone; no image leaves it.

## Considered Options

- **Inline pdf.js in `index.html`**: rejected; it would make the file about ten times bigger for a feature most sessions don't use.
- **Images only (person screenshots the PDF)**: rejected; it's an extra step on every import and loses resolution.
- **A cloud AI service to read charts**: rejected; it needs internet, a key and possibly money, and sends the person's charts off the phone.

## Consequences

- The very first PDF import needs a connection; after that it works offline.
- The pdf.js version is pinned and cached under the same `stitch-keychains-v<N>` cache, so a bump re-fetches it.

## Addendum (2026-10-20): HEIC photos

The same pattern covers HEIC/HEIF photos (iPhone camera files) on browsers that cannot show them (Chrome, Android): `heic2any` 0.0.4 is fetched from jsDelivr only when a picture fails to open and looks like HEIC, then cached by the service worker. Safari opens HEIC natively and never downloads it.

## Addendum (2026-10-21): reading keys from photos

Text recognition for a chart key in a photo uses Tesseract.js 6.0.1 with tesseract.js-core 6.0.0 and the compact English data (`@tesseract.js-data/eng@1.0.0`, `4.0.0_best_int`), all from jsDelivr, fetched only when the person taps "Read the key on this page" or "Key in another photo" (about 7 MB) and kept by the service worker; Tesseract also keeps its language data in IndexedDB. Recognition runs on the phone, so the photo never leaves it, which is why a cloud OCR service was not used.
