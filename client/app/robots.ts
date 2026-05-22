import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:8000';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/account/',
                    '/checkout/',
                    '/admin/',
                    '/preview/',
                    '/api/cms/revalidate',
                    '/*?preview=*',
                    '/*?preview_token=*',
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
