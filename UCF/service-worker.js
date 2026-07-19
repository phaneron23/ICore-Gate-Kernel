// Universal Constitutional Forge — Service Worker v1.0.0
// Offline-first. Cache API responses. Sovereign data persists.
const CACHE = 'ucf-v1';
const PRECACHE = ['./','./index.html','./nav-bar.js','./manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // API/network requests: network first
  if (url.pathname.startsWith('/api/') || url.hostname !== location.hostname) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Static: cache first
  e.respondWith(caches.match(e.request).then(c => {
    if (c) return c;
    return fetch(e.request).then(r => {
      if (r.ok && e.request.method === 'GET') {
        const cl = r.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, cl));
      }
      return r;
    });
  }).catch(() => {
    if (e.request.mode === 'navigate') return caches.match('./index.html');
  }));
});
