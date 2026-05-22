import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { getPage } from '@/api/cms';
import { JsonLd } from '@/components/json-ld';
import { PageRenderer } from '@/components/page-builder/page-renderer';
import type { I18nConfig } from '@/lib/i18n';
import { getI18nConfig } from '@/lib/i18n-server';
import { buildFaqPage, buildWebPage } from '@/lib/schema';
import { absoluteUrl } from '@/lib/seo';

import type { PageData } from './cms-dynamic-page.types';

export async function resolveDynamicPageParams({
    locale,
    slug,
}: {
    locale?: string;
    slug: string[];
}): Promise<{ locale: string; slug: string[] }> {
    const i18nConfig = await getI18nConfig();

    if (locale && i18nConfig.locales.includes(locale)) {
        return { locale, slug };
    }

    return {
        locale: i18nConfig.defaultLocale,
        slug: locale ? [locale, ...slug] : slug,
    };
}

export async function generateDynamicPageMetadata({
    locale,
    slug,
}: {
    locale?: string;
    slug: string[];
}): Promise<Metadata> {
    try {
        const resolved = await resolveDynamicPageParams({ locale, slug });
        const cookieStore = await cookies();
        const previewToken = cookieStore.get('page_preview_token')?.value;
        const page = await getPage(
            resolved.slug.join('/'),
            resolved.locale,
            previewToken,
        );

        return {
            title: page.seo_title ?? page.title,
            description: page.seo_description ?? undefined,
            robots: page.meta_robots ?? 'index, follow',
            alternates: page.seo_canonical
                ? { canonical: page.seo_canonical }
                : undefined,
            openGraph: {
                title: page.seo_title ?? page.title,
                description: page.seo_description ?? undefined,
                images: page.og_image ? [page.og_image] : [],
            },
            twitter: { card: 'summary_large_image' },
        };
    } catch {
        return {};
    }
}

export async function CmsDynamicPage({
    locale,
    slug,
}: {
    locale?: string;
    slug: string[];
}) {
    const resolved = await resolveDynamicPageParams({ locale, slug });
    const i18nConfig = await getI18nConfig();
    const cookieStore = await cookies();
    const previewToken = cookieStore.get('page_preview_token')?.value;
    const page = await getPage(
        resolved.slug.join('/'),
        resolved.locale,
        previewToken,
    ).catch(() => null);

    return (
        <PageContent
            page={page}
            slug={resolved.slug}
            locale={resolved.locale}
            isPreview={!!previewToken}
            i18nConfig={i18nConfig}
        />
    );
}

function PageContent({
    page,
    slug,
    locale,
    isPreview,
    i18nConfig,
}: {
    page: PageData | null;
    slug: string[];
    locale: string;
    isPreview: boolean;
    i18nConfig: I18nConfig;
}) {
    if (!page || (!page.is_published && !isPreview)) {
        notFound();
    }

    const path = `/${slug.join('/')}`;

    const schemaData =
        page.module_name === 'faq' &&
        Array.isArray(
            (page.module_config as { items?: unknown[] } | null)?.items,
        )
            ? buildFaqPage(
                  (
                      page.module_config as {
                          items: { question: string; answer: string }[];
                      }
                  ).items,
              )
            : buildWebPage({
                  title: page.seo_title ?? page.title,
                  description: page.seo_description,
                  url: absoluteUrl(locale, path, i18nConfig),
              });

    return (
        <>
            <JsonLd data={schemaData} />
            <PageRenderer page={page} />
        </>
    );
}
