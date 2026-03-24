import type {
    EditorConfig,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';

export type SerializedTweetNode = Spread<{ id: string }, SerializedLexicalNode>;
