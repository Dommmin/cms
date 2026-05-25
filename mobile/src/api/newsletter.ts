import { api } from '@/api/client';
import type { NewsletterSubscribePayload } from '@/types/api';

export async function subscribe(payload: NewsletterSubscribePayload): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/newsletter/subscribe', payload);
  return data;
}
