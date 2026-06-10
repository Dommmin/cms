import { api } from '@/lib/axios';
import type {
    NewsletterPreferences,
    NewsletterSubscribePayload,
    UpdateNewsletterPreferencesPayload,
} from '@/types/api';

export async function subscribe(
    payload: NewsletterSubscribePayload,
): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
        '/newsletter/subscribe',
        payload,
    );
    return data;
}

export async function unsubscribe(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
        '/newsletter/unsubscribe',
        { email },
    );
    return data;
}

export async function getNewsletterPreferences(
    token: string,
): Promise<NewsletterPreferences> {
    const { data } = await api.get<NewsletterPreferences>(
        `/newsletter/preferences/${token}`,
    );
    return data;
}

export async function updateNewsletterPreferences(
    token: string,
    payload: UpdateNewsletterPreferencesPayload,
): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
        `/newsletter/preferences/${token}`,
        payload,
    );
    return data;
}
