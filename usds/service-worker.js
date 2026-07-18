const CACHE_NAME = 'usds-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/app.js',
  '/platform/corefab.js',
  '/platform/uca.js',
  '/platform/uscp.js',
  '/platform/usc.js',
  '/platform/sciences.js',
  '/platform/ucrs.js',
  '/platform/ucmodels.js',
  '/platform/ics.js',
  '/platform/trust-verify.js',
  '/platform/event-bus.js',
  '/platform/index.js',
  '/engine/package.js',
  '/engine/signing.js',
  '/engine/distribution.js',
  '/engine/verification.js',
  '/ui/dashboard.js',
  '/ui/packages.js',
  '/ui/distribute.js',
  '/ui/verify.js',
  '/ui/history.js',
  '/ui/about.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});