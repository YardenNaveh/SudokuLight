const CACHE_NAME = 'sudoku-buddies-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/game.js',
  '/src/ui.js',
  '/src/levels.js',
  '/src/style.css',
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
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
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