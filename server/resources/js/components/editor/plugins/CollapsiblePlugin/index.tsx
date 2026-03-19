import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
    $createParagraphNode,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    type LexicalCommand,
} from 'lexical';
import { type JSX } from 'react';
import { useEffect } from 'react';
import {
    $createCollapsibleContainerNode,
    CollapsibleContainerNode,
} from '../../nodes/CollapsibleContainerNode';
import {
    $createCollapsibleContentNode,
    CollapsibleContentNode,
} from '../../nodes/CollapsibleContentNode';
import {
    $createCollapsibleTitleNode,
    CollapsibleTitleNode,
} from '../../nodes/CollapsibleTitleNode';

export const INSERT_COLLAPSIBLE_COMMAND: LexicalCommand<undefined> =
    createCommand('INSERT_COLLAPSIBLE_COMMAND');

export default function CollapsiblePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (
            !editor.hasNodes([
                CollapsibleContainerNode,
                CollapsibleContentNode,
                CollapsibleTitleNode,
            ])
        ) {
            throw new Error('CollapsiblePlugin: Required nodes not registered');
        }
        return mergeRegister(
            editor.registerCommand(
                INSERT_COLLAPSIBLE_COMMAND,
                () => {
                    editor.update(() => {
                        const container = $createCollapsibleContainerNode(true);
                        const title = $createCollapsibleTitleNode();
                        const content = $createCollapsibleContentNode();
                        const paragraph = $createParagraphNode();
                        content.append(paragraph);
                        container.append(title, content);
                        $insertNodeToNearestRoot(container);
                        title.select();
                    });
                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        );
    }, [editor]);

    return null;
}
