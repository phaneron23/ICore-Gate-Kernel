// USDS — Service Worker v0.2.0
// Production-grade offline caching with versioned cache, update flow, and fallback page.

const CACHE_VERSION = 'usds-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// All assets to pre-cache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './nav-bar.js',
  './style.css',
  './app.js',
  './manifest.json',
  // Engines
  './engine/package.js',
  './engine/signing.js',
  './engine/distribution.js',
  './engine/verification.js',
  // Platform
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
  // UI Modules
  './ui/dashboard.js',
  './ui/packages.js',
  './ui/distribute.js',
  './ui/verify.js',
  './ui/history.js',
  './ui/about.js',
  // Icons
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// ── Install: Pre-cache all static assets ──
self.addEventListener('install', event => {
  console.log('[SW] Installing', CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Pre-caching', PRECACHE_URLS.length, 'assets');
        return cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn('[SW] Pre-cache partial failure, retrying without reload flag:', err);
        return caches.open(STATIC_CACHE).then(cache => {
          return Promise.allSettled(
            PRECACHE_URLS.map(url => cache.add(url).catch(e => console.warn('[SW] Failed to cache:', url, e)))
          );
        }).then(() => self.skipWaiting());
      })
  );
});

// ── Activate: Clean up old caches ──
self.addEventListener('activate', event => {
  console.log('[SW] Activating', CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: Cache-first for static assets, network-first for navigation ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Static assets: cache-first, then network (with dynamic caching)
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
          return response;
        });
      })
      .catch(() => {
        // Return a simple offline response for missing resources
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});

// ── Message handler: Support skip-waiting from client ──
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
