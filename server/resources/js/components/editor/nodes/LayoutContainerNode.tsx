import type {
    DOMConversionMap,
    EditorConfig,
    NodeKey,
    SerializedElementNode,
    Spread,
} from 'lexical';
import { $applyNodeReplacement, ElementNode } from 'lexical';

export type SerializedLayoutContainerNode = Spread<
    { templateColumns: string },
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

    static importJSON(node: SerializedLayoutContainerNode): LayoutContainerNode {
        return $createLayoutContainerNode(node.templateColumns);
    }

    exportJSON(): SerializedLayoutContainerNode {
        return {
            ...super.exportJSON(),
            templateColumns: this.__templateColumns,
            type: 'layout-container',
            version: 1,
        };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = document.createElement('div');
        dom.style.gridTemplateColumns = this.__templateColumns;
        const theme = config.theme;
        const layoutContainer = theme.layoutContainer as string | undefined;
        if (layoutContainer) dom.className = layoutContainer;
        return dom;
    }

    updateDOM(prevNode: LayoutContainerNode, dom: HTMLElement): boolean {
        if (prevNode.__templateColumns !== this.__templateColumns) {
            dom.style.gridTemplateColumns = this.__templateColumns;
        }
        return false;
    }

    getTemplateColumns(): string {
        return this.__templateColumns;
    }

    setTemplateColumns(templateColumns: string): void {
        this.getWritable().__templateColumns = templateColumns;
    }

    isShadowRoot(): boolean {
        return true;
    }

    canBeEmpty(): false {
        return false;
    }

    static importDOM(): DOMConversionMap | null {
        return null;
    }
}

export function $createLayoutContainerNode(templateColumns: string): LayoutContainerNode {
    return $applyNodeReplacement(new LayoutContainerNode(templateColumns));
}

export function $isLayoutContainerNode(node: unknown): node is LayoutContainerNode {
    return node instanceof LayoutContainerNode;
}
