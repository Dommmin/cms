export type {
    MediaItem,
    MediaData,
    MediaPickerMode,
    MediaCropVariant,
    ViewMode,
    ThumbnailSize,
} from '@/components/media-browser.types';

export type RteMediaAsset = {
    mediaId: number | null;
    src: string;
    alt: string;
    caption: string | null;
    credit: string | null;
    mimeType: string;
    width: number | null;
    height: number | null;
    focalPoint: { x: number; y: number } | null;
};

export type SelectedImage = {
    id: number;
    url: string;
    name: string;
    mime_type?: string;
    alt?: string;
    caption?: string | null;
    file_name?: string;
    size?: number;
    width?: number | null;
    height?: number | null;
    thumb_url?: string | null;
    is_thumbnail: boolean;
};

export type MediaPickerModalProps = {
    open: boolean;
    onClose: () => void;
    onSelect: (media: import('@/components/media-browser.types').MediaItem) => void;
    onConfirm?: (items: SelectedImage[]) => void;
    onReorder?: (images: SelectedImage[]) => void;
    onRemove?: (id: number) => void;
    onSetThumbnail?: (id: number) => void;
    selectedImages?: SelectedImage[];
    selectedItems?: SelectedImage[];
    multiple?: boolean;
    mode?: import('@/components/media-browser.types').MediaPickerMode;
    acceptedMimeTypes?: string[];
};