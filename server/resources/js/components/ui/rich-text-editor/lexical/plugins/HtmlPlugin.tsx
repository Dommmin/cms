import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { CLEAR_HISTORY_COMMAND, $createParagraphNode, $getRoot, $isDecoratorNode, $isElementNode } from 'lexical';
import { useCallback, useEffect, useRef, type JSX } from 'react';
import type { HtmlPluginProps } from './HtmlPlugin.types';

const DEBOUNCE_MS = 200;

export default function HtmlPlugin({ value, onChange, instanceKey }: HtmlPluginProps): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const lastSyncedValue = useRef<string>('');
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (typeof value !== 'string' || typeof window === 'undefined') {
            return;
        }

        // When instanceKey changes (e.g. locale switch), always reset the editor.
        // Otherwise skip if the value matches what we last synced — prevents
        // overwriting mid-typing content when the parent re-renders.
        const isSameValue = value === lastSyncedValue.current;
        if (isSameValue && !instanceKey) {
            return;
        }

        // Don't overwrite if the editor has focus and value hasn't changed externally.
        if (editor.isEditable() && editor.getRootElement()?.contains(document.activeElement) && isSameValue) {
            return;
        }

        editor.update(() => {
            const root = $getRoot();
            root.clear();

            if (value.trim().length === 0) {
                root.append($createParagraphNode());
                return;
            }

            const parser = new window.DOMParser();
            const document = parser.parseFromString(value, 'text/html');
            const importedNodes = $generateNodesFromDOM(editor, document);

            if (importedNodes.length === 0) {
                root.append($createParagraphNode());
                return;
            }

            const safeNodes = importedNodes.map((node) => {
                if ($isElementNode(node) || $isDecoratorNode(node)) {
                    return node;
                }
                const para = $createParagraphNode();
                para.append(node);
                return para;
            });
            root.append(...safeNodes);
        });

        if (instanceKey) {
            editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
        }

        lastSyncedValue.current = value;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, value, instanceKey]);

    const handleChange = useCallback(() => {
        if (!onChange) {
            return;
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            editor.read(() => {
                const html = $generateHtmlFromNodes(editor);
                lastSyncedValue.current = html;
                onChange(html);
            });
        }, DEBOUNCE_MS);
    }, [editor, onChange]);

    return (
        <OnChangePlugin
            onChange={handleChange}
            ignoreSelectionChange
            ignoreHistoryMergeTagChange
        />
    );
}
