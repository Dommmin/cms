import { createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';
import { $createImageGalleryNode, ImageGalleryNode } from './image-gallery-node';
import type { GalleryImage, SerializedImageGalleryNode } from './image-gallery-node.types';

const galleryImages: GalleryImage[] = [
    {
        mediaId: 1,
        src: '/storage/one.jpg',
        alt: 'One',
        caption: 'First caption',
        width: 800,
        height: 600,
        focalPoint: null,
    },
    {
        mediaId: 2,
        src: '/storage/two.jpg',
        alt: 'Two',
        caption: null,
        width: null,
        height: null,
        focalPoint: null,
    },
];

function withGalleryNode<T>(callback: () => T): T {
    const editor = createEditor({
        nodes: [ImageGalleryNode],
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

describe('ImageGalleryNode', () => {
    it('exports gallery JSON with media asset metadata', () => {
        const json = withGalleryNode<SerializedImageGalleryNode>(() => $createImageGalleryNode(galleryImages, 3).exportJSON());

        expect(json).toMatchObject({
            type: 'image-gallery',
            version: 2,
            columns: 3,
            images: galleryImages,
        });
    });

    it('exports figure gallery HTML with captions and columns', () => {
        const element = withGalleryNode<HTMLElement>(() => {
            const { element } = $createImageGalleryNode(galleryImages, 3, 2, 'wide', '16:9', true).exportDOM();

            return element as HTMLElement;
        });

        expect(element.tagName).toBe('FIGURE');
        expect(element.getAttribute('data-rte-gallery')).toBe('true');
        expect(element.getAttribute('data-columns')).toBe('3');
        expect(element.getAttribute('data-mobile-columns')).toBe('2');
        expect(element.getAttribute('data-gap')).toBe('wide');
        expect(element.getAttribute('data-aspect-ratio')).toBe('16:9');
        expect(element.getAttribute('data-lightbox')).toBe('true');
        expect(element.querySelectorAll('[data-gallery-item]')).toHaveLength(2);
        expect(element.querySelector('img')?.getAttribute('alt')).toBe('One');
        expect(element.querySelector('figcaption')?.textContent).toBe('First caption');
    });
});
