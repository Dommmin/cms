import { getBlogPost } from '@/api/cms';

export async function getBlogPostMetadata(slug: string, locale: string) {
    const post = await getBlogPost(slug, locale);
    return {
        title: post.seo_title ?? post.title,
        description: post.seo_description ?? post.excerpt ?? undefined,
        robots: post.meta_robots ?? 'index, follow',
        openGraph: {
            title: post.seo_title ?? post.title,
            description: post.seo_description ?? post.excerpt ?? undefined,
            images: post.og_image
                ? [post.og_image]
                : post.featured_image
                  ? [post.featured_image]
                  : [],
            type: 'article' as const,
        },
        twitter: { card: 'summary_large_image' as const },
    };
}
