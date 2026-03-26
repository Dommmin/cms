'use client';

import { Cookie, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { updateConsent } from '@/lib/datalayer';
import { COOKIE_CONSENT_OPEN_EVENT } from '@/providers/cookie-consent-provider';
import type { ConsentState, CookieConsentProps, StoredConsent } from './cookie-consent.types';

const STORAGE_KEY = 'cookie_consent';

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

async function recordConsentOnServer(consent: ConsentState, version: string): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    await fetch('/api/v1/consent', {
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
        setPrefs({ analytics: stored.analytics, marketing: stored.marketing, functional: true });
      }
      setShowDetails(true);
      setVisible(true);
    }
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpen);
  }, []);

  // Focus trap: auto-focus first element + keep Tab within dialog
  useEffect(() => {
    if (!visible || !dialogRef.current) return;
    const el = dialogRef.current;
    const focusables = () => Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
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

  const bannerTitle = settings.banner_title ?? 'We use cookies';
  const bannerDescription =
    settings.banner_description ??
    'We use cookies to improve your experience, analyse traffic, and personalise content.';
  const privacyUrl = settings.privacy_policy_url ?? '/privacy-policy';
  const cookiePolicyUrl = settings.cookie_policy_url ?? '/cookie-policy';
  const analyticsDesc =
    settings.analytics_description ??
    'Help us understand how visitors use the site (e.g. Google Analytics).';
  const marketingDesc =
    settings.marketing_description ??
    'Used to show relevant ads and measure their effectiveness (e.g. Google Ads, Meta Pixel).';

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
      className="border-border bg-background/95 fixed right-0 bottom-0 left-0 z-50 border-t shadow-lg backdrop-blur"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {!showDetails ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Cookie className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-muted-foreground text-sm">
                {bannerDescription}{' '}
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-foreground font-medium underline"
                >
                  Manage preferences
                </button>
                {' · '}
                <Link href={privacyUrl} className="text-foreground font-medium underline">
                  Privacy Policy
                </Link>
                {' · '}
                <Link href={cookiePolicyUrl} className="text-foreground font-medium underline">
                  Cookie Policy
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={rejectAll}
                className="border-border hover:bg-accent rounded-lg border px-3 py-1.5 text-sm"
              >
                Reject all
              </button>
              <button
                onClick={acceptAll}
                className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-sm font-medium hover:opacity-90"
              >
                Accept all
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
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 space-y-3">
              {/* Functional — always on */}
              <div className="border-border flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Functional (strictly necessary)</p>
                  <p className="text-muted-foreground text-xs">
                    Essential for the site to work — session, cart, security. Cannot be disabled.
                  </p>
                </div>
                <input type="checkbox" checked disabled className="h-4 w-4 cursor-not-allowed" />
              </div>

              {/* Analytics */}
              <div className="border-border flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Analytics</p>
                  <p className="text-muted-foreground text-xs">{analyticsDesc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                  className="h-4 w-4 cursor-pointer"
                />
              </div>

              {/* Marketing */}
              <div className="border-border flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Marketing</p>
                  <p className="text-muted-foreground text-xs">{marketingDesc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                  className="h-4 w-4 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={savePrefs}
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Save preferences
              </button>
              <button
                onClick={rejectAll}
                className="border-border hover:bg-accent rounded-lg border px-4 py-2 text-sm"
              >
                Reject all
              </button>
              <button
                onClick={acceptAll}
                className="border-border hover:bg-accent rounded-lg border px-4 py-2 text-sm"
              >
                Accept all
              </button>
            </div>

            <p className="text-muted-foreground mt-3 text-xs">
              You can change your preferences at any time via the{' '}
              <Link href={cookiePolicyUrl} className="underline">
                Cookie Policy
              </Link>{' '}
              or the link in the footer. Consent version: {version}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
