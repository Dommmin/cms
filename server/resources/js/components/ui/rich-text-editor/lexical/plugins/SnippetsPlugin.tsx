import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical';
import { useEffect, type JSX } from 'react';
import { sanitizeSnippetHtml } from './snippets-storage';

export const INSERT_SNIPPET_COMMAND: LexicalCommand<string> = createCommand('INSERT_SNIPPET_COMMAND');

export default function SnippetsPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            INSERT_SNIPPET_COMMAND,
            (html) => {
                const sanitized = sanitizeSnippetHtml(html);
                if (sanitized.trim() === '') return true;

                const parser = new DOMParser();
                const document = parser.parseFromString(sanitized, 'text/html');
                const nodes = $generateNodesFromDOM(editor, document);

                if (nodes.length === 0) return true;

                $insertNodes(nodes);

                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    return null;
}
