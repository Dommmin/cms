import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

import { getPage } from '@/api/cms';
import { PageRenderer } from '@/components/page-builder/page-renderer';
import { RecentlyViewed } from '@/components/recently-viewed';
import { getDefaultLocale, getI18nConfig } from '@/lib/i18n-server';
import { generateAlternates } from '@/lib/seo';
import type { PageData } from './page.types';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const i18nConfig = await getI18nConfig();
        const page = await getPage('home', i18nConfig.defaultLocale);
        return {
            title: page.seo_title ?? page.title,
            description: page.seo_description ?? undefined,
            alternates: generateAlternates(
                '/',
                i18nConfig.defaultLocale,
                i18nConfig,
            ),
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
