import { describe, expect, it } from 'vitest';
import { getEditorLinkTarget, isAllowedEditorLinkUrl, normalizeEditorLinkUrl } from './link-url';

describe('editor link URL helpers', () => {
    it('allows supported editor link URL schemes', () => {
        expect(isAllowedEditorLinkUrl('https://example.com')).toBe(true);
        expect(isAllowedEditorLinkUrl('http://example.com')).toBe(true);
        expect(isAllowedEditorLinkUrl('mailto:editor@example.com')).toBe(true);
        expect(isAllowedEditorLinkUrl('tel:+48123456789')).toBe(true);
        expect(isAllowedEditorLinkUrl('/relative-page')).toBe(true);
        expect(isAllowedEditorLinkUrl('#section')).toBe(true);
    });

    it('rejects empty, protocol-relative, and unsupported URLs', () => {
        expect(isAllowedEditorLinkUrl('')).toBe(false);
        expect(isAllowedEditorLinkUrl('   ')).toBe(false);
        expect(isAllowedEditorLinkUrl('//example.com')).toBe(false);
        expect(isAllowedEditorLinkUrl('javascript:alert(1)')).toBe(false);
        expect(isAllowedEditorLinkUrl('ftp://example.com')).toBe(false);
    });

    it('normalizes whitespace and only opens external http links in a new tab', () => {
        expect(normalizeEditorLinkUrl('  /relative  ')).toBe('/relative');
        expect(getEditorLinkTarget('https://example.com')).toBe('_blank');
        expect(getEditorLinkTarget('/relative')).toBeNull();
        expect(getEditorLinkTarget('#section')).toBeNull();
    });
});
