import { ImageResponse } from 'next/og';

import { getBlogPost } from '@/api/cms';
import type { Locale } from '@/lib/i18n';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export async function BlogPostOpenGraphImage({
    slug,
    locale,
}: {
    slug: string;
    locale: Locale;
}) {
    const post = await getBlogPost(slug, locale);

    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                background: '#111827',
                color: 'white',
                padding: 72,
            }}
        >
            <div style={{ fontSize: 30, color: '#93c5fd' }}>Blog</div>
            <div
                style={{
                    marginTop: 24,
                    fontSize: 72,
                    fontWeight: 700,
                    lineHeight: 1.05,
                }}
            >
                {post.seo_title ?? post.title}
            </div>
            {post.excerpt && (
                <div
                    style={{
                        marginTop: 28,
                        fontSize: 32,
                        color: '#d1d5db',
                        lineHeight: 1.25,
                    }}
                >
                    {post.excerpt}
                </div>
            )}
        </div>,
        size,
    );
}
