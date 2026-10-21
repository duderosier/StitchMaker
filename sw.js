// Offline support for the home-screen app (see ADR 0001). Serves the cached app, refreshes it in the background.
// Name kept from before the StitchMaker rename; the pre-commit hook and CI match this prefix.
var CACHE = 'stitch-keychains-v12';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// pdf.js is fetched from cdnjs the first time a PDF chart is imported (ADR 0002); keep it for offline use.
// The Nunito font comes from Google Fonts; keep it too so the app looks the same offline.
var KEEP = ['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/', 'https://cdn.jsdelivr.net/npm/heic2any@', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];
self.addEventListener('fetch', function (e) {
  if (e.request.method === 'GET' && KEEP.some(function (p) { return e.request.url.indexOf(p) === 0; })) {
    e.respondWith(caches.open(CACHE).then(function (c) {
      return c.match(e.request).then(function (hit) {
        return hit || fetch(e.request).then(function (res) { if (res.ok) c.put(e.request, res.clone()); return res; });
      });
    }));
    return;
  }
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var fresh = fetch(e.request).then(function (res) { if (res.ok) c.put(e.request, res.clone()); return res; });
      return hit ? (fresh.catch(function () {}), hit) : fresh;
    });
  }));
});
