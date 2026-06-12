'use client';

import { Cookie, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useStorefrontRoutes } from '@/hooks/use-cms';
import { useLocalePath } from '@/hooks/use-locale';
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

function localiseUrl(
    url: string | null | undefined,
    lp: (path: string) => string,
): string | null {
    if (!url || url === '#') return null;
    if (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('//')
    )
        return url;
    return lp(url);
}

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
    const lp = useLocalePath();
    const { data: storefrontRoutes } = useStorefrontRoutes();
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

    useEffect(() => {
        const root = document.documentElement;

        if (!visible || !dialogRef.current) {
            root.style.setProperty('--cookie-consent-offset', '0px');
            return;
        }

        const el = dialogRef.current;

        const updateOffset = () => {
            root.style.setProperty(
                '--cookie-consent-offset',
                `${el.getBoundingClientRect().height + 12}px`,
            );
        };

        updateOffset();

        const resizeObserver = new ResizeObserver(() => {
            updateOffset();
        });

        resizeObserver.observe(el);
        window.addEventListener('resize', updateOffset);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateOffset);
            root.style.setProperty('--cookie-consent-offset', '0px');
        };
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
    const privacyUrl = localiseUrl(
        storefrontRoutes?.privacy_policy ?? settings.privacy_policy_url,
        lp,
    );
    const cookiePolicyUrl = localiseUrl(
        storefrontRoutes?.cookie_policy ?? settings.cookie_policy_url,
        lp,
    );
    const privacyPolicyLabel = t(
        'cookie.privacy_policy',
        locale === 'pl' ? 'Polityka prywatności' : 'Privacy Policy',
    );
    const cookiePolicyLabel = t(
        'cookie.cookie_policy',
        locale === 'pl' ? 'Polityka cookies' : 'Cookie Policy',
    );
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
            className="bg-background/92 border-border/70 fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl backdrop-saturate-150 md:right-4 md:bottom-4 md:left-4 md:rounded-3xl dark:shadow-[0_12px_40px_0_oklch(0_0_0_/_0.45)]"
        >
            <div className="store-shell mx-auto w-full px-4 py-4 sm:px-5 md:px-6 lg:px-8">
                {!showDetails ? (
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex items-start gap-3">
                            <Cookie
                                className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0"
                                aria-hidden="true"
                            />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">
                                    {bannerTitle}
                                </p>
                                <p className="text-muted-foreground text-sm leading-5">
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
                                    {privacyUrl ? (
                                        <Link
                                            href={privacyUrl}
                                            className="text-foreground font-medium underline"
                                        >
                                            {privacyPolicyLabel}
                                        </Link>
                                    ) : (
                                        <span className="text-foreground font-medium">
                                            {privacyPolicyLabel}
                                        </span>
                                    )}
                                    {' · '}
                                    {cookiePolicyUrl ? (
                                        <Link
                                            href={cookiePolicyUrl}
                                            className="text-foreground font-medium underline"
                                        >
                                            {cookiePolicyLabel}
                                        </Link>
                                    ) : (
                                        <span className="text-foreground font-medium">
                                            {cookiePolicyLabel}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                            <button
                                onClick={rejectAll}
                                className="border-border/60 hover:bg-accent min-h-11 rounded-xl border px-4 py-2 text-sm backdrop-blur-sm transition-colors"
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
                                className="bg-primary text-primary-foreground min-h-11 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:opacity-90 hover:shadow-md"
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
                        <div className="mb-4 flex items-center justify-between gap-3">
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
                            <div className="border-border flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
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
                            <div className="border-border flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
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
                            <div className="border-border flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
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

                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                            <button
                                onClick={savePrefs}
                                className="bg-primary text-primary-foreground min-h-11 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
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
                                className="border-border hover:bg-accent min-h-11 rounded-lg border px-4 py-2 text-sm"
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
                                className="border-border hover:bg-accent min-h-11 rounded-lg border px-4 py-2 text-sm"
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
                            {cookiePolicyUrl ? (
                                <Link
                                    href={cookiePolicyUrl}
                                    className="underline"
                                >
                                    {cookiePolicyLabel}
                                </Link>
                            ) : (
                                <span>{cookiePolicyLabel}</span>
                            )}{' '}
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
