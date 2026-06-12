import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

import { getPage } from '@/api/cms';
import { getPublicSettings } from '@/api/settings';
import { PageRenderer } from '@/components/page-builder/page-renderer';
import { RecentlyViewed } from '@/components/recently-viewed';
import { getDefaultLocale, getI18nConfig } from '@/lib/i18n-server';
import { generateAlternates } from '@/lib/seo';
import type { PageData } from './page.types';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const i18nConfig = await getI18nConfig();
        const page = await getPage('home', i18nConfig.defaultLocale);

        const alternates = generateAlternates(
            '/',
            i18nConfig.defaultLocale,
            i18nConfig,
        );
        if (page.seo_canonical && alternates) {
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

export default async function HomePage() {
    const locale = await getDefaultLocale();
    const page = await getPage('home', locale).catch(() => null);
    return <HomeContent page={page} locale={locale} />;
}

function HomeContent({
    page,
    locale,
}: {
    page: PageData | null;
    locale: string;
}) {
    if (!page || !page.is_published) {
        notFound();
    }

    return (
        <>
            <PageRenderer page={page} locale={locale} />
            <div className="store-shell mx-auto w-full px-4 pb-12 sm:px-6 lg:px-8">
                <RecentlyViewed />
            </div>
        </>
    );
}
