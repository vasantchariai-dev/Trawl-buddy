const CACHE_NAME = 'food-trawl-buddy-v2';
const ASSETS = [
  './',
  './index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      // Cache-first, falling back to network, then caching the response
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Only cache same-origin requests
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // If both cache and network fail, return a basic offline page
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
