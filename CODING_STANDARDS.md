# Coding standards

Read during review. Mechanical rules live in the checks (`npm run check`, `npm test`, `npm run smoke`, the pre-commit hook); these are the judgement calls.

## Wording

- Code, tests, specs and tickets use the exact terms in `GLOSSARY.md`.
- Labels people see in the app use friendly everyday words, chosen by the user: "Colors" for the Palette, "Pick color", "Edge color", "On a tab" for a Ring Tab, "Thread" on the Chart. Leave these as they are.

## Shape of the code

- The Pattern Engine block stays pure: plain data in, plain data out, no DOM, canvas or storage. Anything testable goes there, behind a test at the engine seam.
- The app block stays a thin shell over the engine; new behaviour that can be expressed as data belongs in the engine.
- Every new Pattern setting survives saving and reopening (it rides in the engine's serialized state or the saved record).
