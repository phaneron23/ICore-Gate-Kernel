// ICore Studyo Service Worker — v1.3.0
// Brave-first, offline-first, sovereign
// Zero external requests. Everything from same origin.

const CACHE_NAME = 'studyo-v1.3.0';

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
  '/engine/corefab.js',
  '/engine/uca.js',
  '/ui/home.js',
  '/ui/verify.js',
  '/ui/explore.js',
  '/ui/history.js',
  '/ui/about.js',
  '/storage/db.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/favicon.ico'
];

// Install: cache all assets, then activate immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean ALL old caches, then claim all clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => {
      // Notify all clients that SW updated
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED', version: 'v1.3.0' });
        });
      });
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - HTML: network-first (always get fresh version)
// - Everything else: cache-first with background update
self.addEventListener('fetch', event => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-first for HTML pages
  if (event.request.mode === 'navigate' || 
      event.request.url.endsWith('.html') ||
      event.request.url.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else (JS, CSS, images)
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          // Return cached, update in background
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
