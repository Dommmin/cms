import { getBlogPosts, getSystemPage } from '@/api/cms';
import { getI18nConfig } from '@/lib/i18n-server';
import { absoluteUrl, localizedBlogPath } from '@/lib/seo';
import type { BlogPost } from '@/types/api';
import type { I18nConfig } from './i18n';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Store';

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function itemXml(
    post: BlogPost,
    locale: string,
    i18nConfig: I18nConfig,
): string {
    const url = absoluteUrl(
        locale,
        post.public_url ??
            localizedBlogPath(
                locale,
                post.slug_translations,
                post.canonical_slug,
            ),
        i18nConfig,
    );

    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      ${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ''}
      ${post.published_at ? `<pubDate>${new Date(post.published_at).toUTCString()}</pubDate>` : ''}
      ${post.author?.name ? `<dc:creator>${escapeXml(post.author.name)}</dc:creator>` : ''}
    </item>`;
}

export async function blogRss(locale: string): Promise<Response> {
    const i18nConfig = await getI18nConfig();
    let posts: BlogPost[] = [];

    try {
        const response = await getBlogPosts({ per_page: 50, locale });
        posts = response.data.filter((post) => !post.sitemap_exclude);
    } catch {
        posts = [];
    }

    const blogPage = await getSystemPage('blog_listing', locale).catch(
        () => null,
    );
    const blogPath = blogPage?.path ?? '/blog';
    const feedUrl = absoluteUrl(locale, `${blogPath}/rss.xml`, i18nConfig);
    const blogUrl = absoluteUrl(locale, blogPath, i18nConfig);
    const language = locale === 'pl' ? 'pl-PL' : 'en';
    const description =
        locale === 'pl'
            ? `Najnowsze artykuły z bloga ${STORE_NAME}`
            : `Latest articles from the ${STORE_NAME} blog`;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${STORE_NAME} Blog`)}</title>
    <link>${escapeXml(blogUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>${language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
    ${posts.map((post) => itemXml(post, locale, i18nConfig)).join('\n')}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
    });
}
