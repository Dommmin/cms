import { api } from "@/lib/axios";

export async function getTranslations(locale: string): Promise<Record<string, string>> {
  const { data } = await api.get<Record<string, string>>(`/translations/${locale}`);
  return data;
}
