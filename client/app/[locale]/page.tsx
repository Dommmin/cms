import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPage } from '@/api/cms';
import { getPublicSettings } from '@/api/settings';
import { PageRenderer } from '@/components/page-builder/page-renderer';
import { RecentlyViewed } from '@/components/recently-viewed';
import { getI18nConfig } from '@/lib/i18n-server';
import { generateAlternates } from '@/lib/seo';
import type { PageProps } from './page.types';

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    try {
        const [{ locale }, i18nConfig] = await Promise.all([
            params,
            getI18nConfig(),
        ]);
        const isLocaleSegment = i18nConfig.locales.includes(locale);
        const slug = isLocaleSegment ? 'home' : locale;
        const fetchLocale = isLocaleSegment ? locale : i18nConfig.defaultLocale;
        const page = await getPage(slug, fetchLocale);

        const alternates = isLocaleSegment
            ? generateAlternates('/', fetchLocale, i18nConfig)
            : generateAlternates(page.path, fetchLocale, i18nConfig);
        if (page.seo_canonical) {
            alternates.canonical = page.seo_canonical;
        }

        const publicSettings = await getPublicSettings().catch(() => null);
        const defaultOgImage = publicSettings?.settings.seo?.og_image;
        const ogImage = page.og_image ?? defaultOgImage ?? null;

        return {
            title: page.seo_title ?? page.title,
            description: page.seo_description ?? undefined,
            robots: page.meta_robots ?? 'index, follow',
            alternates,
            openGraph: {
                title: page.seo_title ?? page.title,
                description: page.seo_description ?? undefined,
                images: ogImage ? [ogImage] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: page.seo_title ?? page.title,
                description: page.seo_description ?? undefined,
                images: ogImage ? [ogImage] : [],
            },
        };
    } catch {
        return {};
    }
}

export default async function HomePage({ params }: PageProps) {
    const [{ locale }, i18nConfig] = await Promise.all([
        params,
        getI18nConfig(),
    ]);

    if (!i18nConfig.locales.includes(locale)) {
        // This segment is actually a default-locale page slug (e.g. /contact intercepted here)
        const page = await getPage(locale, i18nConfig.defaultLocale).catch(
            () => null,
        );
        if (!page || !page.is_published) notFound();
        return <PageRenderer page={page} locale={i18nConfig.defaultLocale} />;
    }

    const page = await getPage('home', locale).catch(() => null);
    if (!page || !page.is_published) notFound();

    return (
        <>
            <PageRenderer page={page} locale={locale} />
            <div className="store-shell mx-auto w-full px-4 pb-12 sm:px-6 lg:px-8">
                <RecentlyViewed />
            </div>
        </>
    );
}
