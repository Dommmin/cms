import type {
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread,
} from 'lexical';
import { $applyNodeReplacement, ElementNode } from 'lexical';

export type SerializedCollapsibleContainerNode = Spread<
    { open: boolean },
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

    static importJSON(node: SerializedCollapsibleContainerNode): CollapsibleContainerNode {
        return $createCollapsibleContainerNode(node.open);
    }

    exportJSON(): SerializedCollapsibleContainerNode {
        return {
            ...super.exportJSON(),
            type: 'collapsible-container',
            version: 1,
            open: this.__open,
        };
    }

    createDOM(config: EditorConfig, _editor: LexicalEditor): HTMLElement {
        const details = document.createElement('details');
        details.classList.add('collapsible-container');
        details.open = this.__open;
        details.addEventListener('toggle', (_event: Event) => {
            const open = details.open;
            if (open !== this.getOpen()) {
                _editor.update(() => {
                    const node = this.getLatest();
                    node.setOpen(open);
                });
            }
        });
        return details;
    }

    updateDOM(prevNode: CollapsibleContainerNode, dom: HTMLDetailsElement): boolean {
        if (prevNode.__open !== this.__open) dom.open = this.__open;
        return false;
    }

    setOpen(open: boolean): void {
        this.getWritable().__open = open;
    }

    getOpen(): boolean {
        return this.getLatest().__open;
    }

    toggleOpen(): void {
        this.setOpen(!this.getOpen());
    }

    static importDOM() {
        return null;
    }
}

export function $createCollapsibleContainerNode(open: boolean): CollapsibleContainerNode {
    return $applyNodeReplacement(new CollapsibleContainerNode(open));
}

export function $isCollapsibleContainerNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleContainerNode {
    return node instanceof CollapsibleContainerNode;
}
