import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical';
import { type JSX } from 'react';
import { useEffect } from 'react';
import { $createImageNode, ImageNode, type ImagePayload } from '../nodes/ImageNode';

export const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload> = createCommand('INSERT_IMAGE_COMMAND');

export default function ImagesPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('ImagesPlugin: ImageNode not registered on editor');
        }

        return mergeRegister(
            editor.registerCommand<ImagePayload>(
                INSERT_IMAGE_COMMAND,
                (payload) => {
                    const imageNode = $createImageNode(payload);
                    $insertNodeToNearestRoot(imageNode);
                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        );
    }, [editor]);

    return null;
}
