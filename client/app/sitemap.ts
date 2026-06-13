import { getSystemPage } from '@/api/cms';
import type { I18nConfig } from '@/lib/i18n';
import { getI18nConfig } from '@/lib/i18n-server';
import { absoluteUrl, localizedBlogPath } from '@/lib/seo';
import { serverFetch } from '@/lib/server-fetch';
import type { BlogPost, PaginatedResponse, Product } from '@/types/api';
import type { MetadataRoute } from 'next';

/** Build sitemap entries for a given path with all locale alternates. */
function normalizePath(
    path: string | null | undefined,
    fallback: string | null = '/',
): string | null {
    return typeof path === 'string' && path.length > 0 ? path : fallback;
}

function sitemapEntry(
    i18nConfig: I18nConfig,
    path: string | null | undefined,
    locale: string,
    lastModified?: Date,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly',
    priority = 0.8,
    localizedAlternates?: Record<string, string>,
): MetadataRoute.Sitemap[number] {
    const normalizedPath = normalizePath(path) ?? '/';
    const alternates: Record<string, string> = {};
    for (const alternateLocale of i18nConfig.locales) {
        const alternatePath =
            normalizePath(
                localizedAlternates?.[alternateLocale],
                normalizedPath,
            ) ?? normalizedPath;
        alternates[alternateLocale] = absoluteUrl(
            alternateLocale,
            alternatePath,
            i18nConfig,
        );
    }
    alternates['x-default'] = alternates[i18nConfig.defaultLocale];

    return {
        url: absoluteUrl(locale, normalizedPath, i18nConfig),
        lastModified: lastModified ?? new Date(),
        changeFrequency,
        priority,
        alternates: { languages: alternates },
    };
}

export async function generateSitemaps() {
    const sitemaps = [{ id: 'static' }];

    try {
        const products = await serverFetch<PaginatedResponse<Product>>(
            '/products?per_page=500',
        );
        const totalProductPages = products.meta?.last_page ?? 1;
        for (let i = 1; i <= totalProductPages; i++) {
            sitemaps.push({ id: `products-${i}` });
        }
    } catch {}

    try {
        const blogs = await serverFetch<PaginatedResponse<BlogPost>>(
            '/blog/posts?per_page=500',
        );
        const totalBlogPages = blogs.meta?.last_page ?? 1;
        for (let i = 1; i <= totalBlogPages; i++) {
            sitemaps.push({ id: `blogs-${i}` });
        }
    } catch {}

    return sitemaps;
}

export default async function sitemap(
    props:
        | { id: string | Promise<string | undefined> }
        | Promise<{ id: string | Promise<string | undefined> }>,
): Promise<MetadataRoute.Sitemap> {
    const resolvedProps = await props;
    const id =
        typeof resolvedProps.id === 'string'
            ? resolvedProps.id
            : await resolvedProps.id;

    if (!id) {
        return [];
    }

    const i18nConfig = await getI18nConfig();
    const defaultLocale = i18nConfig.defaultLocale;
    const entries: MetadataRoute.Sitemap = [];

    const [productListingPage, faqPage, blogListingPages] = await Promise.all([
        getSystemPage('product_listing', defaultLocale).catch(() => null),
        getSystemPage('faq_page', defaultLocale).catch(() => null),
        Promise.all(
            i18nConfig.locales.map(async (locale) => [
                locale,
                (await getSystemPage('blog_listing', locale).catch(() => null))
                    ?.path ?? '/blog',
            ]),
        ),
    ]);
    const productListingPath = normalizePath(productListingPage?.path, null);
    const faqPath = normalizePath(faqPage?.path, '/faq');
    const blogListingPathByLocale = Object.fromEntries(
        blogListingPages.map(([locale, path]) => [
            locale,
            normalizePath(path, '/blog'),
        ]),
    );
    const blogListingPath = normalizePath(
        blogListingPathByLocale[defaultLocale],
        '/blog',
    );

    if (id === 'static') {
        // Static pages
        entries.push(
            sitemapEntry(
                i18nConfig,
                '/',
                defaultLocale,
                undefined,
                'daily',
                1.0,
            ),
        );
        if (productListingPath) {
            entries.push(
                sitemapEntry(
                    i18nConfig,
                    productListingPath,
                    defaultLocale,
                    undefined,
                    'daily',
                    0.9,
                ),
            );
        }
        entries.push(
            sitemapEntry(
                i18nConfig,
                blogListingPath,
                defaultLocale,
                undefined,
                'daily',
                0.8,
            ),
        );
        entries.push(
            sitemapEntry(
                i18nConfig,
                faqPath,
                defaultLocale,
                undefined,
                'monthly',
                0.5,
            ),
        );
    }

    if (id.startsWith('products-')) {
        const page = parseInt(id.replace('products-', ''), 10);
        try {
            const products = await serverFetch<PaginatedResponse<Product>>(
                `/products?per_page=500&page=${page}`,
            );
            for (const product of products.data.filter(
                (p) => !p.sitemap_exclude && !!p.public_url,
            )) {
                const d = product.created_at
                    ? new Date(product.created_at)
                    : null;
                entries.push(
                    sitemapEntry(
                        i18nConfig,
                        product.public_url!,
                        defaultLocale,
                        d && !isNaN(d.getTime()) ? d : new Date(),
                        'weekly',
                        0.8,
                    ),
                );
            }
        } catch {}
    }

    if (id.startsWith('blogs-')) {
        const page = parseInt(id.replace('blogs-', ''), 10);
        try {
            const localeResponses = await Promise.all(
                i18nConfig.locales.map((locale) =>
                    serverFetch<PaginatedResponse<BlogPost>>(
                        `/blog/posts?per_page=500&page=${page}`,
                        { locale },
                    ),
                ),
            );
            const posts = new Map<number, BlogPost>();
            for (const response of localeResponses) {
                for (const post of response.data) {
                    posts.set(post.id, post);
                }
            }

            for (const post of [...posts.values()].filter(
                (p) => !p.sitemap_exclude,
            )) {
                for (const locale of i18nConfig.locales) {
                    if (!post.available_locales.includes(locale)) {
                        continue;
                    }

                    entries.push(
                        sitemapEntry(
                            i18nConfig,
                            post.public_url ??
                                localizedBlogPath(
                                    locale,
                                    post.slug_translations,
                                    post.canonical_slug,
                                    blogListingPathByLocale[locale] ??
                                        blogListingPath,
                                ),
                            locale,
                            post.updated_at
                                ? new Date(post.updated_at)
                                : new Date(),
                            'monthly',
                            0.7,
                            Object.fromEntries(
                                i18nConfig.locales.map((availableLocale) => [
                                    availableLocale,
                                    post.public_url ??
                                        localizedBlogPath(
                                            availableLocale,
                                            post.slug_translations,
                                            post.canonical_slug,
                                            blogListingPathByLocale[
                                                availableLocale
                                            ] ?? blogListingPath,
                                        ),
                                ]),
                            ),
                        ),
                    );
                }
            }
        } catch {}
    }

    return entries;
}
