import type { Address } from "@/types/api";

export type AddressForm = Omit<Address, "id" | "is_default">;
