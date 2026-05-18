import type { LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';

export type GalleryImage = {
    mediaId: number | null;
    src: string;
    alt: string;
    caption: string | null;
    width: number | null;
    height: number | null;
    focalPoint: { x: number; y: number } | null;
};

export type SerializedImageGalleryNode = Spread<
    {
        images: GalleryImage[];
        columns: number;
        mobileColumns?: number;
        gap?: 'compact' | 'normal' | 'wide';
        aspectRatio?: 'square' | '4:3' | '16:9' | 'natural';
        lightbox?: boolean;
    },
    SerializedLexicalNode
>;

export type ImageGalleryComponentProps = {
    images: GalleryImage[];
    columns: number;
    nodeKey: NodeKey;
    editor: LexicalEditor;
};
