import { subscribe as apiSubscribe } from '@/api/newsletter';
import type { NewsletterSubscribePayload } from '@/types/api';

export async function subscribeToNewsletter(
    payload: NewsletterSubscribePayload,
): Promise<{ message: string }> {
    return apiSubscribe(payload);
}
