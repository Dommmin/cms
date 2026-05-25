import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import { cookies, headers } from 'next/headers';

import { cache } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AdminBar } from '@/components/admin/admin-bar';
import type { AdminBarProps } from '@/components/admin/admin-bar.types';
import { ChatWidgetLoader } from '@/components/chat/chat-widget-loader';
import { ComparisonBarLoader } from '@/components/comparison-bar-loader';
import { CookieConsent } from '@/components/cookie-consent';
import { JsonLd } from '@/components/json-ld';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Footer } from '@/components/layout/footer';
import { GoogleTagManager } from '@/components/layout/google-tag-manager';
import { Header } from '@/components/layout/header';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { PageTransition } from '@/components/layout/page-transition';
import { ThemeInit } from '@/components/layout/theme-init';
import { BlockAnimationObserver } from '@/components/page-builder/block-animation-observer';
import { PwaServiceWorker } from '@/components/pwa-service-worker';
import { ThemeStyles } from '@/components/theme-styles';
import { getI18nConfig } from '@/lib/i18n-server';
import { buildOrganization, buildWebSite } from '@/lib/schema';
import { serverFetch } from '@/lib/server-fetch';
import { ModulesProvider } from '@/providers/modules-provider';
import { QueryProvider } from '@/providers/query-provider';
import { TranslationProvider } from '@/providers/translation-provider';

import './globals.css';
import type { PublicSettingsResponse } from './layout.types';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
    display: 'swap',
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
    display: 'swap',
});

const playfair = Playfair_Display({
    variable: '--font-playfair',
    subsets: ['latin'],
    display: 'swap',
});

export const viewport: Viewport = {
    themeColor: process.env.NEXT_PUBLIC_PWA_THEME_COLOR ?? '#111827',
};

// Cached per-request: both generateMetadata and RootLayout share one fetch

const getPublicSettings = cache(async () =>
    serverFetch<PublicSettingsResponse>('/settings/public', {
        revalidate: 300,
        tags: ['settings'],
    }).catch(() => null),
);

export async function generateMetadata(): Promise<Metadata> {
    const publicSettings = await getPublicSettings();

    const siteName = publicSettings?.settings.general?.site_name ?? 'Store';
    const siteDescription = publicSettings?.settings.general?.site_description;
    const disableIndexing =
        publicSettings?.settings.seo?.disable_indexing === 'true' ||
        publicSettings?.settings.seo?.disable_indexing === true;

    return {
        applicationName: siteName,
        title: {
            default: siteName,
            template: `%s | ${siteName}`,
        },
        description: siteDescription ?? 'Your online store',
        manifest: '/manifest.webmanifest',
        appleWebApp: {
            capable: true,
            title: siteName,
            statusBarStyle: 'default',
        },
        formatDetection: {
            telephone: false,
        },
        robots: disableIndexing ? { index: false, follow: false } : undefined,
        verification: {
            google:
                publicSettings?.settings.seo?.google_site_verification ??
                undefined,
        },
        other: publicSettings?.settings.seo?.bing_site_verification
            ? {
                  'msvalidate.01':
                      publicSettings.settings.seo.bing_site_verification,
              }
            : undefined,
    };
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [cookieStore, headersList] = await Promise.all([
        cookies(),
        headers(),
    ]);
    const i18nConfig = await getI18nConfig();
    const locale = headersList.get('x-locale') ?? i18nConfig.defaultLocale;
    const adminPreviewRaw = cookieStore.get('admin_preview')?.value;
    const isAdminPreview = !!adminPreviewRaw;
    let adminPreviewEntity: AdminBarProps['entity'] = null;
    if (adminPreviewRaw) {
        try {
            const parsed = JSON.parse(decodeURIComponent(adminPreviewRaw)) as {
                entity?: typeof adminPreviewEntity;
            };
            adminPreviewEntity = parsed.entity ?? null;
        } catch {
            // malformed cookie — ignore
        }
    }

    const publicSettings = await getPublicSettings();
    const modules = publicSettings?.modules;
    const gtmId = publicSettings?.settings.seo?.google_tag_manager ?? null;
    const siteName = publicSettings?.settings.general?.site_name ?? 'Store';
    const siteUrl = publicSettings?.settings.general?.site_url;
    const siteDescription = publicSettings?.settings.general?.site_description;
    const contactEmail = publicSettings?.settings.general?.contact_email;
    const contactPhone = publicSettings?.settings.general?.contact_phone;
    const socialLinks = publicSettings?.settings.social;
    const sameAs = socialLinks
        ? Object.values(socialLinks).filter(Boolean)
        : [];
    const cookieSettings = publicSettings?.settings.cookie ?? {};

    return (
        <html
            lang={locale}
            data-i18n={JSON.stringify(i18nConfig)}
            suppressHydrationWarning
        >
            <head>
                <ThemeStyles theme={publicSettings?.theme ?? null} />
                {process.env.NEXT_PUBLIC_API_URL && (
                    <link
                        rel="preconnect"
                        href={new URL(process.env.NEXT_PUBLIC_API_URL).origin}
                    />
                )}
                {process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY && (
                    <link
                        rel="preconnect"
                        href="https://challenges.cloudflare.com"
                    />
                )}
                <JsonLd
                    data={buildWebSite({
                        name: siteName,
                        url: siteUrl,
                        description: siteDescription,
                    })}
                />
                <JsonLd
                    data={buildOrganization({
                        name: siteName,
                        url: siteUrl,
                        email: contactEmail,
                        phone: contactPhone,
                        sameAs,
                    })}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased${isAdminPreview ? 'pt-10' : ''}`}
            >
                <ThemeInit />
                <a
                    href="#main-content"
                    className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:outline-none"
                >
                    Skip to main content
                </a>
                <QueryProvider>
                    <ModulesProvider modules={modules}>
                        <TranslationProvider initialLocale={locale}>
                            <AdminBar entity={adminPreviewEntity} />
                            <div className="flex min-h-screen flex-col">
                                <AnnouncementBar />
                                <Header modules={modules} siteName={siteName} />
                                <main
                                    id="main-content"
                                    className="flex-1 pb-16 md:pb-0"
                                >
                                    <PageTransition>{children}</PageTransition>
                                </main>
                                <Footer />
                                <MobileBottomNav />
                            </div>
                            <CookieConsent settings={cookieSettings} />
                            <ChatWidgetLoader />
                            <ComparisonBarLoader />
                            <BlockAnimationObserver />
                            <PwaServiceWorker />
                            <ToastContainer
                                position="bottom-right"
                                autoClose={2000}
                            />
                            {gtmId && <GoogleTagManager gtmId={gtmId} />}
                        </TranslationProvider>
                    </ModulesProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
