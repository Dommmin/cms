import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical';
import { type JSX } from 'react';
import { useEffect } from 'react';
import { FigmaNode, $createFigmaNode } from '../nodes/FigmaNode';

export const INSERT_FIGMA_COMMAND: LexicalCommand<string> = createCommand('INSERT_FIGMA_COMMAND');

export default function FigmaPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([FigmaNode])) {
            throw new Error('FigmaPlugin: FigmaNode not registered on editor');
        }
        return mergeRegister(
            editor.registerCommand<string>(
                INSERT_FIGMA_COMMAND,
                (payload) => {
                    $insertNodeToNearestRoot($createFigmaNode(payload));
                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        );
    }, [editor]);

    return null;
}
