import { beforeEach, describe, expect, it } from 'vitest';
import { createRteSnippet, loadRteSnippets, RTE_SNIPPETS_STORAGE_KEY, saveRteSnippets } from './snippets-storage';

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
});
