import { describe, expect, it } from 'vitest';
import { sanitizePastedHtml } from './paste-sanitizer';

describe('sanitizePastedHtml', () => {
    it('removes Word styles, classes and redundant spans', () => {
        const html = '<p class="MsoNormal" style="margin:0"><span style="mso-bidi-font-weight:bold">Clean text</span></p>';

        expect(sanitizePastedHtml(html)).toBe('<p>Clean text</p>');
    });

    it('removes unsafe links but keeps their text', () => {
        const html = '<p><a href="javascript:alert(1)" onclick="alert(1)">Bad link</a></p>';

        expect(sanitizePastedHtml(html)).toBe('<p>Bad link</p>');
    });

    it('normalizes external blank links with rel protection', () => {
        const html = '<p><a href="https://example.com" target="_blank">External</a></p>';

        expect(sanitizePastedHtml(html)).toBe('<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">External</a></p>');
    });

    it('removes data images and keeps safe table markup', () => {
        const html = '<table style="width:100%"><tbody><tr><th style="color:red">Name</th><td><img src="data:image/png;base64,abc">Value</td></tr></tbody></table>';

        expect(sanitizePastedHtml(html)).toBe('<table><tbody><tr><th>Name</th><td>Value</td></tr></tbody></table>');
    });
});
