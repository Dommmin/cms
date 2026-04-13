'use client';

import { useCallback, useRef } from 'react';

import type {
    NotificationChannel,
    NotificationEvent,
} from '@/api/notification-preferences';
import {
    useNotificationPreferences,
    useUpdateNotificationPreference,
} from '@/hooks/use-notification-preferences';
import { useTranslation } from '@/hooks/use-translation';

const CHANNELS: {
    key: NotificationChannel;
    labelKey: string;
    label: string;
}[] = [
    { key: 'email', labelKey: 'notifications.channel_email', label: 'Email' },
    { key: 'sms', labelKey: 'notifications.channel_sms', label: 'SMS' },
    { key: 'push', labelKey: 'notifications.channel_push', label: 'Push' },
];

const EVENTS: { key: NotificationEvent; labelKey: string; label: string }[] = [
    {
        key: 'order_status',
        labelKey: 'notifications.event_order_status',
        label: 'Order updates',
    },
    {
        key: 'return_status',
        labelKey: 'notifications.event_return_status',
        label: 'Return updates',
    },
    {
        key: 'promotions',
        labelKey: 'notifications.event_promotions',
        label: 'Promotions',
    },
    {
        key: 'newsletter',
        labelKey: 'notifications.event_newsletter',
        label: 'Newsletter',
    },
    {
        key: 'review_response',
        labelKey: 'notifications.event_review_response',
        label: 'Review responses',
    },
    {
        key: 'back_in_stock',
        labelKey: 'notifications.event_back_in_stock',
        label: 'Back in stock',
    },
];

export default function NotificationPreferencesPage() {
    const { t } = useTranslation();
    const { data: preferences, isLoading } = useNotificationPreferences();
    const { mutate: updatePreference } = useUpdateNotificationPreference();
    const debounceTimers = useRef<
        Record<string, ReturnType<typeof setTimeout>>
    >({});

    const handleToggle = useCallback(
        (
            event: NotificationEvent,
            channel: NotificationChannel,
            value: boolean,
        ) => {
            const key = `${event}:${channel}`;
            if (debounceTimers.current[key]) {
                clearTimeout(debounceTimers.current[key]);
            }
            debounceTimers.current[key] = setTimeout(() => {
                updatePreference([{ channel, event, is_enabled: value }]);
            }, 400);
        },
        [updatePreference],
    );

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="bg-muted h-6 w-48 animate-pulse rounded" />
                <div className="bg-muted h-40 animate-pulse rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">
                {t(
                    'notifications.preferences_title',
                    'Notification Preferences',
                )}
            </h1>
            <p className="text-muted-foreground text-sm">
                {t(
                    'notifications.preferences_description',
                    'Choose how you want to be notified for each type of event.',
                )}
            </p>

            <div className="border-border bg-card overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-border border-b">
                            <th className="px-4 py-3 text-left font-semibold">
                                {t('notifications.event_type', 'Event')}
                            </th>
                            {CHANNELS.map((ch) => (
                                <th
                                    key={ch.key}
                                    className="px-4 py-3 text-center font-semibold"
                                >
                                    {t(ch.labelKey, ch.label)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                        {EVENTS.map((ev) => (
                            <tr key={ev.key}>
                                <td className="px-4 py-3 font-medium">
                                    {t(ev.labelKey, ev.label)}
                                </td>
                                {CHANNELS.map((ch) => {
                                    const isEnabled =
                                        preferences?.[ev.key]?.[ch.key] ?? true;
                                    return (
                                        <td
                                            key={ch.key}
                                            className="px-4 py-3 text-center"
                                        >
                                            <label
                                                className="inline-flex cursor-pointer items-center"
                                                aria-label={`${t(ev.labelKey, ev.label)} via ${t(ch.labelKey, ch.label)}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={isEnabled}
                                                    onChange={(e) =>
                                                        handleToggle(
                                                            ev.key,
                                                            ch.key,
                                                            e.target.checked,
                                                        )
                                                    }
                                                />
                                                <span
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                        isEnabled
                                                            ? 'bg-primary'
                                                            : 'bg-muted-foreground/30'
                                                    }`}
                                                    aria-hidden="true"
                                                >
                                                    <span
                                                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                                            isEnabled
                                                                ? 'translate-x-4'
                                                                : 'translate-x-1'
                                                        }`}
                                                    />
                                                </span>
                                            </label>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
