'use client';

import { useEffect, useState } from 'react';

import { api } from '@/lib/axios';

const LS_KEY = 'push_subscribed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const isSupported =
        typeof window !== 'undefined' && 'PushManager' in window;

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isSupported) return;
        const stored = localStorage.getItem(LS_KEY);
        setIsSubscribed(stored === 'true');
    }, [isSupported]);

    async function subscribe(): Promise<void> {
        if (!isSupported) return;
        setIsLoading(true);
        try {
            const { data: keyData } = await api.get<{ public_key: string }>(
                '/push-subscriptions/public-key',
            );

            const registration =
                await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    keyData.public_key,
                ) as Uint8Array<ArrayBuffer>,
            });

            const raw = subscription.toJSON();
            await api.post('/push-subscriptions', {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: raw.keys?.p256dh ?? '',
                    auth: raw.keys?.auth ?? '',
                },
            });

            localStorage.setItem(LS_KEY, 'true');
            setIsSubscribed(true);
        } finally {
            setIsLoading(false);
        }
    }

    async function unsubscribe(): Promise<void> {
        if (!isSupported) return;
        setIsLoading(true);
        try {
            const registration =
                await navigator.serviceWorker.getRegistration('/sw.js');
            if (registration) {
                const subscription =
                    await registration.pushManager.getSubscription();
                if (subscription) {
                    await api.delete('/push-subscriptions', {
                        data: { endpoint: subscription.endpoint },
                    });
                    await subscription.unsubscribe();
                }
            }
            localStorage.removeItem(LS_KEY);
            setIsSubscribed(false);
        } finally {
            setIsLoading(false);
        }
    }

    return { isSupported, isSubscribed, isLoading, subscribe, unsubscribe };
}
