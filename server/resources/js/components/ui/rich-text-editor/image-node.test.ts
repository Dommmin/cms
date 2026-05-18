import type { DOMExportOutput } from 'lexical';
import { createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';
import { $createImageNode, ImageNode } from './image-node';
import type { SerializedImageNode } from './image-node.types';

function withImageNode<T>(callback: () => T): T {
    const editor = createEditor({
        nodes: [ImageNode],
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

function exportElement(payload: Parameters<typeof $createImageNode>[0]): HTMLElement {
    const { element } = withImageNode<DOMExportOutput>(() => $createImageNode(payload).exportDOM());

    expect(element).toBeInstanceOf(HTMLElement);

    return element as HTMLElement;
}

describe('ImageNode', () => {
    it('exports the image v2 JSON contract', () => {
        const json = withImageNode<SerializedImageNode>(() => $createImageNode({
            src: '/storage/hero.jpg',
            altText: 'Hero alt',
            mediaId: 42,
            caption: 'Hero caption',
            credit: 'Editorial team',
            width: '50%',
            align: 'center',
            layout: 'wide',
            wrap: 'none',
            sizePreset: 'medium',
            focalPoint: { x: 0.4, y: 0.6 },
            decorative: false,
            linkUrl: '/en/story',
            loading: 'lazy',
        }).exportJSON());

        expect(json).toMatchObject({
            type: 'image',
            version: 2,
            src: '/storage/hero.jpg',
            altText: 'Hero alt',
            mediaId: 42,
            caption: 'Hero caption',
            credit: 'Editorial team',
            width: '50%',
            align: 'center',
            layout: 'wide',
            wrap: 'none',
            sizePreset: 'medium',
            focalPoint: { x: 0.4, y: 0.6 },
            decorative: false,
            linkUrl: '/en/story',
            loading: 'lazy',
        });
    });

    it('exports responsive figure HTML with caption and safe link metadata', () => {
        const element = exportElement({
            src: '/storage/hero.jpg',
            altText: 'Hero alt',
            mediaId: 42,
            caption: 'Hero caption',
            credit: 'Editorial team',
            width: '50%',
            align: 'right',
            layout: 'block',
            wrap: 'wrap-right',
            sizePreset: 'medium',
            linkUrl: 'https://example.com/story',
        });
        const image = element.querySelector('img');
        const link = element.querySelector('a');

        expect(element.tagName).toBe('FIGURE');
        expect(element.getAttribute('data-rte-image')).toBe('true');
        expect(element.getAttribute('data-media-id')).toBe('42');
        expect(element.getAttribute('data-wrap')).toBe('wrap-right');
        expect(link?.getAttribute('target')).toBe('_blank');
        expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
        expect(image?.getAttribute('src')).toBe('/storage/hero.jpg');
        expect(image?.getAttribute('alt')).toBe('Hero alt');
        expect(element.querySelector('figcaption')?.textContent).toContain('Hero caption');
        expect(element.querySelector('[data-credit]')?.textContent).toBe('Editorial team');
    });

    it('exports decorative images with empty alt text', () => {
        const element = exportElement({
            src: '/storage/divider.jpg',
            altText: 'Ignored alt',
            decorative: true,
        });

        expect(element.querySelector('img')?.getAttribute('alt')).toBe('');
        expect(element.getAttribute('data-decorative')).toBe('true');
    });
});
