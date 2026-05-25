'use client';

import { Cookie, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useTranslation } from '@/hooks/use-translation';
import { updateConsent } from '@/lib/datalayer';
import { COOKIE_CONSENT_OPEN_EVENT } from '@/providers/cookie-consent-provider';
import type {
    ConsentState,
    CookieConsentProps,
    StoredConsent,
} from './cookie-consent.types';

const STORAGE_KEY = 'cookie_consent';

const DEFAULT_COOKIE_COPY = {
    bannerTitle: 'We use cookies',
    bannerDescription:
        'We use cookies to improve your experience, analyse traffic, and personalise content.',
    analyticsDescription:
        'Help us understand how visitors use the site (e.g. Google Analytics).',
    marketingDescription:
        'Used to show relevant ads and measure their effectiveness (e.g. Google Ads, Meta Pixel).',
};

function getStoredConsent(): StoredConsent | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as StoredConsent) : null;
    } catch {
        return null;
    }
}

function storeConsent(consent: ConsentState, version: string): void {
    const stored: StoredConsent = { ...consent, version };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    // Cookie for SSR reads — Secure flag added on HTTPS
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `consent=${JSON.stringify(consent)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax${secure}`;
}

async function recordConsentOnServer(
    consent: ConsentState,
    version: string,
): Promise<void> {
    try {
        const sessionId = getOrCreateSessionId();
        await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'}/consent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                analytics: consent.analytics,
                marketing: consent.marketing,
                functional: consent.functional,
                session_id: sessionId,
                consent_version: version,
            }),
        });
    } catch {
        // Non-blocking — server recording best-effort
    }
}

function getOrCreateSessionId(): string {
    const key = 'consent_session_id';
    let id = localStorage.getItem(key);
    if (!id) {
        id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(key, id);
    }
    return id;
}

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CookieConsent({ settings = {} }: CookieConsentProps) {
    const { t, locale } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [prefs, setPrefs] = useState<ConsentState>({
        analytics: false,
        marketing: false,
        functional: true,
    });
    const dialogRef = useRef<HTMLDivElement>(null);

    const version = settings.consent_version ?? '1.0';

    // Show banner if no stored consent OR stored version differs from current
    useEffect(() => {
        const stored = getStoredConsent();
        if (!stored || stored.version !== version) {
            void Promise.resolve().then(() => setVisible(true));
        }
    }, [version]);

    // Listen for external "open preferences" trigger (e.g. from footer)
    useEffect(() => {
        function handleOpen() {
            const stored = getStoredConsent();
            if (stored) {
                setPrefs({
                    analytics: stored.analytics,
                    marketing: stored.marketing,
                    functional: true,
                });
            }
            setShowDetails(true);
            setVisible(true);
        }
        window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpen);
        return () =>
            window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpen);
    }, []);

    // Focus trap: auto-focus first element + keep Tab within dialog
    useEffect(() => {
        if (!visible || !dialogRef.current) return;
        const el = dialogRef.current;
        const focusables = () =>
            Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
        focusables()[0]?.focus();

        function onKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Tab') return;
            const items = focusables();
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
        el.addEventListener('keydown', onKeyDown);
        return () => el.removeEventListener('keydown', onKeyDown);
    }, [visible, showDetails]);

    if (!visible) return null;

    const localizedBannerTitle = t(
        'cookie.banner_title',
        locale === 'pl'
            ? 'Używamy plików cookie'
            : DEFAULT_COOKIE_COPY.bannerTitle,
    );
    const localizedBannerDescription = t(
        'cookie.banner_description',
        locale === 'pl'
            ? 'Używamy plików cookie, aby poprawiać działanie strony, analizować ruch i personalizować treści.'
            : DEFAULT_COOKIE_COPY.bannerDescription,
    );
    const localizedAnalyticsDesc = t(
        'cookie.analytics_description',
        locale === 'pl'
            ? 'Pomagają nam zrozumieć, jak odwiedzający korzystają ze strony, np. przez Google Analytics.'
            : DEFAULT_COOKIE_COPY.analyticsDescription,
    );
    const localizedMarketingDesc = t(
        'cookie.marketing_description',
        locale === 'pl'
            ? 'Służą do wyświetlania dopasowanych reklam i mierzenia ich skuteczności, np. Google Ads lub Meta Pixel.'
            : DEFAULT_COOKIE_COPY.marketingDescription,
    );
    const bannerTitle =
        locale !== 'en' &&
        (!settings.banner_title ||
            settings.banner_title === DEFAULT_COOKIE_COPY.bannerTitle)
            ? localizedBannerTitle
            : (settings.banner_title ?? localizedBannerTitle);
    const bannerDescription =
        locale !== 'en' &&
        (!settings.banner_description ||
            settings.banner_description ===
                DEFAULT_COOKIE_COPY.bannerDescription)
            ? localizedBannerDescription
            : (settings.banner_description ?? localizedBannerDescription);
    const privacyUrl = settings.privacy_policy_url ?? '/privacy-policy';
    const cookiePolicyUrl = settings.cookie_policy_url ?? '/cookie-policy';
    const analyticsDesc =
        locale !== 'en' &&
        (!settings.analytics_description ||
            settings.analytics_description ===
                DEFAULT_COOKIE_COPY.analyticsDescription)
            ? localizedAnalyticsDesc
            : (settings.analytics_description ?? localizedAnalyticsDesc);
    const marketingDesc =
        locale !== 'en' &&
        (!settings.marketing_description ||
            settings.marketing_description ===
                DEFAULT_COOKIE_COPY.marketingDescription)
            ? localizedMarketingDesc
            : (settings.marketing_description ?? localizedMarketingDesc);

    function applyConsent(consent: ConsentState) {
        storeConsent(consent, version);
        updateConsent(consent);
        void recordConsentOnServer(consent, version);
        setVisible(false);
    }

    function acceptAll() {
        applyConsent({ analytics: true, marketing: true, functional: true });
    }

    function rejectAll() {
        applyConsent({ analytics: false, marketing: false, functional: true });
    }

    function savePrefs() {
        applyConsent({ ...prefs, functional: true });
    }

    return (
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={bannerTitle}
            className="bg-background/70 fixed right-0 bottom-0 left-0 z-[60] overflow-hidden border-t border-white/10 pb-16 shadow-[0_-8px_32px_0_oklch(0_0_0_/_0.15)] backdrop-blur-2xl backdrop-saturate-150 md:pb-0 dark:border-white/5 dark:shadow-[0_-8px_32px_0_oklch(0_0_0_/_0.4)]"
        >
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                {!showDetails ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <Cookie
                                className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0"
                                aria-hidden="true"
                            />
                            <p className="text-muted-foreground text-sm">
                                {bannerDescription}{' '}
                                <button
                                    onClick={() => setShowDetails(true)}
                                    className="text-foreground font-medium underline"
                                >
                                    {t(
                                        'cookie.manage_preferences',
                                        locale === 'pl'
                                            ? 'Zarządzaj zgodami'
                                            : 'Manage preferences',
                                    )}
                                </button>
                                {' · '}
                                <Link
                                    href={privacyUrl}
                                    className="text-foreground font-medium underline"
                                >
                                    {t(
                                        'cookie.privacy_policy',
                                        locale === 'pl'
                                            ? 'Polityka prywatności'
                                            : 'Privacy Policy',
                                    )}
                                </Link>
                                {' · '}
                                <Link
                                    href={cookiePolicyUrl}
                                    className="text-foreground font-medium underline"
                                >
                                    {t(
                                        'cookie.cookie_policy',
                                        locale === 'pl'
                                            ? 'Polityka cookies'
                                            : 'Cookie Policy',
                                    )}
                                </Link>
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                onClick={rejectAll}
                                className="border-border/60 hover:bg-accent rounded-xl border px-4 py-2 text-sm backdrop-blur-sm transition-colors"
                            >
                                {t(
                                    'cookie.reject_all',
                                    locale === 'pl'
                                        ? 'Odrzuć wszystkie'
                                        : 'Reject all',
                                )}
                            </button>
                            <button
                                onClick={acceptAll}
                                className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:opacity-90 hover:shadow-md"
                            >
                                {t(
                                    'cookie.accept_all',
                                    locale === 'pl'
                                        ? 'Akceptuj wszystkie'
                                        : 'Accept all',
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">{bannerTitle}</h2>
                            <button
                                onClick={() => {
                                    setShowDetails(false);
                                    // If user opened via footer and already had stored consent, allow closing without re-saving
                                    const stored = getStoredConsent();
                                    if (stored && stored.version === version) {
                                        setVisible(false);
                                    }
                                }}
                                className="hover:bg-accent rounded p-1"
                                aria-label={t(
                                    'common.close',
                                    locale === 'pl' ? 'Zamknij' : 'Close',
                                )}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mb-4 space-y-3">
                            {/* Functional — always on */}
                            <div className="border-border flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p
                                        id="consent-functional-label"
                                        className="text-sm font-medium"
                                    >
                                        {t(
                                            'cookie.functional_label',
                                            locale === 'pl'
                                                ? 'Funkcjonalne (niezbędne)'
                                                : 'Functional (strictly necessary)',
                                        )}
                                    </p>
                                    <p
                                        id="consent-functional-desc"
                                        className="text-muted-foreground text-xs"
                                    >
                                        {t(
                                            'cookie.functional_description',
                                            locale === 'pl'
                                                ? 'Niezbędne do działania strony: sesja, koszyk i bezpieczeństwo. Nie można ich wyłączyć.'
                                                : 'Essential for the site to work: session, cart, security. Cannot be disabled.',
                                        )}
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked
                                    disabled
                                    aria-labelledby="consent-functional-label"
                                    aria-describedby="consent-functional-desc"
                                    className="h-4 w-4 cursor-not-allowed"
                                />
                            </div>

                            {/* Analytics */}
                            <div className="border-border flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p
                                        id="consent-analytics-label"
                                        className="text-sm font-medium"
                                    >
                                        {t(
                                            'cookie.analytics_label',
                                            locale === 'pl'
                                                ? 'Analityczne'
                                                : 'Analytics',
                                        )}
                                    </p>
                                    <p
                                        id="consent-analytics-desc"
                                        className="text-muted-foreground text-xs"
                                    >
                                        {analyticsDesc}
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefs.analytics}
                                    onChange={(e) =>
                                        setPrefs((p) => ({
                                            ...p,
                                            analytics: e.target.checked,
                                        }))
                                    }
                                    aria-labelledby="consent-analytics-label"
                                    aria-describedby="consent-analytics-desc"
                                    className="h-4 w-4 cursor-pointer"
                                />
                            </div>

                            {/* Marketing */}
                            <div className="border-border flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p
                                        id="consent-marketing-label"
                                        className="text-sm font-medium"
                                    >
                                        {t(
                                            'cookie.marketing_label',
                                            locale === 'pl'
                                                ? 'Marketingowe'
                                                : 'Marketing',
                                        )}
                                    </p>
                                    <p
                                        id="consent-marketing-desc"
                                        className="text-muted-foreground text-xs"
                                    >
                                        {marketingDesc}
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefs.marketing}
                                    onChange={(e) =>
                                        setPrefs((p) => ({
                                            ...p,
                                            marketing: e.target.checked,
                                        }))
                                    }
                                    aria-labelledby="consent-marketing-label"
                                    aria-describedby="consent-marketing-desc"
                                    className="h-4 w-4 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={savePrefs}
                                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
                            >
                                {t(
                                    'cookie.save_preferences',
                                    locale === 'pl'
                                        ? 'Zapisz preferencje'
                                        : 'Save preferences',
                                )}
                            </button>
                            <button
                                onClick={rejectAll}
                                className="border-border hover:bg-accent rounded-lg border px-4 py-2 text-sm"
                            >
                                {t(
                                    'cookie.reject_all',
                                    locale === 'pl'
                                        ? 'Odrzuć wszystkie'
                                        : 'Reject all',
                                )}
                            </button>
                            <button
                                onClick={acceptAll}
                                className="border-border hover:bg-accent rounded-lg border px-4 py-2 text-sm"
                            >
                                {t(
                                    'cookie.accept_all',
                                    locale === 'pl'
                                        ? 'Akceptuj wszystkie'
                                        : 'Accept all',
                                )}
                            </button>
                        </div>

                        <p className="text-muted-foreground mt-3 text-xs">
                            {t(
                                'cookie.footer_note_prefix',
                                locale === 'pl'
                                    ? 'Możesz zmienić preferencje w dowolnym momencie przez'
                                    : 'You can change your preferences at any time via the',
                            )}{' '}
                            <Link href={cookiePolicyUrl} className="underline">
                                {t(
                                    'cookie.cookie_policy',
                                    locale === 'pl'
                                        ? 'Politykę cookies'
                                        : 'Cookie Policy',
                                )}
                            </Link>{' '}
                            {t(
                                'cookie.footer_note_suffix',
                                locale === 'pl'
                                    ? 'lub link w stopce. Wersja zgody:'
                                    : 'or the link in the footer. Consent version:',
                            )}{' '}
                            {version}.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
