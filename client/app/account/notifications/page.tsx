'use client';

import { Bell, CheckCheck } from 'lucide-react';

import {
    useMarkAllRead,
    useMarkRead,
    useNotifications,
} from '@/hooks/use-notifications';
import { useTranslation } from '@/hooks/use-translation';

function relativeTime(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function NotificationsPage() {
    const { data, isLoading } = useNotifications();
    const { mutate: markRead } = useMarkRead();
    const { mutate: markAllRead, isPending: markingAll } = useMarkAllRead();
    const { t } = useTranslation();

    const notifications = data?.data ?? [];
    const hasUnread = notifications.some((n) => n.read_at === null);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-muted h-20 animate-pulse rounded-xl"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    {t('account.notifications', 'Notifications')}
                </h1>
                {hasUnread && (
                    <button
                        onClick={() => markAllRead()}
                        disabled={markingAll}
                        className="text-primary flex items-center gap-1.5 text-sm font-medium hover:opacity-80 disabled:opacity-50"
                        aria-label="Mark all notifications as read"
                    >
                        <CheckCheck className="h-4 w-4" aria-hidden="true" />
                        {t('account.mark_all_read', 'Mark all as read')}
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <Bell
                        className="text-muted-foreground h-10 w-10"
                        aria-hidden="true"
                    />
                    <p className="text-muted-foreground text-sm">
                        {t('account.no_notifications', 'No notifications yet')}
                    </p>
                </div>
            ) : (
                <ul className="space-y-3" aria-label="Notifications list">
                    {notifications.map((notification) => {
                        const isUnread = notification.read_at === null;

                        return (
                            <li key={notification.id}>
                                <button
                                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                                        isUnread
                                            ? 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                                            : 'border-border bg-card hover:bg-accent'
                                    }`}
                                    onClick={() => {
                                        if (isUnread) {
                                            markRead(notification.id);
                                        }
                                        if (notification.action_url) {
                                            window.open(
                                                notification.action_url,
                                                '_blank',
                                                'noopener,noreferrer',
                                            );
                                        }
                                    }}
                                    aria-label={`${notification.title}${isUnread ? ' (unread)' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`mt-0.5 flex-shrink-0 rounded-full p-1.5 ${
                                                isUnread
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            <Bell
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p
                                                    className={`text-sm font-medium ${isUnread ? 'text-foreground' : 'text-foreground/80'}`}
                                                >
                                                    {notification.title}
                                                    {isUnread && (
                                                        <span
                                                            className="bg-primary ml-2 inline-block h-2 w-2 rounded-full align-middle"
                                                            aria-label="Unread"
                                                        />
                                                    )}
                                                </p>
                                                <time
                                                    dateTime={
                                                        notification.created_at ??
                                                        ''
                                                    }
                                                    className="text-muted-foreground flex-shrink-0 text-xs"
                                                >
                                                    {relativeTime(
                                                        notification.created_at ??
                                                            '',
                                                    )}
                                                </time>
                                            </div>
                                            <p className="text-muted-foreground mt-0.5 text-sm">
                                                {notification.body}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
