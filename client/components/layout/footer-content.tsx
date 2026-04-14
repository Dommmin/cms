'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';

import { useTranslation } from '@/hooks/use-translation';
import { openCookiePreferences } from '@/providers/cookie-consent-provider';
import type { FooterContentProps } from './footer-content.types';
import { NewsletterForm } from './newsletter-form';

export function FooterContent({
    mainItems,
    legalItems,
    currentYear,
}: FooterContentProps) {
    const { t } = useTranslation();

    return (
        <footer className="border-border relative overflow-hidden border-t">
            <div className="via-primary/50 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

            <div
                className="from-muted/20 to-muted/50 dark:from-background dark:to-card absolute inset-0 -z-10 bg-gradient-to-b"
                aria-hidden="true"
            />

            <div className="border-border/50 border-b py-12">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <Mail
                        className="text-primary mx-auto mb-3 h-6 w-6"
                        aria-hidden="true"
                    />
                    <h2 className="text-2xl font-bold tracking-tight">
                        {t('footer.newsletter_title', 'Stay in the loop')}
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        {t(
                            'footer.newsletter_desc_full',
                            'New collections, exclusive offers, and design inspiration — straight to your inbox.',
                        )}
                    </p>
                    <div className="mx-auto mt-4 max-w-md">
                        <NewsletterForm />
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div>
                        <Link
                            href="/"
                            className="text-primary text-lg font-bold tracking-tight"
                        >
                            Store
                        </Link>
                        <p className="text-muted-foreground mt-2 text-sm">
                            {t(
                                'footer.tagline',
                                'Curated fashion, home décor and lifestyle essentials — crafted to last.',
                            )}
                        </p>
                    </div>

                    {mainItems.length > 0 && (
                        <div>
                            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
                                {t('footer.quick_links', 'Quick Links')}
                            </h3>
                            <ul className="space-y-2">
                                {mainItems.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            href={item.url ?? '#'}
                                            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
                            {t('footer.support', 'Support')}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {t(
                                'footer.support_text',
                                'Need help? Contact our support team.',
                            )}
                        </p>
                    </div>
                </div>

                <div className="border-border mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
                    <p className="text-muted-foreground text-xs">
                        © {currentYear} Store.{' '}
                        {t('footer.rights', 'All rights reserved.')}
                    </p>
                    <nav
                        aria-label={t('footer.legal_nav', 'Legal links')}
                        className="flex flex-wrap gap-4"
                    >
                        {legalItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.url ?? '#'}
                                className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            onClick={openCookiePreferences}
                            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                        >
                            {t(
                                'footer.cookie_preferences',
                                'Cookie Preferences',
                            )}
                        </button>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
