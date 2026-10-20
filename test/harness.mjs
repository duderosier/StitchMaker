// Loads the Pattern Engine straight out of index.html (ADR 0001: one file, no build).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

export function scriptBlock(id) {
  const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`No <script id="${id}"> block in index.html`);
  return m[1];
}

export function loadEngine() {
  // Same realm as the tests, so arrays/objects compare with deepStrictEqual.
  vm.runInThisContext(scriptBlock('engine'), { filename: 'engine.js' });
  return globalThis.PatternEngine;
}

// Build a cols×rows RGBA image from a function (x, y) => [r, g, b, a?].
export function image(cols, rows, fn) {
  const data = new Uint8ClampedArray(cols * rows * 4);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const [r, g, b, a = 255] = fn(x, y);
    data.set([r, g, b, a], (y * cols + x) * 4);
  }
  return { width: cols, height: rows, data };
}
