self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Minimal pass-through fetch handler satisfying PWA installation requirements
    event.respondWith(fetch(event.request));
});
