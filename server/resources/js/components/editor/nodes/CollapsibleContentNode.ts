import type { EditorConfig, LexicalNode, SerializedElementNode } from 'lexical';
import { $applyNodeReplacement, ElementNode } from 'lexical';

export class CollapsibleContentNode extends ElementNode {
    static getType(): string {
        return 'collapsible-content';
    }

    static clone(node: CollapsibleContentNode): CollapsibleContentNode {
        return new CollapsibleContentNode(node.__key);
    }

    static importJSON(): CollapsibleContentNode {
        return $createCollapsibleContentNode();
    }

    exportJSON(): SerializedElementNode {
        return { ...super.exportJSON(), type: 'collapsible-content', version: 1 };
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.classList.add('collapsible-content');
        return div;
    }

    updateDOM(): false {
        return false;
    }

    isShadowRoot(): boolean {
        return true;
    }

    static importDOM() {
        return null;
    }
}

export function $createCollapsibleContentNode(): CollapsibleContentNode {
    return $applyNodeReplacement(new CollapsibleContentNode());
}

export function $isCollapsibleContentNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleContentNode {
    return node instanceof CollapsibleContentNode;
}
