const ALLOWED_LINK_URL_PATTERN = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)\S+$/;

export function normalizeEditorLinkUrl(url: string): string {
    return url.trim();
}

export function isAllowedEditorLinkUrl(url: string): boolean {
    return ALLOWED_LINK_URL_PATTERN.test(normalizeEditorLinkUrl(url));
}

export function getEditorLinkTarget(url: string): '_blank' | null {
    return /^https?:\/\//.test(normalizeEditorLinkUrl(url)) ? '_blank' : null;
}
