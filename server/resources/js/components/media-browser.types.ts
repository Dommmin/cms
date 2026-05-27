export type ViewMode = 'grid' | 'list';
export type ThumbnailSize = 'small' | 'medium' | 'large';
export type MediaPickerMode = 'image' | 'gallery' | 'file' | 'video' | 'any';

export type MediaCropVariant = {
    id: number;
    url: string;
    label: string;
    variant: string;
    width: number | null;
    height: number | null;
    focal_point?: { x: number; y: number } | null;
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
    crop_of?: string | number | null;
    crop_params?: Record<string, unknown> | null;
    crop_variant?: string | null;
    crop_variants?: MediaCropVariant[];
    focal_point?: { x: number; y: number } | null;
    created_at: string;
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

export type MediaBrowserProps = {
    onItemClick?: (item: MediaItem) => void;
    selectedIds?: number[];
    mode?: MediaPickerMode;
    acceptedMimeTypes?: string[];
    onUploaded?: (items: MediaItem[]) => void;
    className?: string;
};
