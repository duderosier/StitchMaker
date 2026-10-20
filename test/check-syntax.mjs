// "Typecheck" for a no-build single-file app: every inline script must parse.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
let n = 0;
for (const m of html.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g)) {
  new vm.Script(m[2], { filename: `${m[1]}.js` }); n++;
}
new vm.Script(readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), { filename: 'sw.js' });
console.log(`ok: ${n} inline scripts + sw.js parse`);
