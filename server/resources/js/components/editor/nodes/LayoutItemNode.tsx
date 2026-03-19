import type {
    DOMConversionMap,
    EditorConfig,
    NodeKey,
    SerializedElementNode,
} from 'lexical';
import { $applyNodeReplacement, ElementNode } from 'lexical';

export class LayoutItemNode extends ElementNode {
    static getType(): string {
        return 'layout-item';
    }

    static clone(node: LayoutItemNode): LayoutItemNode {
        return new LayoutItemNode(node.__key);
    }

    constructor(key?: NodeKey) {
        super(key);
    }

    static importJSON(): LayoutItemNode {
        return $createLayoutItemNode();
    }

    exportJSON(): SerializedElementNode {
        return { ...super.exportJSON(), type: 'layout-item', version: 1 };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        const layoutItem = config.theme.layoutItem as string | undefined;
        if (layoutItem) div.className = layoutItem;
        return div;
    }

    updateDOM(): boolean {
        return false;
    }

    isShadowRoot(): boolean {
        return true;
    }

    static importDOM(): DOMConversionMap | null {
        return null;
    }
}

export function $createLayoutItemNode(): LayoutItemNode {
    return $applyNodeReplacement(new LayoutItemNode());
}

export function $isLayoutItemNode(node: unknown): node is LayoutItemNode {
    return node instanceof LayoutItemNode;
}
