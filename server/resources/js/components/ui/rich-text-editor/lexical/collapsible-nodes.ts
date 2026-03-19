/**
 * Collapsible (accordion) nodes for the Lexical editor.
 * CollapsibleContainerNode wraps CollapsibleTitleNode + CollapsibleContentNode.
 */

import { ElementNode } from 'lexical';
import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
} from 'lexical';
import type { Spread } from 'lexical';

// ─── CollapsibleContainerNode ─────────────────────────────────────────────────

export type SerializedCollapsibleContainerNode = Spread<
    { open: boolean; type: 'collapsible-container'; version: 1 },
    SerializedElementNode
>;

export class CollapsibleContainerNode extends ElementNode {
    __open: boolean;

    static getType(): string {
        return 'collapsible-container';
    }

    static clone(node: CollapsibleContainerNode): CollapsibleContainerNode {
        return new CollapsibleContainerNode(node.__open, node.__key);
    }

    constructor(open: boolean, key?: NodeKey) {
        super(key);
        this.__open = open;
    }

    isOpen(): boolean {
        return this.getLatest().__open;
    }

    setOpen(open: boolean): this {
        const self = this.getWritable();
        self.__open = open;
        return self;
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const dom = document.createElement('details');
        dom.setAttribute('data-lexical-collapsible', 'true');
        if (this.__open) dom.setAttribute('open', '');
        return dom;
    }

    updateDOM(prevNode: CollapsibleContainerNode, dom: HTMLElement): boolean {
        const detailsElem = dom as HTMLDetailsElement;
        if (prevNode.__open !== this.__open) {
            detailsElem.open = this.__open;
        }
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('details');
        if (this.__open) element.setAttribute('open', '');
        element.setAttribute('data-collapsible', 'true');
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            details: () => ({
                conversion: (node): DOMConversionOutput => {
                    const open = (node as HTMLDetailsElement).open;
                    return { node: $createCollapsibleContainerNode(open) };
                },
                priority: 1,
            }),
        };
    }

    exportJSON(): SerializedCollapsibleContainerNode {
        return {
            ...super.exportJSON(),
            open: this.__open,
            type: 'collapsible-container',
            version: 1,
        };
    }

    static importJSON(serializedNode: SerializedCollapsibleContainerNode): CollapsibleContainerNode {
        return $createCollapsibleContainerNode(serializedNode.open);
    }

    isShadowRoot(): boolean {
        return false;
    }
}

export function $createCollapsibleContainerNode(open: boolean = true): CollapsibleContainerNode {
    return new CollapsibleContainerNode(open);
}

export function $isCollapsibleContainerNode(node: LexicalNode | null | undefined): node is CollapsibleContainerNode {
    return node instanceof CollapsibleContainerNode;
}

// ─── CollapsibleTitleNode ─────────────────────────────────────────────────────

export type SerializedCollapsibleTitleNode = Spread<
    { type: 'collapsible-title'; version: 1 },
    SerializedElementNode
>;

export class CollapsibleTitleNode extends ElementNode {
    static getType(): string {
        return 'collapsible-title';
    }

    static clone(node: CollapsibleTitleNode): CollapsibleTitleNode {
        return new CollapsibleTitleNode(node.__key);
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const dom = document.createElement('summary');
        dom.setAttribute('data-lexical-collapsible-title', 'true');
        dom.style.cursor = 'pointer';
        dom.style.fontWeight = '600';
        dom.style.userSelect = 'none';
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    exportDOM(): DOMExportOutput {
        return { element: document.createElement('summary') };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            summary: () => ({
                conversion: (): DOMConversionOutput => ({ node: $createCollapsibleTitleNode() }),
                priority: 1,
            }),
        };
    }

    exportJSON(): SerializedCollapsibleTitleNode {
        return {
            ...super.exportJSON(),
            type: 'collapsible-title',
            version: 1,
        };
    }

    static importJSON(_serializedNode: SerializedCollapsibleTitleNode): CollapsibleTitleNode {
        return $createCollapsibleTitleNode();
    }
}

export function $createCollapsibleTitleNode(): CollapsibleTitleNode {
    return new CollapsibleTitleNode();
}

export function $isCollapsibleTitleNode(node: LexicalNode | null | undefined): node is CollapsibleTitleNode {
    return node instanceof CollapsibleTitleNode;
}

// ─── CollapsibleContentNode ───────────────────────────────────────────────────

export type SerializedCollapsibleContentNode = Spread<
    { type: 'collapsible-content'; version: 1 },
    SerializedElementNode
>;

export class CollapsibleContentNode extends ElementNode {
    static getType(): string {
        return 'collapsible-content';
    }

    static clone(node: CollapsibleContentNode): CollapsibleContentNode {
        return new CollapsibleContentNode(node.__key);
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const dom = document.createElement('div');
        dom.setAttribute('data-lexical-collapsible-content', 'true');
        dom.style.padding = '8px 0';
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('div');
        element.setAttribute('data-collapsible-content', 'true');
        return { element };
    }

    exportJSON(): SerializedCollapsibleContentNode {
        return {
            ...super.exportJSON(),
            type: 'collapsible-content',
            version: 1,
        };
    }

    static importJSON(_serializedNode: SerializedCollapsibleContentNode): CollapsibleContentNode {
        return $createCollapsibleContentNode();
    }
}

export function $createCollapsibleContentNode(): CollapsibleContentNode {
    return new CollapsibleContentNode();
}

export function $isCollapsibleContentNode(node: LexicalNode | null | undefined): node is CollapsibleContentNode {
    return node instanceof CollapsibleContentNode;
}
