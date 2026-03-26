import type { SerializedTextNode } from 'lexical';

export type SerializedMentionNode = SerializedTextNode & {
    mentionName: string;
};
