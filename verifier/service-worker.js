// ICore Verifier Service Worker v1.0.0
// Cache-first offline strategy. Sovereign, offline-first.

const CACHE_NAME = 'icore-verifier-v1.0.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './nav-bar.js',
  './style.css',
  './app.js',
  './manifest.json',
  './platform/corefab.js',
  './platform/uca.js',
  './platform/uscp.js',
  './platform/usc.js',
  './platform/sciences.js',
  './platform/ucrs.js',
  './platform/ucmodels.js',
  './platform/ics.js',
  './platform/trust-verify.js',
  './platform/event-bus.js',
  './platform/context-engine.js',
  './platform/index.js',
  './ui/home.js',
  './ui/results.js',
  './ui/history.js'
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
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED', version: 'v1.0.0' });
        });
      });
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy: cache-first with background update
self.addEventListener('fetch', event => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-first for HTML pages (to get fresh app shell)
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
