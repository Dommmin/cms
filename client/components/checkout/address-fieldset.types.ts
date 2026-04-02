import type { AddressPayload } from '@/api/checkout';
import type { Address } from '@/types/api';

export type AddressErrors = Partial<Record<keyof AddressPayload, string>>;
export interface NominatimResult {
    place_id: number;
    display_name: string;
    address: {
        road?: string;
        house_number?: string;
        city?: string;
        town?: string;
        village?: string;
        postcode?: string;
        country_code?: string;
    };
}
export interface AddressFieldsetProps {
    title: string;
    value: AddressPayload;
    onChange: (v: AddressPayload) => void;
    savedAddresses?: Address[];
    /** Prefix for autocomplete attributes, e.g. "billing" or "shipping" */
    autocompleteSection?: string;
    /** If true, shows validation errors even for untouched fields (on submit) */
    showAllErrors?: boolean;
}
