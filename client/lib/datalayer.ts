declare global {
    interface Window {
        dataLayer: Array<Record<string, unknown>>;
        gtag?: (...args: unknown[]) => void;
    }
}

export type ConsentCategory = 'analytics' | 'marketing' | 'functional';
export type ConsentState = 'granted' | 'denied';

export interface DataLayerEvent {
    event: string;
    [key: string]: unknown;
}

/** GA4 Enhanced Ecommerce item shape */
export interface Ga4Item {
    item_id: string;
    item_name: string;
    item_category?: string;
    item_variant?: string;
    price: number; // in major currency unit (e.g. 49.99)
    quantity?: number;
    discount?: number;
    index?: number;
}

export function pushDataLayer(
    event: DataLayerEvent | { ecommerce: null },
): void {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push(event as Record<string, unknown>);
}

/** Push default denied consent state (call before GTM loads) */
export function initConsentMode(): void {
    pushDataLayer({
        event: 'consent_default',
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        functionality_storage: 'denied',
        security_storage: 'granted', // security cookies are strictly necessary
    });
}

/** Update consent after user choice */
export function updateConsent(
    categories: Record<ConsentCategory, boolean>,
): void {
    pushDataLayer({
        event: 'consent_update',
        analytics_storage: categories.analytics ? 'granted' : 'denied',
        ad_storage: categories.marketing ? 'granted' : 'denied',
        ad_user_data: categories.marketing ? 'granted' : 'denied',
        ad_personalization: categories.marketing ? 'granted' : 'denied',
        functionality_storage: categories.functional ? 'granted' : 'denied',
        security_storage: 'granted',
    });
}

/**
 * Read the GA4 client_id from the _ga cookie.
 * Format: GA1.1.XXXXXXXXXX.XXXXXXXXXX — we need the last two dot-separated parts.
 * Returns null when the cookie is absent (e.g. consent not yet given).
 */
export function getGaClientId(): string | null {
    if (typeof document === 'undefined') return null;
    const gaCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('_ga='));
    if (!gaCookie) return null;
    const parts = gaCookie.split('=')[1]?.split('.');
    if (!parts || parts.length < 4) return null;
    return `${parts[2]}.${parts[3]}`;
}

// ── Page / navigation ──────────────────────────────────────────────────────────

export function trackPageView(
    path: string,
    title: string,
    locale?: string,
): void {
    pushDataLayer({
        event: 'page_view',
        page_path: path,
        page_title: title,
        locale: locale ?? '',
    });
}

// ── GA4 Enhanced Ecommerce events ─────────────────────────────────────────────
// All ecommerce events use the `ecommerce` container key per GA4 spec.
// GTM should be configured with a DataLayer variable scoped to `ecommerce`.

export function trackViewItem(item: {
    id: number | string;
    name: string;
    price: number; // in smallest currency unit (cents)
    currency?: string;
    category?: string;
}): void {
    pushDataLayer({ ecommerce: null }); // clear previous ecommerce object
    pushDataLayer({
        event: 'view_item',
        ecommerce: {
            currency: item.currency ?? 'PLN',
            value: +(item.price / 100).toFixed(2),
            items: [
                {
                    item_id: String(item.id),
                    item_name: item.name,
                    item_category: item.category,
                    price: +(item.price / 100).toFixed(2),
                    quantity: 1,
                    index: 0,
                } satisfies Ga4Item,
            ],
        },
    });
}

export function trackAddToCart(item: {
    id: number | string;
    name: string;
    quantity: number;
    price: number; // cents
    currency?: string;
    category?: string;
    discount?: number; // cents
}): void {
    pushDataLayer({ ecommerce: null });
    pushDataLayer({
        event: 'add_to_cart',
        ecommerce: {
            currency: item.currency ?? 'PLN',
            value: +((item.price * item.quantity) / 100).toFixed(2),
            items: [
                {
                    item_id: String(item.id),
                    item_name: item.name,
                    item_category: item.category,
                    price: +(item.price / 100).toFixed(2),
                    quantity: item.quantity,
                    discount: item.discount
                        ? +(item.discount / 100).toFixed(2)
                        : undefined,
                    index: 0,
                } satisfies Ga4Item,
            ],
        },
    });
}

export function trackRemoveFromCart(item: {
    id: number | string;
    name: string;
    quantity: number;
    price: number; // cents
    currency?: string;
}): void {
    pushDataLayer({ ecommerce: null });
    pushDataLayer({
        event: 'remove_from_cart',
        ecommerce: {
            currency: item.currency ?? 'PLN',
            value: +((item.price * item.quantity) / 100).toFixed(2),
            items: [
                {
                    item_id: String(item.id),
                    item_name: item.name,
                    price: +(item.price / 100).toFixed(2),
                    quantity: item.quantity,
                    index: 0,
                } satisfies Ga4Item,
            ],
        },
    });
}

export function trackBeginCheckout(
    cartValue: number, // cents
    currency: string,
    items: Array<{
        variant_id: number | string;
        product: { name: string; category?: { name?: string } };
        unit_price: number; // cents
        quantity: number;
    }>,
): void {
    pushDataLayer({ ecommerce: null });
    pushDataLayer({
        event: 'begin_checkout',
        ecommerce: {
            currency,
            value: +(cartValue / 100).toFixed(2),
            items: items.map((item, index) => ({
                item_id: String(item.variant_id),
                item_name: item.product.name,
                item_category: item.product.category?.name,
                price: +(item.unit_price / 100).toFixed(2),
                quantity: item.quantity,
                index,
            })) satisfies Ga4Item[],
        },
    });
}

export function trackPurchase(order: {
    transactionId: string;
    revenue: number; // cents
    currency: string;
    tax?: number; // cents
    shippingCost?: number; // cents
    items: Array<{
        item_id: number | string;
        item_name: string;
        item_category?: string;
        price: number; // cents
        quantity: number;
        discount?: number; // cents
    }>;
}): void {
    pushDataLayer({ ecommerce: null });
    pushDataLayer({
        event: 'purchase',
        ecommerce: {
            transaction_id: order.transactionId,
            currency: order.currency,
            value: +(order.revenue / 100).toFixed(2),
            tax:
                order.tax !== undefined
                    ? +(order.tax / 100).toFixed(2)
                    : undefined,
            shipping:
                order.shippingCost !== undefined
                    ? +(order.shippingCost / 100).toFixed(2)
                    : undefined,
            items: order.items.map((item, index) => ({
                item_id: String(item.item_id),
                item_name: item.item_name,
                item_category: item.item_category,
                price: +(item.price / 100).toFixed(2),
                quantity: item.quantity,
                discount: item.discount
                    ? +(item.discount / 100).toFixed(2)
                    : undefined,
                index,
            })) satisfies Ga4Item[],
        },
    });
}

// ── Non-ecommerce events ───────────────────────────────────────────────────────

export function trackSignUp(): void {
    pushDataLayer({ event: 'sign_up' });
}

export function trackLogin(): void {
    pushDataLayer({ event: 'login' });
}

export function trackSearch(term: string): void {
    pushDataLayer({ event: 'search', search_term: term });
}
