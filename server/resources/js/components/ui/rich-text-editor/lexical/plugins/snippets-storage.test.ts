import { beforeEach, describe, expect, it } from 'vitest';
import { createRteSnippet, loadRteSnippets, RTE_SNIPPETS_STORAGE_KEY, sanitizeSnippetHtml, saveRteSnippets } from './snippets-storage';

describe('snippets storage', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('saves and loads snippets from localStorage', () => {
        const snippet = createRteSnippet('CTA', '<p>Buy now</p>');

        saveRteSnippets([snippet]);

        expect(loadRteSnippets()).toEqual([snippet]);
    });

    it('returns an empty list for malformed stored data', () => {
        window.localStorage.setItem(RTE_SNIPPETS_STORAGE_KEY, '{"bad":true}');

        expect(loadRteSnippets()).toEqual([]);
    });

    it('filters invalid snippet entries', () => {
        const snippet = createRteSnippet('Intro', '<p>Hello</p>');

        window.localStorage.setItem(RTE_SNIPPETS_STORAGE_KEY, JSON.stringify([snippet, { id: 'bad' }]));

        expect(loadRteSnippets()).toEqual([snippet]);
    });

    it('sanitizes snippet HTML before saving it for later insertion', () => {
        const snippet = createRteSnippet('Unsafe', '<p onclick="alert(1)"><a href="javascript:alert(1)">Bad</a><script>alert(1)</script></p>');

        expect(snippet.html).toBe('<p>Bad</p>');
    });

    it('sanitizes snippets loaded from localStorage', () => {
        window.localStorage.setItem(
            RTE_SNIPPETS_STORAGE_KEY,
            JSON.stringify([
                {
                    id: 'stored',
                    name: 'Stored',
                    html: '<img src="data:image/png;base64,abc"><p style="color:red">Safe text</p>',
                    createdAt: '2026-05-25T00:00:00.000Z',
                },
            ]),
        );

        expect(loadRteSnippets()).toEqual([
            {
                id: 'stored',
                name: 'Stored',
                html: '<p>Safe text</p>',
                createdAt: '2026-05-25T00:00:00.000Z',
            },
        ]);
    });

    it('drops stored snippets that sanitize to empty HTML', () => {
        window.localStorage.setItem(
            RTE_SNIPPETS_STORAGE_KEY,
            JSON.stringify([
                {
                    id: 'empty',
                    name: 'Empty',
                    html: '<script>alert(1)</script>',
                    createdAt: '2026-05-25T00:00:00.000Z',
                },
            ]),
        );

        expect(loadRteSnippets()).toEqual([]);
    });

    it('exposes the same sanitizer for command-driven snippet insertion', () => {
        expect(sanitizeSnippetHtml('<p><a href="https://example.com" target="_blank">External</a></p>')).toBe(
            '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">External</a></p>',
        );
    });
});
