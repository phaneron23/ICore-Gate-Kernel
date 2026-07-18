// UAS Service Worker — Cache-first offline strategy
const CACHE_NAME = 'uas-v1';
const PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/app.js',
  '/engine/agent.js',
  '/engine/orchestrator.js',
  '/engine/trust-engine.js',
  '/ui/dashboard.js',
  '/ui/agents.js',
  '/ui/builder.js',
  '/ui/orchestrator.js',
  '/ui/history.js',
  '/ui/about.js',
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
  '/platform/index.js'
];

// Install — pre-cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRE_CACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.filter(name => name !== CACHE_NAME)
             .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — cache-first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Don't cache non-ok or opaque responses beyond basics
        if (!response || response.status !== 200) {
          return response;
        }
        // Cache new successful responses
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(() => {
        // Offline fallback for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
