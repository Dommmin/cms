import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import type { DOMConversionMap, DOMExportOutput, EditorConfig, SerializedLexicalNode } from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import { $getNodeByKey, CLICK_COMMAND, COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from 'lexical';
import { type JSX } from 'react';
import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
// $isPageBreakNode defined below in this file

function PageBreakComponent({ nodeKey }: { nodeKey: string }) {
    const [editor] = useLexicalComposerContext();
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

    const onDelete = useCallback(
        (event: KeyboardEvent) => {
            event.preventDefault();
            if (isSelected) {
                editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if ($isPageBreakNode(node)) node.remove();
                });
                return true;
            }
            return false;
        },
        [editor, isSelected, nodeKey],
    );

    useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                CLICK_COMMAND,
                (event: MouseEvent) => {
                    const pbElem = editor.getElementByKey(nodeKey);
                    if (event.target === pbElem) {
                        if (!event.shiftKey) clearSelection();
                        setSelected(!isSelected);
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
            editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
        );
    }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);

    return (
        <div
            className={cn(
                'editor-page-break my-4 flex items-center gap-3',
                isSelected && 'rounded outline outline-2 outline-primary outline-offset-2',
            )}
        >
            <div className="flex-1 border-t-2 border-dashed border-border" />
            <span className="rounded border border-dashed border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Page Break
            </span>
            <div className="flex-1 border-t-2 border-dashed border-border" />
        </div>
    );
}

export class PageBreakNode extends DecoratorNode<JSX.Element> {
    static getType(): string {
        return 'page-break';
    }

    static clone(node: PageBreakNode): PageBreakNode {
        return new PageBreakNode(node.__key);
    }

    static importJSON(_node: SerializedLexicalNode): PageBreakNode {
        return $createPageBreakNode();
    }

    exportJSON(): SerializedLexicalNode {
        return { type: 'page-break', version: 1 };
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.className = 'editor-page-break';
        return div;
    }

    updateDOM(): false {
        return false;
    }

    static importDOM(): DOMConversionMap {
        return {
            figure: (node: HTMLElement) =>
                node.className === 'editor-page-break'
                    ? { conversion: () => ({ node: $createPageBreakNode() }), priority: 1 }
                    : null,
        };
    }

    decorate(): JSX.Element {
        return <PageBreakComponent nodeKey={this.__key} />;
    }
}

export function $createPageBreakNode(): PageBreakNode {
    return $applyNodeReplacement(new PageBreakNode());
}

export function $isPageBreakNode(node: unknown): node is PageBreakNode {
    return node instanceof PageBreakNode;
}
