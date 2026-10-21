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

**Shipping an update:** the pre-commit hook bumps the `CACHE` name in `sw.js` whenever `index.html` changes, so installed phones pick up the new version (fetched in the background; it shows on the launch after that). CI fails a push that forgets.

## Install on the phone

- **iPhone (Safari):** open the Pages link → Share → **Add to Home Screen**. Open it once while online so it can work offline after that.
- **Android (Chrome):** open the link → ⋮ menu → **Add to Home screen** / **Install app**.

## Checks

- `npm test`: Pattern Engine tests under Node (no dependencies; the engine is extracted straight from `index.html`).
- `npm run check`: every inline script parses.
- `npm run smoke`: drives the real page in Chromium at phone and unfolded-Fold sizes (layout, sliders, pinch zoom, full screen, PDF export, saving, drawing). Needs Playwright (`npm i --no-save playwright` and `npx playwright install chromium`).
- `npm run hooks` once per clone: turns on the pre-commit hook, which runs the checks and bumps the offline cache name in `sw.js` whenever `index.html` changes.
- GitHub Actions runs all of it on every push (`.github/workflows/ci.yml`).
- On real phones, use `docs/device-checklist.md`.
