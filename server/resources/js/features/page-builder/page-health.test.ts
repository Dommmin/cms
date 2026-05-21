import { describe, expect, it } from 'vitest';
import { analyzePageHealth } from './page-health';
import type { Section } from './types';

function makeSection(blocks: Section['blocks']): Section {
    return {
        client_id: 'section-1',
        section_type: 'content',
        layout: 'default',
        variant: null,
        settings: null,
        position: 0,
        is_active: true,
        blocks,
    };
}

describe('analyzePageHealth', () => {
    it('warns when the page is missing a primary H1', () => {
        const result = analyzePageHealth({
            sections: [
                makeSection([
                    {
                        client_id: 'block-1',
                        type: 'rich_text',
                        configuration: { content: '<p>Body copy</p>' },
                        position: 0,
                        is_active: true,
                    },
                ]),
            ],
        });

        expect(result.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: 'missing-h1' }),
            ]),
        );
    });

    it('counts hero titles and rich text H1 tags', () => {
        const result = analyzePageHealth({
            sections: [
                makeSection([
                    {
                        client_id: 'hero',
                        type: 'hero_banner',
                        configuration: { title: 'Welcome' },
                        position: 0,
                        is_active: true,
                    },
                    {
                        client_id: 'rich',
                        type: 'rich_text',
                        configuration: {
                            content: '<h1>Another heading</h1>',
                        },
                        position: 1,
                        is_active: true,
                    },
                ]),
            ],
        });

        expect(result.summary.h1Count).toBe(2);
        expect(result.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: 'multiple-h1' }),
            ]),
        );
    });

    it('reports CTA labels without URLs and URLs without labels', () => {
        const result = analyzePageHealth({
            sections: [
                makeSection([
                    {
                        client_id: 'cta',
                        type: 'call_to_action',
                        configuration: {
                            title: 'Ready?',
                            primary_label: 'Start',
                            secondary_url: '/learn',
                        },
                        position: 0,
                        is_active: true,
                    },
                ]),
            ],
        });

        expect(result.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    title: 'CTA link is missing',
                }),
                expect.objectContaining({
                    title: 'CTA has no visible label',
                }),
            ]),
        );
    });

    it('reports HTML anchors without href and images without alt metadata', () => {
        const result = analyzePageHealth({
            sections: [
                makeSection([
                    {
                        client_id: 'mixed',
                        type: 'rich_text',
                        configuration: {
                            content: '<h1>Title</h1><p><a>Broken link</a></p>',
                        },
                        position: 0,
                        is_active: true,
                        relations: [
                            {
                                relation_type: 'media.image',
                                relation_id: 12,
                                relation_key: 'gallery',
                                position: 0,
                                metadata: { url: '/image.jpg', alt: '' },
                            },
                        ],
                    },
                ]),
            ],
        });

        expect(result.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: 'Link without href' }),
                expect.objectContaining({
                    title: 'Image is missing alt text',
                }),
            ]),
        );
    });
});
