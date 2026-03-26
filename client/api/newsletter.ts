import { api } from '@/lib/axios';
import type { NewsletterSubscribePayload } from '@/types/api';

export async function subscribe(payload: NewsletterSubscribePayload): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/newsletter/subscribe', payload);
  return data;
}

export async function unsubscribe(email: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/newsletter/unsubscribe', { email });
  return data;
}
