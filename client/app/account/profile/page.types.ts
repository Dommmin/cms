import type { Address } from '@/types/api';

export type AddressForm = Omit<Address, 'id' | 'is_default'>;

export interface DeleteAccountModalState {
  open: boolean;
  password: string;
  error: string | null;
}
