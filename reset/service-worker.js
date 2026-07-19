const CACHE="ucr-v1";
const PRECACHE=["./","./index.html","./nav-bar.js","./manifest.json"];

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(PRECACHE)}).then(function(){return self.skipWaiting()}));
});

self.addEventListener("activate",function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
    }).then(function(){return self.clients.claim()})
  );
});

self.addEventListener("fetch",function(e){
  e.respondWith(
    fetch(e.request).then(function(r){return r}).catch(function(){return caches.match(e.request)})
  );
});
