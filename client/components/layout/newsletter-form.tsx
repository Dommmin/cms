'use client';

import { useState } from 'react';

import { useTranslation } from '@/hooks/use-translation';
import { api } from '@/lib/axios';

export function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
    >('idle');
    const { t } = useTranslation();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        try {
            await api.post('/newsletter/subscribe', { email });
            setStatus('success');
            setEmail('');
        } catch {
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <p
                role="status"
                aria-live="polite"
                className="text-sm font-medium text-green-600 dark:text-green-400"
            >
                {t(
                    'newsletter.success',
                    'Check your inbox to confirm your subscription!',
                )}
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                    {t('newsletter.email_label', 'Email address')}
                </label>
                <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('newsletter.placeholder', 'Your email')}
                    aria-describedby="newsletter-hint"
                    className="border-input bg-background/80 focus:ring-ring flex-1 rounded-xl border px-4 py-2.5 text-sm backdrop-blur-sm focus:ring-2 focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    aria-busy={status === 'loading'}
                    className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50"
                >
                    {status === 'loading'
                        ? '…'
                        : t('newsletter.subscribe', 'Subscribe')}
                </button>
            </form>
            <p id="newsletter-hint" className="text-muted-foreground text-xs">
                {t(
                    'newsletter.double_optin_info',
                    'You will receive a confirmation email. We respect your privacy — unsubscribe at any time.',
                )}
            </p>
            {status === 'error' && (
                <p role="alert" className="text-destructive text-xs">
                    {t('newsletter.error', 'Something went wrong.')}
                </p>
            )}
        </div>
    );
}
