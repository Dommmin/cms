import type { EditorConfig, LexicalEditor, LexicalNode, SerializedElementNode } from 'lexical';
import { $applyNodeReplacement, ElementNode } from 'lexical';

export class CollapsibleTitleNode extends ElementNode {
    static getType(): string {
        return 'collapsible-title';
    }

    static clone(node: CollapsibleTitleNode): CollapsibleTitleNode {
        return new CollapsibleTitleNode(node.__key);
    }

    static importJSON(): CollapsibleTitleNode {
        return $createCollapsibleTitleNode();
    }

    exportJSON(): SerializedElementNode {
        return { ...super.exportJSON(), type: 'collapsible-title', version: 1 };
    }

    createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
        const summary = document.createElement('summary');
        summary.classList.add('collapsible-title');
        return summary;
    }

    updateDOM(): false {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collapseAtStart(_selection: any): boolean {
        return true;
    }

    static importDOM() {
        return null;
    }
}

export function $createCollapsibleTitleNode(): CollapsibleTitleNode {
    return $applyNodeReplacement(new CollapsibleTitleNode());
}

export function $isCollapsibleTitleNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleTitleNode {
    return node instanceof CollapsibleTitleNode;
}
