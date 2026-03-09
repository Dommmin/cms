import { api } from "@/lib/axios";
import type { Form } from "@/types/api";

export async function getForm(id: number): Promise<Form> {
  // Forms are fetched via the public page data / embedded in blocks.
  // This endpoint doesn't exist as a standalone GET on the public API,
  // but we provide a fallback for direct usage.
  const { data } = await api.get<{ data: Form }>(`/forms/${id}`);
  return data.data;
}

export async function submitForm(
  id: number,
  payload: Record<string, unknown>,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `/forms/${id}/submit`,
    payload,
  );
  return data;
}
