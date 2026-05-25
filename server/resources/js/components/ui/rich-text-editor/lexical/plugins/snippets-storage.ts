import { sanitizePastedHtml } from './paste-sanitizer';
import type { RteSnippet } from './snippets-storage.types';

export const RTE_SNIPPETS_STORAGE_KEY = 'cms:rte:snippets:v1';

function getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;

    return window.localStorage;
}

function isSnippet(value: unknown): value is RteSnippet {
    if (!value || typeof value !== 'object') return false;

    const candidate = value as Partial<RteSnippet>;

    return typeof candidate.id === 'string'
        && typeof candidate.name === 'string'
        && typeof candidate.html === 'string'
        && typeof candidate.createdAt === 'string';
}

export function sanitizeSnippetHtml(html: string): string {
    return sanitizePastedHtml(html);
}

export function loadRteSnippets(storage: Storage | null = getStorage()): RteSnippet[] {
    if (!storage) return [];

    try {
        const raw = storage.getItem(RTE_SNIPPETS_STORAGE_KEY);
        if (!raw) return [];

        const decoded: unknown = JSON.parse(raw);

        return Array.isArray(decoded)
            ? decoded
                .filter(isSnippet)
                .map((snippet) => ({
                    ...snippet,
                    html: sanitizeSnippetHtml(snippet.html),
                }))
                .filter((snippet) => snippet.html.trim() !== '')
            : [];
    } catch {
        return [];
    }
}

export function saveRteSnippets(snippets: RteSnippet[], storage: Storage | null = getStorage()): void {
    if (!storage) return;

    storage.setItem(RTE_SNIPPETS_STORAGE_KEY, JSON.stringify(snippets));
}

export function createRteSnippet(name: string, html: string): RteSnippet {
    return {
        id: globalThis.crypto?.randomUUID?.() ?? `snippet-${Date.now()}`,
        name,
        html: sanitizeSnippetHtml(html),
        createdAt: new Date().toISOString(),
    };
}
