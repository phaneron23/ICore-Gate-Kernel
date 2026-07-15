// ICore Studyo Service Worker — v0.1.0
// Brave-first, offline-first, sovereign
// Zero external requests. Everything from same origin.

const CACHE_NAME = 'studyo-v0.1.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/engine/uscp.js',
  '/engine/usc.js',
  '/engine/sciences.js',
  '/engine/ucrs.js',
  '/engine/ucmodels.js',
  '/engine/ics.js',
  '/engine/trust-verify.js',
  '/ui/home.js',
  '/ui/verify.js',
  '/ui/explore.js',
  '/ui/history.js',
  '/ui/about.js',
  '/storage/db.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install: cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first, same-origin only
self.addEventListener('fetch', event => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          // Return cached version, fetch update in background
          event.waitUntil(
            fetch(event.request).then(response => {
              if (response.ok) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, response);
                });
              }
            }).catch(() => {})
          );
          return cached;
        }
        // Not in cache — fetch and cache
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
  );
});
