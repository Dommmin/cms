import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical';
import { useEffect } from 'react';
import { $createDateNode, DateNode } from '../nodes/DateNode';

export const INSERT_DATE_COMMAND: LexicalCommand<string> = createCommand('INSERT_DATE_COMMAND');

export default function DatePlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([DateNode])) {
            throw new Error('DatePlugin: DateNode not registered on editor');
        }

        return mergeRegister(
            editor.registerCommand<string>(
                INSERT_DATE_COMMAND,
                (isoDate) => {
                    $insertNodeToNearestRoot($createDateNode(isoDate));
                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        );
    }, [editor]);

    return null;
}
