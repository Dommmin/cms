export type MediaPickerMode = 'image' | 'gallery' | 'file' | 'video' | 'any';

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

export type MediaItem = {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    url: string;
    alt?: string;
    caption?: string | null;
    description?: string | null;
    credit?: string | null;
    width?: number | null;
    height?: number | null;
    thumb_url?: string | null;
    thumbnail_url?: string | null;
    created_at: string;
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
export type MediaData = {
    data: MediaItem[];
    prev_page_url: string | null;
    next_page_url: string | null;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
export type MediaPickerModalProps = {
    open: boolean;
    onClose: () => void;
    onSelect: (media: MediaItem) => void;
    onConfirm?: (items: SelectedImage[]) => void;
    onReorder?: (images: SelectedImage[]) => void;
    onRemove?: (id: number) => void;
    onSetThumbnail?: (id: number) => void;
    selectedImages?: SelectedImage[];
    selectedItems?: SelectedImage[];
    multiple?: boolean;
    mode?: MediaPickerMode;
    acceptedMimeTypes?: string[];
};
