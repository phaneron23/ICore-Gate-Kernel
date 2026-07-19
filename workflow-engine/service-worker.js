// ICore Workflow Engine — Service Worker v1.0.0
// Offline-first. Zero external requests.

const CACHE_NAME = 'workflow-engine-v1.0.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/nav-bar.js',
  '/style.css',
  '/app.js',
  '/manifest.json',
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
  '/platform/context-engine.js',
  '/platform/index.js',
  '/engine/workflow.js',
  '/engine/derivation.js',
  '/ui/dashboard.js',
  '/ui/builder.js',
  '/ui/executor.js',
  '/ui/history.js',
  '/ui/about.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
