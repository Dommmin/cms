import { api } from '@/lib/axios';

export type NotificationChannel = 'email' | 'sms' | 'push';
export type NotificationEvent =
    | 'order_status'
    | 'return_status'
    | 'promotions'
    | 'newsletter'
    | 'review_response'
    | 'back_in_stock';

/** Map of event -> channel -> is_enabled */
export type NotificationPreferencesMap = Record<
    NotificationEvent,
    Record<NotificationChannel, boolean>
>;

export interface NotificationPreferenceUpdate {
    channel: NotificationChannel;
    event: NotificationEvent;
    is_enabled: boolean;
}

export async function getPreferences(): Promise<NotificationPreferencesMap> {
    const { data } = await api.get<{ preferences: NotificationPreferencesMap }>(
        '/notification-preferences',
    );
    return data.preferences;
}

export async function updatePreferences(
    preferences: NotificationPreferenceUpdate[],
): Promise<void> {
    await api.put('/notification-preferences', { preferences });
}
