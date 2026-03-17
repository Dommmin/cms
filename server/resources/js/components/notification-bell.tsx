import { Link } from '@inertiajs/react';
import { Bell, BellOff, BellRing, Circle, Package, Star, AlertTriangle, MessageCircle, CheckCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AdminNotification {
    id: string;
    type: 'new_order' | 'pending_review' | 'low_stock' | 'unread_support';
    title: string;
    message: string;
    created_at: string;
    url: string;
}

const TYPE_ICON: Record<AdminNotification['type'], React.ElementType> = {
    new_order: Package,
    pending_review: Star,
    low_stock: AlertTriangle,
    unread_support: MessageCircle,
};

const TYPE_COLOR: Record<AdminNotification['type'], string> = {
    new_order: 'text-green-600',
    pending_review: 'text-yellow-600',
    low_stock: 'text-red-600',
    unread_support: 'text-blue-600',
};

const TYPE_BROWSER_ICON: Record<AdminNotification['type'], string> = {
    new_order: '/favicon.ico',
    pending_review: '/favicon.ico',
    low_stock: '/favicon.ico',
    unread_support: '/favicon.ico',
};

function getBrowserPermission(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
    const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(
        getBrowserPermission,
    );
    const panelRef = useRef<HTMLDivElement>(null);
    const seenIdsRef = useRef(seenIds);
    const browserNotifiedIds = useRef<Set<string>>(new Set());
    seenIdsRef.current = seenIds;

    const fireBrowserNotifications = useCallback((incoming: AdminNotification[]) => {
        if (browserPermission !== 'granted') return;
        if (document.hasFocus()) return;

        for (const n of incoming) {
            if (browserNotifiedIds.current.has(n.id)) continue;
            browserNotifiedIds.current.add(n.id);

            const notif = new Notification(n.title, {
                body: n.message,
                icon: TYPE_BROWSER_ICON[n.type],
                tag: n.id,
            });
            notif.onclick = () => {
                window.focus();
                notif.close();
            };
        }
    }, [browserPermission]);

    const applyUpdate = useCallback((data: { data: AdminNotification[]; unread_count: number }) => {
        const incoming = data.data;
        setNotifications(incoming);
        const newOnes = incoming.filter((n) => !seenIdsRef.current.has(n.id));
        setUnreadCount(newOnes.length);
        fireBrowserNotifications(newOnes);
    }, [fireBrowserNotifications]);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/admin/notifications', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) return;
            applyUpdate(await res.json());
        } catch {
            // ignore network errors
        }
    }, [applyUpdate]);

    useEffect(() => {
        fetchNotifications();
        const id = setInterval(fetchNotifications, 10_000);
        return () => clearInterval(id);
    }, [fetchNotifications]);

    // Close panel on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    function handleOpen() {
        setOpen((v) => !v);
        if (!open) {
            setSeenIds(new Set(notifications.map((n) => n.id)));
            setUnreadCount(0);
        }
    }

    function markAllRead() {
        setSeenIds(new Set(notifications.map((n) => n.id)));
        setUnreadCount(0);
    }

    async function requestBrowserPermission() {
        if (!('Notification' in window)) return;
        const result = await Notification.requestPermission();
        setBrowserPermission(result);
    }

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={handleOpen}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <h3 className="text-sm font-semibold">Notifications</h3>

                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark all read
                                </button>
                            )}
                            {browserPermission === 'default' && (
                                <button
                                    onClick={requestBrowserPermission}
                                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                                    title="Enable browser notifications"
                                >
                                    <BellRing className="h-3.5 w-3.5" />
                                    Enable
                                </button>
                            )}
                            {browserPermission === 'granted' && (
                                <span
                                    className="flex items-center gap-1 text-xs text-muted-foreground"
                                    title="Browser notifications enabled"
                                >
                                    <BellRing className="h-3.5 w-3.5 text-green-500" />
                                </span>
                            )}
                            {browserPermission === 'denied' && (
                                <span
                                    className="flex items-center gap-1 text-xs text-muted-foreground"
                                    title="Browser notifications blocked"
                                >
                                    <BellOff className="h-3.5 w-3.5 text-red-500" />
                                </span>
                            )}
                        </div>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                            {notifications.map((n) => {
                                const Icon = TYPE_ICON[n.type];
                                return (
                                    <li key={n.id}>
                                        <Link
                                            href={n.url}
                                            onClick={() => setOpen(false)}
                                            className="flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent"
                                        >
                                            <span
                                                className={cn(
                                                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted',
                                                    TYPE_COLOR[n.type],
                                                )}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium leading-tight">
                                                    {n.title}
                                                </p>
                                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                    {n.message}
                                                </p>
                                            </div>
                                            {!seenIds.has(n.id) && (
                                                <Circle className="mt-1.5 h-2 w-2 shrink-0 fill-primary text-primary" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
