import { getBlogPost } from '@/api/cms';
import { getI18nConfig } from '@/lib/i18n-server';
import { absoluteUrl, localizedBlogPath } from '@/lib/seo';
import type { BlogPost } from '@/types/api';
import type { Metadata } from 'next';

async function articleAlternates(
    post: BlogPost,
    locale: string,
): Promise<Metadata['alternates']> {
    const i18nConfig = await getI18nConfig();
    const languages: Record<string, string> = {};
    const basePath = post.public_url
        ? post.public_url.slice(
              0,
              Math.max(post.public_url.lastIndexOf('/'), 0),
          )
        : '/blog';

    for (const availableLocale of i18nConfig.locales) {
        if (!post.available_locales.includes(availableLocale)) {
            continue;
        }

        languages[availableLocale] = absoluteUrl(
            availableLocale,
            localizedBlogPath(
                availableLocale,
                post.slug_translations,
                post.canonical_slug,
                basePath,
            ),
            i18nConfig,
        );
    }

    const canonicalPath = localizedBlogPath(
        locale,
        post.slug_translations,
        post.canonical_slug,
        basePath,
    );

    return {
        canonical:
            post.canonical_url ??
            absoluteUrl(locale, canonicalPath, i18nConfig),
        languages: {
            ...languages,
            'x-default':
                languages[i18nConfig.defaultLocale] ??
                absoluteUrl(
                    i18nConfig.defaultLocale,
                    localizedBlogPath(
                        i18nConfig.defaultLocale,
                        post.slug_translations,
                        post.canonical_slug,
                        basePath,
                    ),
                    i18nConfig,
                ),
        },
    };
}

export async function getBlogPostMetadata(
    slug: string,
    locale: string,
): Promise<Metadata> {
    const post = await getBlogPost(slug, locale);
    const i18nConfig = await getI18nConfig();
    const articlePath = localizedBlogPath(
        locale,
        post.slug_translations,
        post.canonical_slug,
        post.public_url
            ? post.public_url.slice(
                  0,
                  Math.max(post.public_url.lastIndexOf('/'), 0),
              )
            : '/blog',
    );
    const dynamicOgImage = absoluteUrl(
        locale,
        `${articlePath}/opengraph-image`,
        i18nConfig,
    );

    return {
        title: post.seo_title ?? post.title,
        description: post.seo_description ?? post.excerpt ?? undefined,
        robots: post.meta_robots ?? 'index, follow',
        alternates: await articleAlternates(post, locale),
        openGraph: {
            title: post.seo_title ?? post.title,
            description: post.seo_description ?? post.excerpt ?? undefined,
            url:
                post.canonical_url ??
                absoluteUrl(
                    locale,
                    localizedBlogPath(
                        locale,
                        post.slug_translations,
                        post.canonical_slug,
                    ),
                    i18nConfig,
                ),
            locale,
            alternateLocale: post.available_locales.filter((l) => l !== locale),
            images: post.og_image
                ? [post.og_image]
                : post.featured_image
                  ? [post.featured_image]
                  : [dynamicOgImage],
            type: 'article' as const,
            publishedTime: post.published_at ?? undefined,
            modifiedTime: post.updated_at,
            authors: post.author?.name ? [post.author.name] : undefined,
        },
        twitter: {
            card: 'summary_large_image' as const,
            title: post.seo_title ?? post.title,
            description: post.seo_description ?? post.excerpt ?? undefined,
            images: post.og_image
                ? [post.og_image]
                : post.featured_image
                  ? [post.featured_image]
                  : [dynamicOgImage],
        },
    };
}
