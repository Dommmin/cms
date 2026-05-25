/**
 * Formats a price given in cents to a localised currency string.
 * e.g. 1999 → "$19.99"
 */
export function formatPrice(
    cents: number | null | undefined,
    currency = 'USD',
    locale = 'en-US',
): string {
    if (cents == null || Number.isNaN(cents)) return '—';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(cents / 100);
}

/**
 * Returns a helper for getting a typed block relation by key.
 */
export function getRelationsByKey<T extends { relation_key: string | null }>(
    relations: T[],
    key: string,
): T[] {
    return relations.filter((r) => r.relation_key === key);
}

export function getRelationByKey<T extends { relation_key: string | null }>(
    relations: T[],
    key: string,
): T | undefined {
    return relations.find((r) => r.relation_key === key);
}
