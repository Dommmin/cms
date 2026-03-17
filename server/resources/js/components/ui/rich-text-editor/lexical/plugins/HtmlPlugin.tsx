import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $createParagraphNode, $getRoot, $isDecoratorNode, $isElementNode } from 'lexical';
import { useEffect, useRef, type JSX } from 'react';

interface HtmlPluginProps {
    value?: string;
    onChange?: (html: string) => void;
}

export default function HtmlPlugin({ value, onChange }: HtmlPluginProps): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const lastSyncedValue = useRef<string>('');

    useEffect(() => {
        if (typeof value !== 'string' || value === lastSyncedValue.current || typeof window === 'undefined') {
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
                // Text/inline nodes can't be direct root children — wrap in paragraph
                const para = $createParagraphNode();
                para.append(node);
                return para;
            });
            root.append(...safeNodes);
        });

        lastSyncedValue.current = value;
    }, [editor, value]);

    return (
        <OnChangePlugin
            onChange={() => {
                if (!onChange) {
                    return;
                }

                editor.read(() => {
                    const html = $generateHtmlFromNodes(editor);
                    lastSyncedValue.current = html;
                    onChange(html);
                });
            }}
            ignoreSelectionChange
            ignoreHistoryMergeTagChange
        />
    );
}
