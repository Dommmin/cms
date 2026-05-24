import { describe, expect, it } from 'vitest';
import { analyzeContentHealth, collectInternalLinkUrls } from './content-health';

describe('analyzeContentHealth', () => {
    it('warns about missing image alt text', () => {
        const warnings = analyzeContentHealth({
            root: {
                type: 'root',
                children: [{ type: 'image', altText: '', decorative: false }],
            },
        });

        expect(warnings).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'image-alt-missing' })]));
    });

    it('warns about unsafe link metadata', () => {
        const warnings = analyzeContentHealth({
            root: {
                type: 'root',
                children: [
                    { type: 'link', url: '', children: [] },
                    { type: 'link', url: 'https://example.com', target: '_blank', rel: null, children: [] },
                ],
            },
        });

        expect(warnings.map((warning) => warning.id)).toEqual(expect.arrayContaining(['link-empty', 'link-rel-missing']));
    });

    it('collects and warns about broken internal links', () => {
        const editorJson = {
            root: {
                type: 'root',
                children: [
                    { type: 'link', url: '/en/products/missing', children: [] },
                    { type: 'link', url: '/en/products/missing', children: [] },
                    { type: 'link', url: 'https://example.com', children: [] },
                ],
            },
        };

        expect(collectInternalLinkUrls(editorJson)).toEqual(['/en/products/missing']);

        const warnings = analyzeContentHealth(editorJson, new Set(['/en/products/missing']));

        expect(warnings.map((warning) => warning.id)).toContain('link-internal-broken');
    });

    it('warns about heading jumps and multiple H1 headings', () => {
        const warnings = analyzeContentHealth({
            root: {
                type: 'root',
                children: [
                    { type: 'heading', tag: 'h1' },
                    { type: 'heading', tag: 'h3' },
                    { type: 'heading', tag: 'h1' },
                ],
            },
        });

        expect(warnings.map((warning) => warning.id)).toEqual(expect.arrayContaining(['heading-jump', 'multiple-h1']));
    });

    it('warns about tables without headers and generic attachment names', () => {
        const warnings = analyzeContentHealth({
            root: {
                type: 'root',
                children: [
                    { type: 'table', children: [{ type: 'tablerow', children: [{ type: 'tablecell', headerState: 0 }] }] },
                    { type: 'attachment', name: 'download', fileName: 'file.pdf' },
                ],
            },
        });

        expect(warnings.map((warning) => warning.id)).toEqual(expect.arrayContaining(['table-headers-missing', 'attachment-label']));
    });
});
