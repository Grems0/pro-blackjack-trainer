const CACHE_NAME = 'bj-trainer-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Installation — mise en cache des assets statiques
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation — suppression des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — Network First pour l'API, Cache First pour les assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes non-GET ou externes (Stripe, Firebase, etc.)
  if (request.method !== 'GET') return;
  if (!url.origin.includes(self.location.origin)) return;

  // API calls : toujours réseau, pas de cache
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      // Network first
      try {
        const networkResponse = await fetch(request);
        // Mettre en cache les ressources JS/CSS/images
        if (networkResponse.ok && (
          url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/) ||
          url.pathname === '/' ||
          url.pathname === '/index.html'
        )) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        // Fallback cache si réseau indisponible
        const cached = await cache.match(request);
        if (cached) return cached;
        // Fallback vers index.html pour les routes SPA
        return cache.match('/index.html');
      }
    })
  );
});
