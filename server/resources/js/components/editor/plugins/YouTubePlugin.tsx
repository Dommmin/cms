import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    type LexicalCommand,
} from 'lexical';
import { type JSX } from 'react';
import { useEffect } from 'react';
import { YouTubeNode, $createYouTubeNode } from '../nodes/YouTubeNode';

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand(
    'INSERT_YOUTUBE_COMMAND',
);

export default function YouTubePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([YouTubeNode])) {
            throw new Error(
                'YouTubePlugin: YouTubeNode not registered on editor',
            );
        }
        return mergeRegister(
            editor.registerCommand<string>(
                INSERT_YOUTUBE_COMMAND,
                (payload) => {
                    $insertNodeToNearestRoot($createYouTubeNode(payload));
                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        );
    }, [editor]);

    return null;
}
