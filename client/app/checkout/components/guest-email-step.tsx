'use client';

import { useTranslation } from '@/hooks/use-translation';

import type { GuestEmailStepProps } from '../checkout.types';

export function GuestEmailStep({
    guestEmail,
    submitAttempted,
    onGuestEmailChange,
}: GuestEmailStepProps) {
    const { t } = useTranslation();
    const showError = submitAttempted && !guestEmail.trim();

    return (
        <div className="border-border rounded-xl border p-5">
            <label
                htmlFor="guest-email"
                className="mb-3 block text-sm font-semibold"
            >
                {t('checkout.guest_email_title', 'Your Email Address')}
            </label>
            <p
                className="text-muted-foreground mb-3 text-xs"
                id="guest-email-hint"
            >
                {t(
                    'checkout.guest_email_hint',
                    "We'll send your order confirmation here.",
                )}
            </p>
            <input
                id="guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => onGuestEmailChange(e.target.value)}
                placeholder="you@example.com"
                required
                aria-describedby={
                    showError
                        ? 'guest-email-hint guest-email-error'
                        : 'guest-email-hint'
                }
                aria-invalid={showError}
                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
            {showError && (
                <p
                    id="guest-email-error"
                    role="alert"
                    className="text-destructive mt-1 text-xs"
                >
                    {t(
                        'checkout.guest_email_required',
                        'Email address is required.',
                    )}
                </p>
            )}
        </div>
    );
}
