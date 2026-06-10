import { getSystemPage } from '@/api/cms';
import type { I18nConfig } from '@/lib/i18n';
import { getI18nConfig } from '@/lib/i18n-server';
import { absoluteUrl, localizedBlogPath } from '@/lib/seo';
import { serverFetch } from '@/lib/server-fetch';
import type { BlogPost, PaginatedResponse, Product } from '@/types/api';
import type { MetadataRoute } from 'next';

/** Build sitemap entries for a given path with all locale alternates. */
function sitemapEntry(
    i18nConfig: I18nConfig,
    path: string,
    locale: string,
    lastModified?: Date,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly',
    priority = 0.8,
    localizedAlternates?: Record<string, string>,
): MetadataRoute.Sitemap[number] {
    const alternates: Record<string, string> = {};
    for (const alternateLocale of i18nConfig.locales) {
        alternates[alternateLocale] = absoluteUrl(
            alternateLocale,
            localizedAlternates?.[alternateLocale] ?? path,
            i18nConfig,
        );
    }
    alternates['x-default'] = alternates[i18nConfig.defaultLocale];

    return {
        url: absoluteUrl(locale, path, i18nConfig),
        lastModified: lastModified ?? new Date(),
        changeFrequency,
        priority,
        alternates: { languages: alternates },
    };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    const productListingPath = productListingPage?.path ?? null;
    const faqPath = faqPage?.path ?? '/faq';
    const blogListingPathByLocale = Object.fromEntries(blogListingPages);
    const blogListingPath = blogListingPathByLocale[defaultLocale] ?? '/blog';

    // Static pages
    entries.push(
        sitemapEntry(i18nConfig, '/', defaultLocale, undefined, 'daily', 1.0),
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

    // Products
    try {
        const products = await serverFetch<PaginatedResponse<Product>>(
            '/products?per_page=500',
        );
        for (const product of products.data.filter(
            (p) => !p.sitemap_exclude && !!p.public_url,
        )) {
            const d = product.created_at ? new Date(product.created_at) : null;
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
    } catch {
        // skip if API unavailable during build
    }

    // Blog posts
    try {
        const localeResponses = await Promise.all(
            i18nConfig.locales.map((locale) =>
                serverFetch<PaginatedResponse<BlogPost>>(
                    '/blog/posts?per_page=500',
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
    } catch {
        // skip if API unavailable during build
    }

    return entries;
}
