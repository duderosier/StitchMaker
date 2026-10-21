# 01: Key from a photo (on-demand OCR)

**What to build:** See spec slice 1.

**Blocked by:** none

**Status:** resolved

## Comments

- 2026-10-21: Done. Thread step: "Read the key on this page" (the chart page with its grid painted white, so grid symbols aren't read as numbers) and "Key in another photo" (JPEG, PNG or HEIC). Tesseract.js 6.0.1 (core 6.0.0, English `4.0.0_best_int`) loads from jsDelivr on first use, one worker reused; the service worker keeps the files (ADR 0002 addendum). Recognized text goes through `keyCodesFromText` (number-only lines skipped) and is merged into "Numbers from the key", which re-guesses colors not set by hand. Smoke: a tilted, unevenly lit key photo (`key-photo.jpg`, with its generator) reads as 745, 3752, Blanc; CI installs the Tesseract packages so the test serves them locally.
