// Offline cache for the app shell. Bump VERSION on every release.
const VERSION = "kp-9";
const SHELL = ["./", "index.html", "app.css", "theme.css", "wordmark.svg", "fonts/cormorant-garamond-latin-500-normal.woff2", "fonts/cormorant-garamond-latin-600-normal.woff2", "fonts/cormorant-garamond-latin-700-normal.woff2", "fonts/nunito-sans-latin-400-normal.woff2", "fonts/nunito-sans-latin-600-normal.woff2", "fonts/nunito-sans-latin-700-normal.woff2", "app.js", "config.js", "vendor/supabase.js",
  "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // database calls go straight to the network
  // Network first so updates arrive, cache as the offline fallback.
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
});
