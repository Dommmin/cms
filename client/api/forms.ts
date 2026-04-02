import { apiGet } from '@/lib/api';
import { api } from '@/lib/axios';
import type { Form } from '@/types/api';

export async function getForm(id: number): Promise<Form | null> {
  return apiGet<Form>(`/forms/${id}`);
}

export async function submitForm(
  id: number,
  payload: Record<string, unknown>,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(`/forms/${id}/submit`, payload);
  return data;
}
