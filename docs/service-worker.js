/* ICore Documentation — Production Service Worker */
/* Version: icore-docs-v1 */

const CACHE_VERSION = 'icore-docs-v1';
const CACHE_NAME = `icore-docs-cache-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/nav-bar.js',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

const OFFLINE_URL = '/index.html';

/* ── Install: Pre-cache all critical assets ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: Clean old caches ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

/* ── Fetch: Network-first with cache fallback ── */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        /* Clone and cache successful responses */
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        /* Network failed — serve from cache */
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          /* Last resort: offline fallback */
          if (event.request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }

          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});

/* ── Message: Allow clients to skip waiting ── */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
