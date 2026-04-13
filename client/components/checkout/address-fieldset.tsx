'use client';

import { MapPin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod/v4';

import type { AddressPayload } from '@/api/checkout';
import { useTranslation } from '@/hooks/use-translation';
import type { Address } from '@/types/api';
import type {
    AddressErrors,
    AddressFieldsetProps,
    NominatimResult,
} from './address-fieldset.types';

// ── Postal-code patterns per country ──────────────────────────────────────

const POSTAL_PATTERNS: Record<
    string,
    { pattern: RegExp; placeholder: string; format?: (raw: string) => string }
> = {
    PL: {
        pattern: /^\d{2}-\d{3}$/,
        placeholder: '00-000',
        format: (raw) => {
            const digits = raw.replace(/\D/g, '').slice(0, 5);
            return digits.length > 2
                ? `${digits.slice(0, 2)}-${digits.slice(2)}`
                : digits;
        },
    },
    DE: { pattern: /^\d{5}$/, placeholder: '12345' },
    CZ: {
        pattern: /^\d{3}\s?\d{2}$/,
        placeholder: '000 00',
        format: (raw) => {
            const digits = raw.replace(/\D/g, '').slice(0, 5);
            return digits.length > 3
                ? `${digits.slice(0, 3)} ${digits.slice(3)}`
                : digits;
        },
    },
    SK: {
        pattern: /^\d{3}\s?\d{2}$/,
        placeholder: '000 00',
        format: (raw) => {
            const digits = raw.replace(/\D/g, '').slice(0, 5);
            return digits.length > 3
                ? `${digits.slice(0, 3)} ${digits.slice(3)}`
                : digits;
        },
    },
    US: { pattern: /^\d{5}(-\d{4})?$/, placeholder: '12345' },
    GB: {
        pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
        placeholder: 'SW1A 1AA',
    },
    FR: { pattern: /^\d{5}$/, placeholder: '75001' },
    NL: { pattern: /^\d{4}\s?[A-Z]{2}$/i, placeholder: '1234 AB' },
    BE: { pattern: /^\d{4}$/, placeholder: '1000' },
    AT: { pattern: /^\d{4}$/, placeholder: '1010' },
};

function formatPostalCode(value: string, country: string): string {
    return POSTAL_PATTERNS[country]?.format?.(value) ?? value;
}

function validatePostalCode(value: string, country: string): boolean {
    const p = POSTAL_PATTERNS[country];
    if (!p) return value.length >= 3;
    return p.pattern.test(value);
}

// ── Zod schema ─────────────────────────────────────────────────────────────

const addressSchema = z.object({
    first_name: z.string().min(1, 'Imię jest wymagane'),
    last_name: z.string().min(1, 'Nazwisko jest wymagane'),
    company_name: z.string().optional(),
    street: z.string().min(3, 'Ulica jest wymagana'),
    street2: z.string().optional(),
    city: z.string().min(2, 'Miasto jest wymagane'),
    postal_code: z.string().min(1, 'Kod pocztowy jest wymagany'),
    country_code: z.string().min(2),
    phone: z.string().min(7, 'Numer telefonu jest wymagany'),
});

function validateAddress(value: AddressPayload): AddressErrors {
    const result = addressSchema.safeParse(value);
    const errors: AddressErrors = {};
    if (!result.success) {
        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof AddressPayload;
            if (!errors[field]) errors[field] = issue.message;
        }
    }
    if (
        value.postal_code &&
        !validatePostalCode(value.postal_code, value.country_code)
    ) {
        errors.postal_code = `Nieprawidłowy format kodu pocztowego (${POSTAL_PATTERNS[value.country_code]?.placeholder ?? 'sprawdź format'})`;
    }
    return errors;
}

// ── Nominatim address autocomplete ─────────────────────────────────────────

function useAddressSearch(query: string, country: string) {
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    useEffect(() => {
        if (query.length < 4) {
            setResults([]);
            return;
        }
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    q: query,
                    format: 'json',
                    addressdetails: '1',
                    limit: '5',
                    countrycodes: country.toLowerCase(),
                });
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?${params}`,
                    {
                        headers: {
                            'Accept-Language': 'pl',
                            'User-Agent': 'StoreCMS/1.0',
                        },
                    },
                );
                const data: NominatimResult[] = await res.json();
                setResults(data);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500);
        return () => clearTimeout(timerRef.current);
    }, [query, country]);

    return { results, loading };
}

// ── Saved address picker ───────────────────────────────────────────────────

function addressToPayload(addr: Address): AddressPayload {
    return {
        first_name: addr.first_name ?? '',
        last_name: addr.last_name ?? '',
        company_name: addr.company_name ?? '',
        street: addr.street ?? '',
        street2: addr.street2 ?? '',
        city: addr.city ?? '',
        postal_code: addr.postal_code ?? '',
        country_code: addr.country_code ?? 'PL',
        phone: addr.phone ?? '',
    };
}

function SavedAddressPicker({
    addresses,
    onSelect,
    pickerId,
}: {
    addresses: Address[];
    onSelect: (payload: AddressPayload) => void;
    pickerId: string;
}) {
    const { t } = useTranslation();
    if (addresses.length === 0) return null;
    return (
        <div className="mb-3">
            <label
                htmlFor={pickerId}
                className="text-muted-foreground mb-1 block text-xs font-medium"
            >
                {t('address.saved_address_label', 'Select saved address')}
            </label>
            <select
                id={pickerId}
                defaultValue=""
                onChange={(e) => {
                    const addr = addresses.find(
                        (a) => a.id === Number(e.target.value),
                    );
                    if (addr) onSelect(addressToPayload(addr));
                }}
                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
                <option value="" disabled>
                    {t('address.select_address', '— Select address —')}
                </option>
                {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                        {addr.first_name} {addr.last_name}, {addr.street},{' '}
                        {addr.city}
                        {addr.is_default
                            ? ` ${t('address.default_suffix', '(default)')}`
                            : ''}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ── Field wrapper ──────────────────────────────────────────────────────────

function Field({
    label,
    id,
    error,
    errorId,
    children,
    className,
}: {
    label: string;
    id?: string;
    error?: string;
    errorId?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <label
                htmlFor={id}
                className="text-muted-foreground mb-1 block text-xs"
            >
                {label}
            </label>
            {children}
            {error && (
                <p
                    id={errorId}
                    role="alert"
                    className="text-destructive mt-1 text-xs"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

const inputCls = (error?: string) =>
    `w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
        error ? 'border-destructive focus:ring-destructive/40' : 'border-input'
    }`;

// ── Countries ──────────────────────────────────────────────────────────────

const COUNTRIES = [
    { code: 'PL', label: 'Poland' },
    { code: 'DE', label: 'Germany' },
    { code: 'CZ', label: 'Czech Republic' },
    { code: 'SK', label: 'Slovakia' },
    { code: 'AT', label: 'Austria' },
    { code: 'BE', label: 'Belgium' },
    { code: 'NL', label: 'Netherlands' },
    { code: 'FR', label: 'France' },
    { code: 'GB', label: 'United Kingdom' },
    { code: 'US', label: 'USA' },
];

// ── Main AddressFieldset ───────────────────────────────────────────────────

export function AddressFieldset({
    title,
    value,
    onChange,
    savedAddresses,
    autocompleteSection = 'billing',
    showAllErrors = false,
}: AddressFieldsetProps) {
    const { t } = useTranslation();
    const [touched, setTouched] = useState<
        Partial<Record<keyof AddressPayload, boolean>>
    >({});
    const [streetQuery, setStreetQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const { results: suggestions, loading: suggestionsLoading } =
        useAddressSearch(streetQuery, value.country_code);

    const errors = validateAddress(value);

    const set = useCallback(
        (field: keyof AddressPayload, val: string) =>
            onChange({ ...value, [field]: val }),
        [onChange, value],
    );

    const touch = (field: keyof AddressPayload) =>
        setTouched((prev) => ({ ...prev, [field]: true }));

    const err = (field: keyof AddressPayload) =>
        showAllErrors || touched[field] ? errors[field] : undefined;

    // Close suggestions on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function applySuggestion(result: NominatimResult) {
        const a = result.address;
        const street = [a.road, a.house_number].filter(Boolean).join(' ');
        const city = a.city ?? a.town ?? a.village ?? '';
        const postal = a.postcode ?? '';
        const country = (a.country_code ?? value.country_code).toUpperCase();

        onChange({
            ...value,
            street: street || value.street,
            city: city || value.city,
            postal_code: formatPostalCode(postal, country),
            country_code: country,
        });
        setStreetQuery('');
        setShowSuggestions(false);
        setTouched((prev) => ({
            ...prev,
            street: true,
            city: true,
            postal_code: true,
        }));
    }

    return (
        <fieldset className="border-border rounded-xl border p-5">
            <legend className="px-1 text-sm font-semibold">{title}</legend>

            {savedAddresses && savedAddresses.length > 0 && (
                <div className="mt-2">
                    <SavedAddressPicker
                        addresses={savedAddresses}
                        onSelect={onChange}
                        pickerId={`${autocompleteSection}-saved-address`}
                    />
                </div>
            )}

            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* First / Last name */}
                <Field
                    label={t('address.first_name', 'First Name *')}
                    id={`${autocompleteSection}-first-name`}
                    error={err('first_name')}
                    errorId={`${autocompleteSection}-first-name-error`}
                >
                    <input
                        id={`${autocompleteSection}-first-name`}
                        required
                        autoComplete={`${autocompleteSection} given-name`}
                        value={value.first_name}
                        onChange={(e) => set('first_name', e.target.value)}
                        onBlur={() => touch('first_name')}
                        aria-describedby={
                            err('first_name')
                                ? `${autocompleteSection}-first-name-error`
                                : undefined
                        }
                        aria-invalid={!!err('first_name')}
                        className={inputCls(err('first_name'))}
                    />
                </Field>

                <Field
                    label={t('address.last_name', 'Last Name *')}
                    id={`${autocompleteSection}-last-name`}
                    error={err('last_name')}
                    errorId={`${autocompleteSection}-last-name-error`}
                >
                    <input
                        id={`${autocompleteSection}-last-name`}
                        required
                        autoComplete={`${autocompleteSection} family-name`}
                        value={value.last_name}
                        onChange={(e) => set('last_name', e.target.value)}
                        onBlur={() => touch('last_name')}
                        aria-describedby={
                            err('last_name')
                                ? `${autocompleteSection}-last-name-error`
                                : undefined
                        }
                        aria-invalid={!!err('last_name')}
                        className={inputCls(err('last_name'))}
                    />
                </Field>

                {/* Company */}
                <Field
                    label={t('address.company', 'Company')}
                    id={`${autocompleteSection}-company`}
                    className="sm:col-span-2"
                >
                    <input
                        id={`${autocompleteSection}-company`}
                        autoComplete={`${autocompleteSection} organization`}
                        value={value.company_name ?? ''}
                        onChange={(e) => set('company_name', e.target.value)}
                        className={inputCls()}
                    />
                </Field>

                {/* Street with autocomplete */}
                <Field
                    label={t('address.street', 'Street & Number *')}
                    id={`${autocompleteSection}-street`}
                    error={err('street')}
                    errorId={`${autocompleteSection}-street-error`}
                    className="sm:col-span-2"
                >
                    <div ref={suggestionsRef} className="relative">
                        <div className="relative">
                            <input
                                id={`${autocompleteSection}-street`}
                                required
                                autoComplete={`${autocompleteSection} street-address`}
                                value={value.street}
                                onChange={(e) => {
                                    set('street', e.target.value);
                                    setStreetQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onBlur={() => touch('street')}
                                aria-describedby={
                                    err('street')
                                        ? `${autocompleteSection}-street-error`
                                        : undefined
                                }
                                aria-invalid={!!err('street')}
                                className={inputCls(err('street'))}
                                placeholder="np. ul. Marszałkowska 1"
                            />
                            {suggestionsLoading && (
                                <MapPin className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-pulse" />
                            )}
                        </div>

                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="border-border bg-popover absolute top-full right-0 left-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border shadow-lg">
                                {suggestions.map((s) => (
                                    <li key={s.place_id}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                applySuggestion(s);
                                            }}
                                            className="hover:bg-accent flex w-full items-start gap-2 px-3 py-2 text-left text-sm"
                                        >
                                            <MapPin className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            <span className="text-foreground">
                                                {s.display_name}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Field>

                {/* Postal code */}
                <Field
                    label={t('address.postal_code', 'Postal Code *')}
                    id={`${autocompleteSection}-postal-code`}
                    error={err('postal_code')}
                    errorId={`${autocompleteSection}-postal-code-error`}
                >
                    <input
                        id={`${autocompleteSection}-postal-code`}
                        required
                        autoComplete={`${autocompleteSection} postal-code`}
                        value={value.postal_code}
                        placeholder={
                            POSTAL_PATTERNS[value.country_code]?.placeholder
                        }
                        onChange={(e) => {
                            const formatted = formatPostalCode(
                                e.target.value,
                                value.country_code,
                            );
                            set('postal_code', formatted);
                        }}
                        onBlur={() => touch('postal_code')}
                        aria-describedby={
                            err('postal_code')
                                ? `${autocompleteSection}-postal-code-error`
                                : undefined
                        }
                        aria-invalid={!!err('postal_code')}
                        className={inputCls(err('postal_code'))}
                    />
                </Field>

                {/* City */}
                <Field
                    label={t('address.city', 'City *')}
                    id={`${autocompleteSection}-city`}
                    error={err('city')}
                    errorId={`${autocompleteSection}-city-error`}
                >
                    <input
                        id={`${autocompleteSection}-city`}
                        required
                        autoComplete={`${autocompleteSection} address-level2`}
                        value={value.city}
                        onChange={(e) => set('city', e.target.value)}
                        onBlur={() => touch('city')}
                        aria-describedby={
                            err('city')
                                ? `${autocompleteSection}-city-error`
                                : undefined
                        }
                        aria-invalid={!!err('city')}
                        className={inputCls(err('city'))}
                    />
                </Field>

                {/* Country */}
                <Field
                    label={t('address.country', 'Country *')}
                    id={`${autocompleteSection}-country`}
                    className="sm:col-span-2"
                >
                    <select
                        id={`${autocompleteSection}-country`}
                        autoComplete={`${autocompleteSection} country`}
                        value={value.country_code}
                        onChange={(e) => {
                            // Reset postal code when country changes to avoid stale format
                            onChange({
                                ...value,
                                country_code: e.target.value,
                                postal_code: '',
                            });
                        }}
                        className={inputCls()}
                    >
                        {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {/* Phone */}
                <Field
                    label={t('address.phone', 'Phone *')}
                    id={`${autocompleteSection}-phone`}
                    error={err('phone')}
                    errorId={`${autocompleteSection}-phone-error`}
                    className="sm:col-span-2"
                >
                    <input
                        id={`${autocompleteSection}-phone`}
                        required
                        type="tel"
                        autoComplete={`${autocompleteSection} tel`}
                        value={value.phone}
                        onChange={(e) => set('phone', e.target.value)}
                        onBlur={() => touch('phone')}
                        placeholder="+48 123 456 789"
                        aria-describedby={
                            err('phone')
                                ? `${autocompleteSection}-phone-error`
                                : undefined
                        }
                        aria-invalid={!!err('phone')}
                        className={inputCls(err('phone'))}
                    />
                </Field>
            </div>
        </fieldset>
    );
}

export { addressToPayload, validateAddress };
export type { AddressErrors };
