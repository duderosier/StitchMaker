// "Typecheck" for a no-build single-file app: every inline script must parse.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
let n = 0;
for (const m of html.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)) {
  new vm.Script(m[2], { filename: `${m[1]}.js` }); n++;
}
new vm.Script(readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), { filename: 'sw.js' });
// The install manifest must be real JSON that names the app and points at icons that exist.
const manifest = JSON.parse(readFileSync(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
if (!manifest.name || !manifest.start_url || !manifest.icons?.length) throw new Error('manifest.webmanifest is missing name, start_url or icons');
for (const icon of manifest.icons) readFileSync(new URL('../' + icon.src, import.meta.url));
console.log(`ok: ${n} inline scripts + sw.js parse, manifest valid`);
