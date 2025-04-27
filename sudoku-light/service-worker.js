const CACHE_NAME = 'sudoku-buddies-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/bundle.js',
  '/assets/favicon.svg',
  '/manifest.json'
];

// Add number sprites and sound assets to cache
for (let i = 1; i <= 9; i++) {
  urlsToCache.push(`/assets/number-${i}.svg`);
}

// Add other assets
const otherAssets = [
  '/assets/star.svg',
  '/assets/balloon.svg',
  '/assets/confetti.svg',
  '/assets/hint.svg'
];
urlsToCache.push(...otherAssets);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();
        
        // Network request and cache new assets
        return fetch(fetchRequest).then(response => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
  );
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 