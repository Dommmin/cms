/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
    interface Window {
        dataLayer: any[];
        gtag?: (...args: any[]) => void;
    }
}

export type ConsentCategory = 'analytics' | 'marketing' | 'functional';
export type ConsentState = 'granted' | 'denied';

export interface DataLayerEvent {
    event: string;
    [key: string]: unknown;
}

export function pushDataLayer(event: DataLayerEvent): void {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push(event);
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

// ── Ecommerce events ──────────────────────────────────────────────────────────

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

export function trackViewItem(item: {
    id: number | string;
    name: string;
    price: number;
    currency?: string;
}): void {
    pushDataLayer({
        event: 'view_item',
        item_id: String(item.id),
        item_name: item.name,
        price: (item.price / 100).toFixed(2),
        currency: item.currency ?? 'USD',
    });
}

export function trackAddToCart(item: {
    id: number | string;
    name: string;
    quantity: number;
    price: number;
    currency?: string;
}): void {
    pushDataLayer({
        event: 'add_to_cart',
        item_id: String(item.id),
        item_name: item.name,
        quantity: item.quantity,
        price: (item.price / 100).toFixed(2),
        currency: item.currency ?? 'USD',
    });
}

export function trackRemoveFromCart(item: {
    id: number | string;
    name: string;
    quantity: number;
    price: number;
    currency?: string;
}): void {
    pushDataLayer({
        event: 'remove_from_cart',
        item_id: String(item.id),
        item_name: item.name,
        quantity: item.quantity,
        price: (item.price / 100).toFixed(2),
        currency: item.currency ?? 'USD',
    });
}

export function trackBeginCheckout(
    cartValue: number,
    currency: string,
    items: unknown[],
): void {
    pushDataLayer({
        event: 'begin_checkout',
        cart_value: (cartValue / 100).toFixed(2),
        currency,
        items,
    });
}

export function trackPurchase(order: {
    transactionId: string;
    revenue: number;
    currency: string;
    items: unknown[];
}): void {
    pushDataLayer({
        event: 'purchase',
        transaction_id: order.transactionId,
        revenue: (order.revenue / 100).toFixed(2),
        currency: order.currency,
        items: order.items,
    });
}

export function trackSignUp(): void {
    pushDataLayer({ event: 'sign_up' });
}

export function trackLogin(): void {
    pushDataLayer({ event: 'login' });
}

export function trackSearch(term: string): void {
    pushDataLayer({ event: 'search', search_term: term });
}
