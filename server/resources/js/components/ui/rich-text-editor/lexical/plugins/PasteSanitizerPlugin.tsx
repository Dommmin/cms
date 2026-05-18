import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_HIGH, PASTE_COMMAND } from 'lexical';
import { useEffect, type JSX } from 'react';
import { sanitizePastedHtml } from './paste-sanitizer';

export default function PasteSanitizerPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand<ClipboardEvent>(
            PASTE_COMMAND,
            (event) => {
                const html = event.clipboardData?.getData('text/html');
                if (!html) {
                    return false;
                }

                const sanitized = sanitizePastedHtml(html);
                if (!sanitized) {
                    return false;
                }

                event.preventDefault();
                editor.update(() => {
                    const parser = new window.DOMParser();
                    const document = parser.parseFromString(sanitized, 'text/html');
                    const nodes = $generateNodesFromDOM(editor, document);
                    $insertNodes(nodes);
                });

                return true;
            },
            COMMAND_PRIORITY_HIGH,
        );
    }, [editor]);

    return null;
}
