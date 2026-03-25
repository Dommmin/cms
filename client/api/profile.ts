import { api } from "@/lib/axios";
import type {
  Address,
  UpdatePasswordPayload,
  UpdateProfilePayload,
  User,
} from "@/types/api";

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<User> {
  const { data } = await api.get<{ user: User }>("/profile");
  return data.user;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.put<{ user: User }>("/profile", payload);
  return data.user;
}

export async function updatePassword(payload: UpdatePasswordPayload): Promise<void> {
  await api.put("/profile/password", payload);
}

export async function deleteAccount(password: string): Promise<void> {
  await api.delete("/profile", { data: { password } });
}

export async function exportData(): Promise<Blob> {
  const { data } = await api.get("/profile/export", { responseType: "blob" });
  return data as Blob;
}

// ── Addresses ─────────────────────────────────────────────────────────────────

export async function getAddresses(): Promise<Address[]> {
  // Collection returned directly → {data: [...]} wrapper
  const { data } = await api.get<{ data: Address[] }>("/addresses");
  return data.data;
}

export async function createAddress(
  payload: Omit<Address, "id" | "is_default">,
): Promise<Address> {
  // Single resource via response()->json() → flat
  const { data } = await api.post<Address>("/addresses", payload);
  return data;
}

export async function updateAddress(
  id: number,
  payload: Partial<Omit<Address, "id">>,
): Promise<Address> {
  const { data } = await api.put<Address>(`/addresses/${id}`, payload);
  return data;
}

export async function deleteAddress(id: number): Promise<void> {
  await api.delete(`/addresses/${id}`);
}

export async function setDefaultAddress(id: number): Promise<Address> {
  const { data } = await api.post<Address>(`/addresses/${id}/default`);
  return data;
}
