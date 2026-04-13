import { api } from '@/lib/axios';
import type { CustomerNotification } from '@/types/api';

export interface NotificationsPage {
    data: CustomerNotification[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export async function getNotifications(page = 1): Promise<NotificationsPage> {
    const { data } = await api.get<NotificationsPage>('/notifications', {
        params: { page },
    });
    return data;
}

export async function markNotificationRead(
    id: number,
): Promise<CustomerNotification> {
    const { data } = await api.post<CustomerNotification>(
        `/notifications/${id}/read`,
    );
    return data;
}

export async function markAllNotificationsRead(): Promise<void> {
    await api.post('/notifications/read-all');
}

export async function getUnreadCount(): Promise<number> {
    const { data } = await api.get<{ count: number }>(
        '/notifications/unread-count',
    );
    return data.count;
}
