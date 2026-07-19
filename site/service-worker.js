/* ICore Service Worker — Constitutional Computing Platform */
/* Cache version: icore-v1 */

const CACHE_VERSION = 'icore-v1';
const CACHE_NAME = 'icore-cache-' + CACHE_VERSION;
const STATIC_CACHE = 'icore-static-' + CACHE_VERSION;

var PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/service-worker.js'
];

/* Install — pre-cache static assets */
self.addEventListener('install', function(event) {
  console.log('[ICore SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        console.log('[ICore SW] Pre-caching static assets');
        return cache.addAll(PRE_CACHE_URLS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

/* Activate — clean old caches */
self.addEventListener('activate', function(event) {
  console.log('[ICore SW] Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) {
            return name !== STATIC_CACHE && name !== CACHE_NAME;
          })
          .map(function(name) {
            console.log('[ICore SW] Deleting old cache: ' + name);
            return caches.delete(name);
          })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* Fetch — cache-first with network fallback */
self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  /* Only handle same-origin requests */
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(request).catch(function() {
        return new Response(
          '<!DOCTYPE html><html><head><title>ICore - Offline</title>' +
          '<style>body{background:#0a0a0f;color:#00bfa5;font-family:monospace;' +
          'display:flex;justify-content:center;align-items:center;height:100vh;margin:0;}' +
          '.offline{text-align:center;}.offline h1{font-size:3rem;margin-bottom:1rem;}' +
          '.offline p{color:#888;}</style></head>' +
          '<body><div class="offline"><h1>ICore</h1>' +
          '<p>You are offline. This service requires network access.</p>' +
          '<p><a href="/" style="color:#00bfa5;">Return to ICore</a></p>' +
          '</div></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }

  /* Navigation: cache-first with network update */
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(function(cached) {
        var networkFetch = fetch(request).then(function(response) {
          if (response.ok) {
            var responseClone = response.clone();
            caches.open(STATIC_CACHE).then(function(cache) {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(function() {
          return cached;
        });
        return cached || networkFetch;
      })
    );
    return;
  }

  /* Other same-origin: cache-first with background update */
  event.respondWith(
    caches.match(request).then(function(cached) {
      if (cached) {
        fetch(request).then(function(response) {
          if (response.ok) {
            caches.open(STATIC_CACHE).then(function(cache) {
              cache.put(request, response);
            });
          }
        }).catch(function() {});
        return cached;
      }

      return fetch(request).then(function(response) {
        if (response.ok) {
          var responseClone = response.clone();
          caches.open(STATIC_CACHE).then(function(cache) {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

/* Handle messages from the main thread */
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
