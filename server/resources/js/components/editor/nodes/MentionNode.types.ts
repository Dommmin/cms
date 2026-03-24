import type { EditorConfig, NodeKey, SerializedTextNode } from 'lexical';

export type SerializedMentionNode = SerializedTextNode & {
    mentionName: string;
};
