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
    $createLayoutContainerNode,
    LayoutContainerNode,
} from '../../nodes/LayoutContainerNode';
import {
    $createLayoutItemNode,
    LayoutItemNode,
} from '../../nodes/LayoutItemNode';

export const INSERT_LAYOUT_COMMAND: LexicalCommand<string> = createCommand(
    'INSERT_LAYOUT_COMMAND',
);

export default function LayoutPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([LayoutContainerNode, LayoutItemNode])) {
            throw new Error(
                'LayoutPlugin: LayoutContainerNode/LayoutItemNode not registered',
            );
        }
        return mergeRegister(
            editor.registerCommand<string>(
                INSERT_LAYOUT_COMMAND,
                (payload) => {
                    editor.update(() => {
                        const container = $createLayoutContainerNode(payload);
                        const itemsCount = payload.split(' ').length;
                        for (let i = 0; i < itemsCount; i++) {
                            const item = $createLayoutItemNode();
                            item.append($createParagraphNode());
                            container.append(item);
                        }
                        $insertNodeToNearestRoot(container);
                    });
                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        );
    }, [editor]);

    return null;
}
