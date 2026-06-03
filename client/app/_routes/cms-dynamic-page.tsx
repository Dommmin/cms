import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { getBlogPost, getPage } from '@/api/cms';
import { JsonLd } from '@/components/json-ld';
import { PageRenderer } from '@/components/page-builder/page-renderer';
import type { I18nConfig, Locale } from '@/lib/i18n';
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
    searchParams,
}: {
    locale?: string;
    slug: string[];
    searchParams?: { [key: string]: string | string[] | undefined };
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

    if (!page && resolved.slug.length > 0) {
        // Try falling back to blog post if it's a sub-page
        const postSlug = resolved.slug[resolved.slug.length - 1];
        try {
            const post = await getBlogPost(postSlug, resolved.locale);
            if (post) {
                // If it's a blog post, render the blog post page.
                const basePath = `/${resolved.slug.slice(0, -1).join('/')}`;
                // We'll pass basePath down to BlogPostPage later.
                const { BlogPostPage } =
                    await import('@/app/_routes/blog-post-page');
                return (
                    <BlogPostPage
                        slug={postSlug}
                        locale={resolved.locale as Locale}
                        basePath={basePath}
                    />
                );
            }
        } catch {
            // Not a blog post either, continue to 404 in PageContent
        }
    }

    return (
        <PageContent
            page={page}
            slug={resolved.slug}
            locale={resolved.locale}
            isPreview={!!previewToken}
            i18nConfig={i18nConfig}
            searchParams={searchParams}
        />
    );
}

function PageContent({
    page,
    slug,
    locale,
    isPreview,
    i18nConfig,
    searchParams,
}: {
    page: PageData | null;
    slug: string[];
    locale: string;
    isPreview: boolean;
    i18nConfig: I18nConfig;
    searchParams?: { [key: string]: string | string[] | undefined };
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
            <PageRenderer
                page={page}
                searchParams={searchParams}
                locale={locale}
            />
        </>
    );
}
