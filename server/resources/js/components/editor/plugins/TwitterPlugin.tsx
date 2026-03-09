import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical';
import { type JSX } from 'react';
import { useEffect } from 'react';
import { TweetNode, $createTweetNode } from '../nodes/TweetNode';

export const INSERT_TWEET_COMMAND: LexicalCommand<string> = createCommand('INSERT_TWEET_COMMAND');

export default function TwitterPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([TweetNode])) {
            throw new Error('TwitterPlugin: TweetNode not registered on editor');
        }
        return mergeRegister(
            editor.registerCommand<string>(
                INSERT_TWEET_COMMAND,
                (payload) => {
                    $insertNodeToNearestRoot($createTweetNode(payload));
                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        );
    }, [editor]);

    return null;
}
