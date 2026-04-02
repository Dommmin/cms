import { api } from '@/lib/axios';
import type { SupportConversation, SupportMessage } from '@/types/api';

export const SUPPORT_TOKEN_KEY = 'support_token';

export function getSupportToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(SUPPORT_TOKEN_KEY);
}

export function setSupportToken(token: string): void {
    localStorage.setItem(SUPPORT_TOKEN_KEY, token);
}

export function clearSupportToken(): void {
    localStorage.removeItem(SUPPORT_TOKEN_KEY);
}

export interface StartConversationPayload {
    email?: string;
    name?: string;
    subject: string;
    body: string;
    channel?: 'widget' | 'email';
}

export async function startConversation(
    payload: StartConversationPayload,
): Promise<SupportConversation> {
    const { data } = await api.post<SupportConversation>(
        '/support/conversations',
        payload,
    );
    setSupportToken(data.token);
    return data;
}

export async function getConversation(
    token: string,
): Promise<SupportConversation> {
    const { data } = await api.get<SupportConversation>(
        `/support/conversations/${token}`,
    );
    return data;
}

export async function addMessage(
    token: string,
    body: string,
): Promise<SupportMessage> {
    const { data } = await api.post<SupportMessage>(
        `/support/conversations/${token}/messages`,
        {
            body,
        },
    );
    return data;
}
