import type { SerializedLexicalNode, Spread } from 'lexical';

export type EmbedPlatform =
    | 'youtube'
    | 'vimeo'
    | 'spotify'
    | 'loom'
    | 'tiktok'
    | 'instagram'
    | 'twitter';

export type EmbedRenderMode = 'iframe' | 'link';

export type EmbedDefinition = {
    platform: EmbedPlatform;
    sourceUrl: string;
    embedUrl: string | null;
    label: string;
    renderMode: EmbedRenderMode;
};

export type SerializedEmbedNode = Spread<
    Omit<EmbedDefinition, 'renderMode'> & {
        renderMode?: EmbedRenderMode;
    },
    SerializedLexicalNode
>;
