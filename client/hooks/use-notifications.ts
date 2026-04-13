'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    getNotifications,
    getUnreadCount,
    markAllNotificationsRead,
    markNotificationRead,
} from '@/api/notifications';

export const notificationKeys = {
    all: ['notifications'] as const,
    list: (page?: number) => ['notifications', 'list', page] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
};

export function useNotifications(page = 1) {
    return useQuery({
        queryKey: notificationKeys.list(page),
        queryFn: () => getNotifications(page),
    });
}

export function useUnreadCount() {
    return useQuery({
        queryKey: notificationKeys.unreadCount,
        queryFn: getUnreadCount,
        refetchInterval: 60_000,
    });
}

export function useMarkRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => markNotificationRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

export function useMarkAllRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}
