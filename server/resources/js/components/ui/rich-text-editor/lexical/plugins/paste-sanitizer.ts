import { isAllowedEditorLinkUrl, normalizeEditorLinkUrl } from '../link-url';

const ALLOWED_TAGS = new Set([
    'A',
    'BLOCKQUOTE',
    'BR',
    'CODE',
    'COL',
    'COLGROUP',
    'DIV',
    'EM',
    'FIGCAPTION',
    'FIGURE',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HR',
    'IMG',
    'LI',
    'OL',
    'P',
    'PRE',
    'S',
    'SPAN',
    'STRONG',
    'SUB',
    'SUP',
    'TABLE',
    'TBODY',
    'TD',
    'TH',
    'THEAD',
    'TR',
    'U',
    'UL',
]);

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
    A: ['href', 'target', 'rel', 'title', 'data-rte-attachment', 'data-media-id', 'data-file-name', 'data-mime-type', 'data-size'],
    IMG: ['src', 'alt', 'width', 'height', 'loading', 'data-media-id'],
    FIGURE: ['data-rte-image', 'data-rte-gallery', 'data-gallery', 'data-columns', 'data-layout', 'data-wrap', 'data-size-preset', 'data-media-id'],
    FIGCAPTION: [],
    TABLE: [],
    TD: ['colspan', 'rowspan'],
    TH: ['colspan', 'rowspan', 'scope'],
};

function unwrapElement(element: Element): void {
    const parent = element.parentNode;
    if (!parent) return;

    while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
}

function removeDisallowedAttributes(element: Element): void {
    const allowed = ALLOWED_ATTRIBUTES[element.tagName] ?? [];

    for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();
        const isDataAttribute = name.startsWith('data-') && allowed.includes(name);

        if (name.startsWith('on') || name === 'style' || name === 'class' || name.startsWith('mso-')) {
            element.removeAttribute(attribute.name);
            continue;
        }

        if (!allowed.includes(name) && !isDataAttribute) {
            element.removeAttribute(attribute.name);
        }
    }
}

function sanitizeLink(element: HTMLAnchorElement): void {
    const href = normalizeEditorLinkUrl(element.getAttribute('href') ?? '');
    if (!isAllowedEditorLinkUrl(href)) {
        unwrapElement(element);
        return;
    }

    element.setAttribute('href', href);
    if (element.target === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer');
    }
}

function sanitizeImage(element: HTMLImageElement): void {
    const src = normalizeEditorLinkUrl(element.getAttribute('src') ?? '');
    if (!isAllowedEditorLinkUrl(src)) {
        element.remove();
        return;
    }

    element.setAttribute('src', src);
    element.setAttribute('alt', element.getAttribute('alt') ?? '');
    if (!element.getAttribute('loading')) {
        element.setAttribute('loading', 'lazy');
    }
}

function walk(node: Node): void {
    for (const child of Array.from(node.childNodes)) {
        if (child.nodeType !== Node.ELEMENT_NODE) {
            continue;
        }

        const element = child as Element;
        if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || element.tagName === 'META' || element.tagName === 'LINK') {
            element.remove();
            continue;
        }

        if (!ALLOWED_TAGS.has(element.tagName)) {
            unwrapElement(element);
            continue;
        }

        walk(element);
        removeDisallowedAttributes(element);

        if (element.tagName === 'SPAN' && element.attributes.length === 0) {
            unwrapElement(element);
            continue;
        }

        if (element instanceof HTMLAnchorElement) {
            sanitizeLink(element);
        } else if (element instanceof HTMLImageElement) {
            sanitizeImage(element);
        }
    }
}

export function sanitizePastedHtml(html: string): string {
    if (typeof window === 'undefined' || html.trim() === '') {
        return '';
    }

    const parser = new window.DOMParser();
    const document = parser.parseFromString(html, 'text/html');
    walk(document.body);

    return document.body.innerHTML;
}
