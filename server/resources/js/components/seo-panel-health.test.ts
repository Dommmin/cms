import { describe, expect, it } from 'vitest';

import { analyzeSeoHealth } from './seo-panel-health';

describe('analyzeSeoHealth', () => {
    it('reports common publishing warnings', () => {
        const issues = analyzeSeoHealth(
            {
                seo_title: '',
                seo_description: '',
                og_image: null,
                canonical_url: undefined,
                sitemap_exclude: false,
                meta_robots: 'noindex, follow',
            },
            {
                displayTitle: '',
                displayDescription: 'No description provided.',
                showCanonical: true,
                contentLength: 120,
                urlPath: '/blog/Preview Check',
            },
        );

        expect(issues.map((issue) => issue.id)).toEqual(
            expect.arrayContaining([
                'missing-title',
                'missing-description',
                'missing-og-image',
                'missing-canonical',
                'noindex',
                'thin-content',
                'slug-spaces',
            ]),
        );
    });

    it('stays quiet for clean metadata', () => {
        const issues = analyzeSeoHealth(
            {
                seo_title: 'Strong SEO Title',
                seo_description: 'A concise, relevant meta description.',
                og_image: 'https://example.com/og.png',
                canonical_url: 'https://example.com/blog/strong-seo-title',
                sitemap_exclude: false,
                meta_robots: 'index, follow',
            },
            {
                displayTitle: 'Strong SEO Title',
                displayDescription: 'A concise, relevant meta description.',
                showCanonical: true,
                contentLength: 700,
                urlPath: '/blog/strong-seo-title',
            },
        );

        expect(issues).toEqual([]);
    });
});
