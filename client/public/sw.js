const VERSION = 'pwa-v1';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const OFFLINE_URL = '/offline';
const STATIC_ASSETS = [
    OFFLINE_URL,
    '/pwa/icon.svg',
    '/pwa/icon-192.png',
    '/pwa/icon-512.png',
    '/pwa/maskable-192.png',
    '/pwa/maskable-512.png',
];

const PRIVATE_PATHS = [
    '/account',
    '/cart',
    '/checkout',
    '/payments',
    '/api/auth',
    '/api/cart',
    '/api/checkout',
    '/api/payments',
    '/api/profile',
];

function isPrivateUrl(url) {
    const localizedPrivatePath = /^\/(en|pl)(\/.*)?$/.test(url.pathname)
        ? url.pathname.includes('/account') ||
          url.pathname.includes('/cart') ||
          url.pathname.includes('/checkout')
        : false;

    return (
        localizedPrivatePath ||
        PRIVATE_PATHS.some(
            (path) =>
                url.pathname === path || url.pathname.startsWith(`${path}/`),
        )
    );
}

function isSameOriginPublicGet(request) {
    if (request.method !== 'GET') {
        return false;
    }

    const url = new URL(request.url);

    return url.origin === self.location.origin && !isPrivateUrl(url);
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => !key.startsWith(VERSION))
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (!isSameOriginPublicGet(request)) {
        return;
    }

    const url = new URL(request.url);

    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    if (
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.startsWith('/pwa/') ||
        /\.(?:css|js|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname)
    ) {
        event.respondWith(cacheFirst(request));
        return;
    }

    if (
        url.pathname.startsWith('/en/products') ||
        url.pathname.startsWith('/pl/products') ||
        url.pathname.startsWith('/en/blog') ||
        url.pathname.startsWith('/pl/blog') ||
        url.pathname.startsWith('/en/stores') ||
        url.pathname.startsWith('/pl/stores')
    ) {
        event.respondWith(staleWhileRevalidate(request));
    }
});

async function cacheFirst(request) {
    const cached = await caches.match(request);

    if (cached) {
        return cached;
    }

    const response = await fetch(request);

    if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, response.clone());
    }

    return response;
}

async function networkFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE);

    try {
        const response = await fetch(request);

        if (response.ok) {
            await cache.put(request, response.clone());
        }

        return response;
    } catch {
        return (
            (await cache.match(request)) ||
            (await caches.match(OFFLINE_URL)) ||
            Response.error()
        );
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    const network = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }

            return response;
        })
        .catch(() => cached);

    return cached || network;
}

self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {};

    event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', {
            body: data.body || '',
            icon: data.icon || '/pwa/icon-192.png',
            badge: '/pwa/icon-192.png',
            data: data.url ? { url: data.url } : {},
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.notification.data?.url) {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});
