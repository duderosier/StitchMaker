# Read Source Chart PDFs with pdf.js, loaded only when needed

Importing a Source Chart from a PDF needs the page drawn as an image, which browsers can't do from script on their own. We load pdf.js from a pinned CDN URL the first time someone imports a PDF, and the service worker caches it so later imports work offline. `index.html` stays the whole app (ADR 0001); pdf.js is an optional companion like `sw.js`, and image imports never touch it. Reading the chart itself (grid, colors, Split Cells, Backstitches) still runs on the phone; no image leaves it.

## Considered Options

- **Inline pdf.js in `index.html`**: rejected; it would make the file about ten times bigger for a feature most sessions don't use.
- **Images only (person screenshots the PDF)**: rejected; it's an extra step on every import and loses resolution.
- **A cloud AI service to read charts**: rejected; it needs internet, a key and possibly money, and sends the person's charts off the phone.

## Consequences

- The very first PDF import needs a connection; after that it works offline.
- The pdf.js version is pinned and cached under the same `stitch-keychains-v<N>` cache, so a bump re-fetches it.
