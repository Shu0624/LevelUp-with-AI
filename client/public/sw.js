// =====================================================================
// LevelUp Service Worker — Enhanced Offline Caching & PWA Support
// Version: 2.0
// =====================================================================
const CACHE_NAME = 'levelup-v2';
const STATIC_CACHE = 'levelup-static-v2';
const API_CACHE = 'levelup-api-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Assets that should be cached aggressively (immutable)
const IMMUTABLE_PATTERNS = /\.(woff2?|ttf|otf|eot)$/;
// Assets that use cache-first with background revalidation
const CACHE_FIRST_PATTERNS = /\.(js|css|png|jpg|jpeg|svg|webp|ico|gif)$/;
// API paths that can be cached briefly for offline support
const CACHEABLE_API_PATHS = ['/api/modules', '/api/auth/me'];

// Install: cache critical static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !currentCaches.includes(key))
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Multi-strategy caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension, data URLs, etc.
  if (!url.protocol.startsWith('http')) return;

  // ----- Strategy 1: API requests — Network-First with short-term cache -----
  if (url.pathname.startsWith('/api/')) {
    // Only cache specific safe GET endpoints
    const shouldCache = CACHEABLE_API_PATHS.some(p => url.pathname.startsWith(p));
    
    if (shouldCache) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(API_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => caches.match(request))
      );
    }
    // Non-cacheable API requests always go to network (don't intercept)
    return;
  }

  // ----- Strategy 2: HTML navigations — Network-First, fallback to cached shell -----
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // ----- Strategy 3: Font files — Cache-First (immutable) -----
  if (IMMUTABLE_PATTERNS.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // ----- Strategy 4: Static assets (JS/CSS/images) — Stale-While-Revalidate -----
  if (CACHE_FIRST_PATTERNS.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // Start revalidation in background
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached); // fallback if network fails and we have cache

        // Return cached immediately, or wait for network
        return cached || fetchPromise;
      })
    );
    return;
  }
});

// Listen for messages from the app (e.g., force cache clear)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});
