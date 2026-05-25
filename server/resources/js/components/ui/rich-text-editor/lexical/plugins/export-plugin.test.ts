import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadContent } from './ExportPlugin';

describe('downloadContent', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('downloads editor exports with the requested filename and MIME type', () => {
        const objectUrl = 'blob:cms-export';
        const click = vi.fn();
        const appendChild = vi.spyOn(document.body, 'appendChild');
        const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue(objectUrl);
        const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
        const createElement = vi.spyOn(document, 'createElement');

        createElement.mockImplementation((tagName, options) => {
            const element = Document.prototype.createElement.call(document, tagName, options);

            if (tagName.toLowerCase() === 'a') {
                Object.defineProperty(element, 'click', { value: click });
            }

            return element;
        });

        downloadContent('# Title', 'text/markdown', 'content.md');

        const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
        const anchor = createElement.mock.results
            .map((result) => result.value)
            .find((element): element is HTMLAnchorElement => element instanceof HTMLAnchorElement);

        expect(blob.type).toBe('text/markdown');
        expect(anchor?.href).toBe(objectUrl);
        expect(anchor?.download).toBe('content.md');
        expect(click).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledWith(objectUrl);
        expect(appendChild).not.toHaveBeenCalled();
    });
});
