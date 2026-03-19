/**
 * Layout nodes for multi-column layouts (2-col, 3-col).
 * LayoutContainerNode wraps LayoutItemNode children in a CSS grid.
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

// ─── LayoutContainerNode ──────────────────────────────────────────────────────

export type SerializedLayoutContainerNode = Spread<
    { templateColumns: string; type: 'layout-container'; version: 1 },
    SerializedElementNode
>;

export class LayoutContainerNode extends ElementNode {
    __templateColumns: string;

    static getType(): string {
        return 'layout-container';
    }

    static clone(node: LayoutContainerNode): LayoutContainerNode {
        return new LayoutContainerNode(node.__templateColumns, node.__key);
    }

    constructor(templateColumns: string, key?: NodeKey) {
        super(key);
        this.__templateColumns = templateColumns;
    }

    getTemplateColumns(): string {
        return this.getLatest().__templateColumns;
    }

    setTemplateColumns(templateColumns: string): this {
        const self = this.getWritable();
        self.__templateColumns = templateColumns;
        return self;
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const dom = document.createElement('div');
        dom.style.display = 'grid';
        dom.style.gridTemplateColumns = this.__templateColumns;
        dom.style.gap = '16px';
        dom.setAttribute('data-lexical-layout-container', 'true');
        return dom;
    }

    updateDOM(prevNode: LayoutContainerNode, dom: HTMLElement): boolean {
        if (prevNode.__templateColumns !== this.__templateColumns) {
            dom.style.gridTemplateColumns = this.__templateColumns;
        }
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('div');
        element.style.display = 'grid';
        element.style.gridTemplateColumns = this.__templateColumns;
        element.style.gap = '16px';
        element.setAttribute('data-layout-columns', this.__templateColumns);
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            div: (domNode) => {
                if (!domNode.hasAttribute('data-layout-columns')) return null;
                return {
                    conversion: (node): DOMConversionOutput => {
                        const templateColumns = (node as HTMLElement).getAttribute('data-layout-columns') ?? '1fr 1fr';
                        return { node: $createLayoutContainerNode(templateColumns) };
                    },
                    priority: 1,
                };
            },
        };
    }

    exportJSON(): SerializedLayoutContainerNode {
        return {
            ...super.exportJSON(),
            templateColumns: this.__templateColumns,
            type: 'layout-container',
            version: 1,
        };
    }

    static importJSON(serializedNode: SerializedLayoutContainerNode): LayoutContainerNode {
        return $createLayoutContainerNode(serializedNode.templateColumns);
    }

    isShadowRoot(): boolean {
        return true;
    }
}

export function $createLayoutContainerNode(templateColumns: string): LayoutContainerNode {
    return new LayoutContainerNode(templateColumns);
}

export function $isLayoutContainerNode(node: LexicalNode | null | undefined): node is LayoutContainerNode {
    return node instanceof LayoutContainerNode;
}

// ─── LayoutItemNode ───────────────────────────────────────────────────────────

export type SerializedLayoutItemNode = Spread<
    { type: 'layout-item'; version: 1 },
    SerializedElementNode
>;

export class LayoutItemNode extends ElementNode {
    static getType(): string {
        return 'layout-item';
    }

    static clone(node: LayoutItemNode): LayoutItemNode {
        return new LayoutItemNode(node.__key);
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const dom = document.createElement('div');
        dom.setAttribute('data-lexical-layout-item', 'true');
        dom.style.minWidth = '0';
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('div');
        element.setAttribute('data-layout-item', 'true');
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            div: (domNode) => {
                if (!domNode.hasAttribute('data-layout-item')) return null;
                return {
                    conversion: (): DOMConversionOutput => ({ node: $createLayoutItemNode() }),
                    priority: 1,
                };
            },
        };
    }

    exportJSON(): SerializedLayoutItemNode {
        return {
            ...super.exportJSON(),
            type: 'layout-item',
            version: 1,
        };
    }

    static importJSON(_serializedNode: SerializedLayoutItemNode): LayoutItemNode {
        return $createLayoutItemNode();
    }
}

export function $createLayoutItemNode(): LayoutItemNode {
    return new LayoutItemNode();
}

export function $isLayoutItemNode(node: LexicalNode | null | undefined): node is LayoutItemNode {
    return node instanceof LayoutItemNode;
}
