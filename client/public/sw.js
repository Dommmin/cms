self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {};
    event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', {
            body: data.body || '',
            icon: data.icon || '/icon-192x192.png',
            badge: '/icon-96x96.png',
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
