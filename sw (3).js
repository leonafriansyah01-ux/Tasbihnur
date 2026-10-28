// Naikkan CACHE_VERSION setiap kali file aplikasi berubah.
const CACHE_VERSION = "v1";
const CACHE = "tasbih-nur-" + CACHE_VERSION;
const CORE = ["./", "./index.html", "./offline.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  // Hanya menghapus cache lama. IndexedDB (data pengguna) tidak disentuh.
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("tasbih-nur-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); return res; })
      .catch(() => caches.match("./index.html").then(r => r || caches.match("./offline.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; })));
});
