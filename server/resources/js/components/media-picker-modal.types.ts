export type MediaItem = {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    url: string;
    created_at: string;
};
export type SelectedImage = {
    id: number;
    url: string;
    name: string;
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
    onReorder: (images: SelectedImage[]) => void;
    onRemove: (id: number) => void;
    onSetThumbnail: (id: number) => void;
    selectedImages: SelectedImage[];
    multiple?: boolean;
};
