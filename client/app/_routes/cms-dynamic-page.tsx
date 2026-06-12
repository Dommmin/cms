import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { getPage } from '@/api/cms';
import { getPublicSettings } from '@/api/settings';
import { JsonLd } from '@/components/json-ld';
import { PageRenderer } from '@/components/page-builder/page-renderer';
import { localePath, type I18nConfig, type Locale } from '@/lib/i18n';
import { getI18nConfig } from '@/lib/i18n-server';
import { buildFaqPage, buildWebPage } from '@/lib/schema';
import { absoluteUrl, generateAlternates } from '@/lib/seo';

import type { PageData } from './cms-dynamic-page.types';

async function resolveModuleDetail(
    locale: string,
    slug: string[],
): Promise<ReactNode> {
    if (slug.length === 0) {
        return null;
    }

    const parentPath = slug.slice(0, -1).join('/');
    if (parentPath === '') {
        return null;
    }

    const parentPage = await getPage(parentPath, locale).catch(() => null);
    if (!parentPage) {
        return null;
    }

    const entitySlug = slug[slug.length - 1];

    switch (parentPage.module_name) {
        case 'blog': {
            const { BlogPostPage } =
                await import('@/app/_routes/blog-post-page');
            return (
                <BlogPostPage
                    slug={entitySlug}
                    locale={locale as Locale}
                    basePath={parentPage.path}
                />
            );
        }
        case 'product_listing': {
            const { ProductPage } =
                await import('@/app/_routes/product-detail-page');
            return (
                <ProductPage
                    slug={entitySlug}
                    locale={locale}
                    basePath={parentPage.path}
                />
            );
        }
        case 'category_listing': {
            const { CategoryDetailPage } =
                await import('@/app/_routes/category-detail-page');
            return (
                <CategoryDetailPage
                    slug={entitySlug}
                    basePath={parentPage.path}
                />
            );
        }
        case 'brand_listing': {
            const { BrandDetailPage } =
                await import('@/app/_routes/brand-detail-page');
            return (
                <BrandDetailPage slug={entitySlug} basePath={parentPage.path} />
            );
        }
        default:
            return null;
    }
}

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
        const i18nConfig = await getI18nConfig();
        const cookieStore = await cookies();
        const previewToken = cookieStore.get('page_preview_token')?.value;
        const page = await getPage(
            resolved.slug.join('/'),
            resolved.locale,
            previewToken,
        ).catch(() => null);

        if (!page) {
            const parentPath = resolved.slug.slice(0, -1).join('/');
            const parentPage =
                parentPath !== ''
                    ? await getPage(parentPath, resolved.locale).catch(
                          () => null,
                      )
                    : null;

            const entitySlug = resolved.slug[resolved.slug.length - 1];

            switch (parentPage?.module_name) {
                case 'blog': {
                    const { getBlogPostMetadata } =
                        await import('@/app/blog/_blog-metadata');
                    return getBlogPostMetadata(entitySlug, resolved.locale);
                }
                case 'product_listing': {
                    const { generateProductMetadata } =
                        await import('@/app/_routes/product-detail-page');
                    return generateProductMetadata({
                        slug: entitySlug,
                        locale: resolved.locale,
                        basePath: parentPage.path,
                    });
                }
                case 'category_listing': {
                    const { generateCategoryMetadata } =
                        await import('@/app/_routes/category-detail-page');
                    return generateCategoryMetadata({
                        slug: entitySlug,
                        locale: resolved.locale,
                    });
                }
                case 'brand_listing': {
                    const { generateBrandMetadata } =
                        await import('@/app/_routes/brand-detail-page');
                    return generateBrandMetadata({
                        slug: entitySlug,
                        locale: resolved.locale,
                    });
                }
                default:
                    return {};
            }
        }

        const alternates = generateAlternates(
            page.path,
            resolved.locale,
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
        const detail = await resolveModuleDetail(
            resolved.locale,
            resolved.slug,
        );
        if (detail) {
            return detail;
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

    // Redirect to the canonical localized URL if the path segment slug matches in another language
    // e.g. /pl/categories -> /pl/kategorie
    if (!isPreview) {
        const canonicalPath = localePath(locale, page.path, i18nConfig);
        const currentPath = localePath(locale, slug.join('/'), i18nConfig);
        if (canonicalPath !== currentPath) {
            redirect(canonicalPath);
        }
    }

    const path = page.path;

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
