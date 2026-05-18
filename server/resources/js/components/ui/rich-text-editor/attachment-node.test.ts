import type { DOMExportOutput } from 'lexical';
import { createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';
import { $createAttachmentNode, AttachmentNode } from './attachment-node';
import type { SerializedAttachmentNode } from './attachment-node.types';

function withAttachmentNode<T>(callback: () => T): T {
    const editor = createEditor({
        nodes: [AttachmentNode],
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
    const { element } = withAttachmentNode<DOMExportOutput>(() =>
        $createAttachmentNode({
            mediaId: 9,
            url,
            name: 'Product manual',
            fileName: 'manual.pdf',
            mimeType: 'application/pdf',
            size: 2048,
            description: 'Downloadable manual',
        }).exportDOM(),
    );

    expect(element).toBeInstanceOf(HTMLElement);

    return element as HTMLElement;
}

describe('AttachmentNode', () => {
    it('exports attachment JSON', () => {
        const json = withAttachmentNode<SerializedAttachmentNode>(() =>
            $createAttachmentNode({
                mediaId: 9,
                url: '/storage/manual.pdf',
                name: 'Product manual',
                fileName: 'manual.pdf',
                mimeType: 'application/pdf',
                size: 2048,
            }).exportJSON(),
        );

        expect(json).toMatchObject({
            type: 'attachment',
            version: 1,
            mediaId: 9,
            url: '/storage/manual.pdf',
            name: 'Product manual',
            fileName: 'manual.pdf',
            mimeType: 'application/pdf',
            size: 2048,
        });
    });

    it('exports a safe attachment link', () => {
        const element = exportElement('/storage/manual.pdf');

        expect(element.tagName).toBe('A');
        expect(element.getAttribute('data-rte-attachment')).toBe('true');
        expect(element.getAttribute('href')).toBe('/storage/manual.pdf');
        expect(element.getAttribute('data-media-id')).toBe('9');
        expect(element.getAttribute('data-mime-type')).toBe('application/pdf');
        expect(element.textContent).toBe('Product manual');
    });

    it('blocks unsafe attachment URLs in HTML export', () => {
        const element = exportElement('javascript:alert(1)');

        expect(element.getAttribute('href')).toBe('#');
    });
});
