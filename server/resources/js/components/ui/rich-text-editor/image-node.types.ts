import type { DOMExportOutput, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';

export type ImageAlign = 'none' | 'left' | 'center' | 'right';
export type ImageLayout = 'inline' | 'block' | 'wide' | 'full';
export type ImageWrap = 'none' | 'wrap-left' | 'wrap-right';
export type ImageSizePreset = 'small' | 'medium' | 'large' | 'full' | 'custom';
export type ImageLoading = 'lazy' | 'eager';

export type ImageFocalPoint = {
    x: number;
    y: number;
};

export type SerializedImageNode = Spread<
    {
        src: string;
        altText: string;
        width?: string;
        align: ImageAlign;
        mediaId?: number | null;
        caption?: string | null;
        credit?: string | null;
        layout?: ImageLayout;
        wrap?: ImageWrap;
        sizePreset?: ImageSizePreset;
        focalPoint?: ImageFocalPoint | null;
        decorative?: boolean;
        linkUrl?: string | null;
        loading?: ImageLoading;
    },
    SerializedLexicalNode
>;

export type CreateImageNodePayload = {
    src: string;
    altText: string;
    width?: string;
    align?: ImageAlign;
    mediaId?: number | null;
    caption?: string | null;
    credit?: string | null;
    layout?: ImageLayout;
    wrap?: ImageWrap;
    sizePreset?: ImageSizePreset;
    focalPoint?: ImageFocalPoint | null;
    decorative?: boolean;
    linkUrl?: string | null;
    loading?: ImageLoading;
};

export type ImageNodeState = Required<Omit<CreateImageNodePayload, 'width' | 'mediaId' | 'caption' | 'credit' | 'focalPoint' | 'linkUrl'>> & {
    width?: string;
    mediaId: number | null;
    caption: string | null;
    credit: string | null;
    focalPoint: ImageFocalPoint | null;
    linkUrl: string | null;
};

export type ImageComponentProps = ImageNodeState & {
    nodeKey: NodeKey;
    editor: LexicalEditor;
};

export type ImageNodeDomState = ImageNodeState & {
    element: HTMLElement;
    image: HTMLImageElement;
};

export type ImageExportResult = DOMExportOutput & {
    element: HTMLElement;
};
