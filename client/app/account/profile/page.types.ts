import type { Address } from '@/types/api';

export type AddressForm = Omit<Address, 'id' | 'is_default'>;

export interface DeleteAccountModalState {
    open: boolean;
    password: string;
    error: string | null;
}

export interface ConsentState {
    analytics: boolean;
    marketing: boolean;
}

export interface ProcessingRestrictionState {
    restricted: boolean;
    restricted_since: string | null;
}

export interface PrivacyRequestMetadata {
    id: number;
    typeLabel: string;
    statusLabel: string;
    requestedAtLabel: string;
    resolvedAtLabel: string | null;
}
