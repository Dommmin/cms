import type { DOMExportOutput } from 'lexical';
import { createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';
import { $createEmbedNode, detectEmbed, EmbedNode } from './embed-node';
import type { SerializedEmbedNode } from './embed-node.types';

function withEmbedNode<T>(callback: () => T): T {
    const editor = createEditor({
        nodes: [EmbedNode],
        onError(error) {
            throw error;
        },
    });
    let result: T | undefined;

    editor.update(
        () => {
            result = callback();
        },
        { discrete: true },
    );

    return result as T;
}

function exportElement(url: string): HTMLElement {
    const definition = detectEmbed(url);

    expect(definition).not.toBeNull();

    const { element } = withEmbedNode<DOMExportOutput>(() => $createEmbedNode(definition!).exportDOM());

    expect(element).toBeInstanceOf(HTMLElement);

    return element as HTMLElement;
}

describe('EmbedNode', () => {
    it('detects supported embed providers', () => {
        expect(detectEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ')?.platform).toBe('youtube');
        expect(detectEmbed('https://vimeo.com/123456')?.embedUrl).toBe('https://player.vimeo.com/video/123456');
        expect(detectEmbed('https://open.spotify.com/track/abc123')?.embedUrl).toBe('https://open.spotify.com/embed/track/abc123');
        expect(detectEmbed('https://www.loom.com/share/abc123')?.embedUrl).toBe('https://www.loom.com/embed/abc123');
        expect(detectEmbed('https://www.tiktok.com/@user/video/123456789')?.embedUrl).toBe('https://www.tiktok.com/embed/v2/123456789');
    });

    it('rejects unsupported or unsafe embed URLs', () => {
        expect(detectEmbed('javascript:alert(1)')).toBeNull();
        expect(detectEmbed('http://youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
        expect(detectEmbed('https://example.com/video')).toBeNull();
    });

    it('exports embed JSON', () => {
        const definition = detectEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

        expect(definition).not.toBeNull();

        const json = withEmbedNode<SerializedEmbedNode>(() => $createEmbedNode(definition!).exportJSON());

        expect(json).toMatchObject({
            type: 'embed',
            version: 1,
            platform: 'youtube',
            sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
            label: 'YouTube video',
        });
    });

    it('exports safe responsive iframe HTML', () => {
        const element = exportElement('https://vimeo.com/123456');
        const iframe = element.querySelector('iframe');

        expect(element.tagName).toBe('FIGURE');
        expect(element.getAttribute('data-rte-embed')).toBe('true');
        expect(element.getAttribute('data-embed-platform')).toBe('vimeo');
        expect(iframe?.getAttribute('src')).toBe('https://player.vimeo.com/video/123456');
        expect(iframe?.getAttribute('sandbox')).toContain('allow-scripts');
        expect(iframe?.getAttribute('loading')).toBe('lazy');
    });
});
