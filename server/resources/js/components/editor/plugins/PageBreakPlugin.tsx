import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical';
import { type JSX } from 'react';
import { useEffect } from 'react';
import { PageBreakNode, $createPageBreakNode } from '../nodes/PageBreakNode';

export const INSERT_PAGE_BREAK_COMMAND: LexicalCommand<undefined> = createCommand('INSERT_PAGE_BREAK_COMMAND');

export default function PageBreakPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([PageBreakNode])) {
            throw new Error('PageBreakPlugin: PageBreakNode not registered on editor');
        }
        return mergeRegister(
            editor.registerCommand(
                INSERT_PAGE_BREAK_COMMAND,
                () => {
                    $insertNodeToNearestRoot($createPageBreakNode());
                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        );
    }, [editor]);

    return null;
}
