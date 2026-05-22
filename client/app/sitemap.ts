import { LOCALES } from '@/lib/i18n';
import { absoluteUrl, localizedBlogPath } from '@/lib/seo';
import { serverFetch } from '@/lib/server-fetch';
import type { BlogPost, PaginatedResponse, Product } from '@/types/api';
import type { MetadataRoute } from 'next';

/** Build sitemap entries for a given path with all locale alternates. */
function sitemapEntry(
    path: string,
    locale: string,
    lastModified?: Date,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly',
    priority = 0.8,
    localizedAlternates?: Record<string, string>,
): MetadataRoute.Sitemap[number] {
    const alternates: Record<string, string> = {};
    for (const alternateLocale of LOCALES) {
        alternates[alternateLocale] = absoluteUrl(
            alternateLocale,
            localizedAlternates?.[alternateLocale] ?? path,
        );
    }
    alternates['x-default'] = alternates.en;

    return {
        url: absoluteUrl(locale, path),
        lastModified: lastModified ?? new Date(),
        changeFrequency,
        priority,
        alternates: { languages: alternates },
    };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = [];

    // Static pages
    entries.push(sitemapEntry('/', 'pl', undefined, 'daily', 1.0));
    entries.push(sitemapEntry('/products', 'pl', undefined, 'daily', 0.9));
    entries.push(sitemapEntry('/blog', 'pl', undefined, 'daily', 0.8));
    entries.push(sitemapEntry('/faq', 'pl', undefined, 'monthly', 0.5));

    // Products
    try {
        const products = await serverFetch<PaginatedResponse<Product>>(
            '/products?per_page=500',
        );
        for (const product of products.data.filter((p) => !p.sitemap_exclude)) {
            const d = product.created_at ? new Date(product.created_at) : null;
            entries.push(
                sitemapEntry(
                    `/products/${product.slug}`,
                    'pl',
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
            LOCALES.map((locale) =>
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
            for (const locale of LOCALES) {
                if (!post.available_locales.includes(locale)) {
                    continue;
                }

                entries.push(
                    sitemapEntry(
                        localizedBlogPath(
                            locale,
                            post.slug_translations,
                            post.canonical_slug,
                        ),
                        locale,
                        post.updated_at
                            ? new Date(post.updated_at)
                            : new Date(),
                        'monthly',
                        0.7,
                        Object.fromEntries(
                            LOCALES.map((availableLocale) => [
                                availableLocale,
                                localizedBlogPath(
                                    availableLocale,
                                    post.slug_translations,
                                    post.canonical_slug,
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
