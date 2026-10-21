# Stitch Keychains

Turn a photo into a cross-stitch keychain pattern in real DMC colors, on your phone. Everything runs in the browser; photos never leave the device. See `GLOSSARY.md` for the vocabulary and `docs/adr/` for why it is one HTML file.

## Run it locally

Open a terminal in this folder and run `python3 -m http.server 8000`, then visit `http://localhost:8000` (on your phone use your computer's local IP address on the same Wi-Fi).

## Publish to GitHub Pages

1. The repository is `duderosier/StitchMaker`. It can be public; your photos and patterns stay on your phone.
2. Push this folder to it:
   `git remote add origin https://github.com/duderosier/StitchMaker.git` then `git push -u origin main`.
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save**.
4. After a minute the app is live at `https://duderosier.github.io/StitchMaker/` (the path is case-sensitive).

Files that need to be on Pages: `index.html`, `sw.js`, `manifest.webmanifest`, `icon-180.png`, `icon-192.png`, `icon-512.png`. Everything else (tests, docs, `.scratch/`) is harmless to publish.

**Shipping an update:** bump the `CACHE` name in `sw.js` (e.g. `-v2`) whenever you change `index.html`, so installed phones pick up the new version on their next launch (it is fetched in the background; the update shows the launch after that).

## Install on the phone

- **iPhone (Safari):** open the Pages link → Share → **Add to Home Screen**. Open it once while online so it can work offline after that.
- **Android (Chrome):** open the link → ⋮ menu → **Add to Home screen** / **Install app**.

## Tests

`npm test` runs the Pattern Engine tests under Node (no dependencies; the engine is extracted straight from `index.html`). `npm run check` confirms every inline script parses. The screens are checked by hand with `docs/device-checklist.md`.
