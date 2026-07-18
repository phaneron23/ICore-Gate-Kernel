const CACHE_NAME = 'uwa-v0.1.0';
const ASSETS = ['/', '/index.html', '/manifest.json', '/platform/ics.js', '/platform/trust-verify.js'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => { const c = resp.clone(); caches.open(CACHE_NAME).then(cache => cache.put(e.request, c)); return resp; }).catch(() => caches.match('/index.html')))));