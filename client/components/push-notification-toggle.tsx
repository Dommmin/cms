'use client';

import { Bell, BellOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { usePushNotifications } from '@/hooks/use-push-notifications';

export function PushNotificationToggle() {
    const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } =
        usePushNotifications();
    const [error, setError] = useState<string | null>(null);

    if (!isSupported) {
        return null;
    }

    async function handleToggle() {
        setError(null);
        try {
            if (isSubscribed) {
                await unsubscribe();
            } else {
                await subscribe();
            }
        } catch {
            setError(
                isSubscribed
                    ? 'Failed to disable notifications.'
                    : 'Failed to enable notifications. Please check your browser settings.',
            );
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={() => void handleToggle()}
                disabled={isLoading}
                aria-label={
                    isSubscribed
                        ? 'Disable push notifications'
                        : 'Enable push notifications'
                }
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                    isSubscribed
                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                        : 'border-border hover:bg-accent border'
                }`}
            >
                {isLoading ? (
                    <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                    />
                ) : isSubscribed ? (
                    <Bell className="h-4 w-4" aria-hidden="true" />
                ) : (
                    <BellOff className="h-4 w-4" aria-hidden="true" />
                )}
                {isSubscribed
                    ? 'Notifications enabled'
                    : 'Enable notifications'}
            </button>
            {error && (
                <p className="text-destructive text-xs" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
