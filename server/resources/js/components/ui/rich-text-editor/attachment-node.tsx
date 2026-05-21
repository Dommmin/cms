import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
} from 'lexical';
import { $applyNodeReplacement, $getNodeByKey, DecoratorNode } from 'lexical';
import { FileArchive, FileIcon, FileSpreadsheet, FileText, Presentation, Trash2 } from 'lucide-react';
import type { JSX } from 'react';
import type {
    AttachmentComponentProps,
    AttachmentNodeState,
    CreateAttachmentNodePayload,
    SerializedAttachmentNode,
} from './attachment-node.types';
import { getEditorLinkTarget, isAllowedEditorLinkUrl, normalizeEditorLinkUrl } from './lexical/link-url';

function normalizeAttachmentState(payload: CreateAttachmentNodePayload): AttachmentNodeState {
    return {
        mediaId: payload.mediaId ?? null,
        url: payload.url,
        name: payload.name,
        fileName: payload.fileName ?? payload.name,
        mimeType: payload.mimeType ?? 'application/octet-stream',
        size: payload.size ?? null,
        description: payload.description ?? null,
    };
}

function safeAttachmentUrl(url: string): string {
    const normalized = normalizeEditorLinkUrl(url);

    return isAllowedEditorLinkUrl(normalized) ? normalized : '#';
}

function formatFileSize(size: number | null): string | null {
    if (size === null) return null;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;

    return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function renderMimeIcon(mimeType: string): JSX.Element {
    const className = 'h-5 w-5 flex-shrink-0 text-muted-foreground';

    if (mimeType.includes('pdf') || mimeType.includes('word')) return <FileText className={className} />;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className={className} />;
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <Presentation className={className} />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileArchive className={className} />;

    return <FileIcon className={className} />;
}

function AttachmentComponent({ url, name, fileName, mimeType, size, description, nodeKey, editor }: AttachmentComponentProps): JSX.Element {
    const safeUrl = safeAttachmentUrl(url);
    const target = getEditorLinkTarget(safeUrl) ?? undefined;

    return (
        <span contentEditable={false} className="my-2 flex max-w-xl items-center gap-3 rounded-md border bg-muted/30 p-3">
            {renderMimeIcon(mimeType)}
            <a href={safeUrl} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{name || fileName}</span>
                <span className="block truncate text-xs text-muted-foreground">
                    {fileName}
                    {formatFileSize(size) ? ` · ${formatFileSize(size)}` : ''}
                </span>
                {description && <span className="block text-xs text-muted-foreground">{description}</span>}
            </a>
            <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:text-destructive"
                title="Remove file"
                onClick={() => {
                    editor.update(() => $getNodeByKey(nodeKey)?.remove());
                }}
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </span>
    );
}

export class AttachmentNode extends DecoratorNode<JSX.Element> {
    __attachmentState: AttachmentNodeState;

    static getType(): string {
        return 'attachment';
    }

    static clone(node: AttachmentNode): AttachmentNode {
        return new AttachmentNode({ ...node.__attachmentState }, node.__key);
    }

    constructor(payload: CreateAttachmentNodePayload, key?: NodeKey) {
        super(key);
        this.__attachmentState = normalizeAttachmentState(payload);
    }

    static importJSON(serialized: SerializedAttachmentNode): AttachmentNode {
        return $createAttachmentNode(serialized);
    }

    exportJSON(): SerializedAttachmentNode {
        return {
            type: 'attachment',
            version: 1,
            ...this.__attachmentState,
        };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            a: (domNode: HTMLElement) => {
                if (domNode.getAttribute('data-rte-attachment') !== 'true') return null;

                return { conversion: convertAttachmentElement, priority: 2 };
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const state = this.__attachmentState;
        const link = document.createElement('a');
        const safeUrl = safeAttachmentUrl(state.url);
        link.setAttribute('data-rte-attachment', 'true');
        link.setAttribute('href', safeUrl);
        link.setAttribute('data-file-name', state.fileName);
        link.setAttribute('data-mime-type', state.mimeType);
        if (state.mediaId !== null) link.setAttribute('data-media-id', String(state.mediaId));
        if (state.size !== null) link.setAttribute('data-size', String(state.size));
        if (state.description) link.setAttribute('data-description', state.description);
        const target = getEditorLinkTarget(safeUrl);
        if (target) link.setAttribute('target', target);
        if (target === '_blank') link.setAttribute('rel', 'noopener noreferrer');
        link.textContent = state.name || state.fileName;

        return { element: link };
    }

    createDOM(): HTMLElement {
        return document.createElement('span');
    }

    updateDOM(): false {
        return false;
    }

    isInline(): false {
        return false;
    }

    decorate(editor: LexicalEditor, _config: EditorConfig): JSX.Element {
        return <AttachmentComponent {...this.__attachmentState} nodeKey={this.__key} editor={editor} />;
    }
}

function convertAttachmentElement(domNode: HTMLElement): DOMConversionOutput | null {
    const link = domNode as HTMLAnchorElement;

    return {
        node: $createAttachmentNode({
            mediaId: Number(link.getAttribute('data-media-id')) || null,
            url: link.getAttribute('href') ?? '#',
            name: link.textContent?.trim() || link.getAttribute('data-file-name') || 'File attachment',
            fileName: link.getAttribute('data-file-name') ?? link.textContent?.trim() ?? 'file',
            mimeType: link.getAttribute('data-mime-type') ?? 'application/octet-stream',
            size: Number(link.getAttribute('data-size')) || null,
            description: link.getAttribute('data-description'),
        }),
    };
}

export function $createAttachmentNode(payload: CreateAttachmentNodePayload): AttachmentNode {
    return $applyNodeReplacement(new AttachmentNode(payload));
}

export function $isAttachmentNode(node: LexicalNode | null | undefined): node is AttachmentNode {
    return node instanceof AttachmentNode;
}

export type { CreateAttachmentNodePayload, SerializedAttachmentNode };
