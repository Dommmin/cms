'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { NotificationPreferenceUpdate } from '@/api/notification-preferences';
import {
    getPreferences,
    updatePreferences,
} from '@/api/notification-preferences';

const QUERY_KEY = ['notification-preferences'] as const;

export function useNotificationPreferences() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: getPreferences,
    });
}

export function useUpdateNotificationPreference() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (preferences: NotificationPreferenceUpdate[]) =>
            updatePreferences(preferences),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
}
