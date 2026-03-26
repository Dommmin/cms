import type { SerializedLexicalNode, Spread } from 'lexical';

export type SerializedTweetNode = Spread<{ id: string }, SerializedLexicalNode>;
