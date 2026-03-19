import type { EditorConfig, NodeKey, SerializedTextNode } from 'lexical';
import { $applyNodeReplacement, TextNode } from 'lexical';

export type UUID = ReturnType<typeof crypto.randomUUID>;

export class AutocompleteNode extends TextNode {
    __uuid: UUID;

    static getType(): string {
        return 'autocomplete';
    }

    static clone(node: AutocompleteNode): AutocompleteNode {
        return new AutocompleteNode(node.__uuid, node.__text, node.__key);
    }

    constructor(uuid: UUID, text?: string, key?: NodeKey) {
        super(text || '', key);
        this.__uuid = uuid;
    }

    static importJSON(_node: SerializedTextNode): AutocompleteNode {
        return $createAutocompleteNode('' as UUID);
    }

    exportJSON(): SerializedTextNode {
        return { ...super.exportJSON(), type: 'autocomplete', version: 1 };
    }

    createDOM(config: EditorConfig): HTMLSpanElement {
        const dom = super.createDOM(config) as HTMLSpanElement;
        dom.className = 'editor-autocomplete';
        return dom;
    }

    updateDOM(
        prevNode: AutocompleteNode,
        dom: HTMLElement,
        config: EditorConfig,
    ): boolean {
        // @ts-expect-error - Lexical TextNode prevNode typing
        return super.updateDOM(prevNode, dom, config);
    }

    static importDOM() {
        return null;
    }
}

export function $createAutocompleteNode(uuid: UUID): AutocompleteNode {
    return $applyNodeReplacement(new AutocompleteNode(uuid));
}
