'use client';

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
        <footer className="border-border bg-muted/30 border-t">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Brand */}
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

                    {/* Main links */}
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

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
                            {t('footer.newsletter', 'Newsletter')}
                        </h3>
                        <p className="text-muted-foreground mb-3 text-sm">
                            {t(
                                'footer.newsletter_desc',
                                'Get exclusive offers and style inspiration.',
                            )}
                        </p>
                        <NewsletterForm />
                    </div>
                </div>

                {/* Bottom row */}
                <div className="border-border mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
                    <p className="text-muted-foreground text-xs">
                        © {currentYear} Store.{' '}
                        {t('footer.rights', 'All rights reserved.')}
                    </p>
                    <nav className="flex flex-wrap gap-4">
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
