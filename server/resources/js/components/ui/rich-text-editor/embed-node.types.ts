import type { SerializedLexicalNode, Spread } from 'lexical';

export type EmbedPlatform = 'youtube' | 'vimeo' | 'spotify' | 'loom' | 'tiktok';

export type EmbedDefinition = {
    platform: EmbedPlatform;
    sourceUrl: string;
    embedUrl: string;
    label: string;
};

export type SerializedEmbedNode = Spread<
    EmbedDefinition,
    SerializedLexicalNode
>;
