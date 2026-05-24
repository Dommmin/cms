import { isInternalEditorLinkUrl } from '../link-url';

export type ContentHealthSeverity = 'warning' | 'error';

export type ContentHealthWarning = {
    id: string;
    severity: ContentHealthSeverity;
    message: string;
};

type SerializedNode = {
    type?: string;
    tag?: string;
    text?: string;
    url?: string;
    target?: string | null;
    rel?: string | null;
    altText?: string;
    decorative?: boolean;
    name?: string;
    fileName?: string;
    style?: string;
    headerState?: number;
    children?: SerializedNode[];
};

function isSerializedNode(value: unknown): value is SerializedNode {
    return typeof value === 'object' && value !== null;
}

function walk(node: SerializedNode, visitor: (node: SerializedNode) => void): void {
    visitor(node);
    node.children?.forEach((child) => walk(child, visitor));
}

function nodeText(node: SerializedNode): string {
    if (typeof node.text === 'string') return node.text;

    return node.children?.map(nodeText).join(' ') ?? '';
}

export function collectInternalLinkUrls(editorJson: unknown): string[] {
    if (!isSerializedNode(editorJson)) {
        return [];
    }

    const root = isSerializedNode('root' in editorJson ? (editorJson as { root?: unknown }).root : editorJson)
        ? ('root' in editorJson ? (editorJson as { root: SerializedNode }).root : editorJson)
        : editorJson;
    const urls = new Set<string>();

    walk(root, (node) => {
        const url = (node.url ?? '').trim();

        if (node.type === 'link' && isInternalEditorLinkUrl(url)) {
            urls.add(url);
        }
    });

    return [...urls];
}

export function analyzeContentHealth(editorJson: unknown, brokenInternalUrls: ReadonlySet<string> = new Set()): ContentHealthWarning[] {
    if (!isSerializedNode(editorJson)) {
        return [];
    }

    const root = isSerializedNode('root' in editorJson ? (editorJson as { root?: unknown }).root : editorJson)
        ? ('root' in editorJson ? (editorJson as { root: SerializedNode }).root : editorJson)
        : editorJson;
    const warnings: ContentHealthWarning[] = [];
    const headingLevels: number[] = [];
    let h1Count = 0;

    walk(root, (node) => {
        if (node.type === 'image' && !node.decorative && (node.altText ?? '').trim() === '') {
            warnings.push({
                id: 'image-alt-missing',
                severity: 'error',
                message: 'Image is missing alt text or decorative flag.',
            });
        }

        if (node.type === 'link') {
            const url = (node.url ?? '').trim();

            if ((node.url ?? '').trim() === '') {
                warnings.push({
                    id: 'link-empty',
                    severity: 'error',
                    message: 'Link has an empty URL.',
                });
            }
            if (url !== '' && brokenInternalUrls.has(url)) {
                warnings.push({
                    id: 'link-internal-broken',
                    severity: 'warning',
                    message: 'Internal link points to missing or unpublished content.',
                });
            }
            if (node.target === '_blank' && !(node.rel ?? '').includes('noopener')) {
                warnings.push({
                    id: 'link-rel-missing',
                    severity: 'warning',
                    message: 'External link opens in a new tab without rel protection.',
                });
            }
        }

        if (node.type === 'heading') {
            const level = Number((node.tag ?? '').replace('h', ''));
            if (Number.isFinite(level) && level > 0) {
                headingLevels.push(level);
                if (level === 1) h1Count += 1;
            }
        }

        if (node.type === 'paragraph') {
            const words = nodeText(node).trim().split(/\s+/).filter(Boolean);
            if (words.length > 120) {
                warnings.push({
                    id: 'paragraph-too-long',
                    severity: 'warning',
                    message: 'Paragraph is long; consider splitting it for readability.',
                });
            }
        }

        if (node.type === 'text' && (node.style ?? '').trim() !== '') {
            warnings.push({
                id: 'inline-style',
                severity: 'warning',
                message: 'Inline text style detected.',
            });
        }

        if (node.type === 'attachment') {
            const label = (node.name ?? node.fileName ?? '').trim().toLowerCase();
            if (label === '' || label === 'file' || label === 'file attachment' || label === 'download') {
                warnings.push({
                    id: 'attachment-label',
                    severity: 'warning',
                    message: 'Attachment needs a descriptive public name.',
                });
            }
        }
    });

    for (let index = 1; index < headingLevels.length; index += 1) {
        if (headingLevels[index] - headingLevels[index - 1] > 1) {
            warnings.push({
                id: 'heading-jump',
                severity: 'warning',
                message: 'Heading levels skip a level.',
            });
            break;
        }
    }

    if (h1Count > 1) {
        warnings.push({
            id: 'multiple-h1',
            severity: 'warning',
            message: 'More than one H1 found in this field.',
        });
    }

    let tableCount = 0;
    let tableHeaderCount = 0;
    walk(root, (node) => {
        if (node.type === 'table') tableCount += 1;
        if (node.type === 'tablecell' && (node.headerState ?? 0) > 0) tableHeaderCount += 1;
    });

    if (tableCount > 0 && tableHeaderCount === 0) {
        warnings.push({
            id: 'table-headers-missing',
            severity: 'warning',
            message: 'Table has no header cells.',
        });
    }

    return warnings;
}
