import { getBlogPost } from '@/api/cms';
import { LOCALES } from '@/lib/i18n';
import { absoluteUrl, localizedBlogPath } from '@/lib/seo';
import type { BlogPost } from '@/types/api';
import type { Metadata } from 'next';

function articleAlternates(
    post: BlogPost,
    locale: string,
): Metadata['alternates'] {
    const languages: Record<string, string> = {};

    for (const availableLocale of LOCALES) {
        if (!post.available_locales.includes(availableLocale)) {
            continue;
        }

        languages[availableLocale] = absoluteUrl(
            availableLocale,
            localizedBlogPath(
                availableLocale,
                post.slug_translations,
                post.canonical_slug,
            ),
        );
    }

    const canonicalPath = localizedBlogPath(
        locale,
        post.slug_translations,
        post.canonical_slug,
    );

    return {
        canonical: post.canonical_url ?? absoluteUrl(locale, canonicalPath),
        languages: {
            ...languages,
            'x-default':
                languages.en ??
                absoluteUrl(
                    'en',
                    localizedBlogPath(
                        'en',
                        post.slug_translations,
                        post.canonical_slug,
                    ),
                ),
        },
    };
}

export async function getBlogPostMetadata(
    slug: string,
    locale: string,
): Promise<Metadata> {
    const post = await getBlogPost(slug, locale);
    const articlePath = localizedBlogPath(
        locale,
        post.slug_translations,
        post.canonical_slug,
    );
    const dynamicOgImage = absoluteUrl(
        locale,
        `${articlePath}/opengraph-image`,
    );

    return {
        title: post.seo_title ?? post.title,
        description: post.seo_description ?? post.excerpt ?? undefined,
        robots: post.meta_robots ?? 'index, follow',
        alternates: articleAlternates(post, locale),
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
