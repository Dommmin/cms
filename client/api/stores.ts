import { serverFetch } from "@/lib/server-fetch";
import type { Store } from "@/types/api";

export async function getStores(): Promise<Store[]> {
  const { data } = await serverFetch<{ data: Store[] }>("/stores");
  return data;
}

export async function getStore(id: number): Promise<Store> {
  const { data } = await serverFetch<{ data: Store }>(`/stores/${id}`);
  return data;
}
