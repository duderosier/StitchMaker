# Stitch Keychains

Mobile web app (Android + iOS browsers) for turning an uploaded photo into a cross-stitch pattern sized for a keychain, with a control for how many colors to reduce the image to (similar to Cricut Design Space's color simplification).

## Map

`index.html` is the whole app, in four inline scripts: `dmc` (the DMC table, one very long line; read around it), `engine` (pure Pattern Engine, the only tested seam), `pdf` (Chart PDF writer), `app` (UI). Sections inside each start with `// ---------- name ----------`. `sw.js`, the manifest and icons exist only for offline install (ADR 0001). Checks: `npm run check`, `npm test`, `npm run smoke`; `npm run hooks` once per clone. Review rules: `CODING_STANDARDS.md`.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.
