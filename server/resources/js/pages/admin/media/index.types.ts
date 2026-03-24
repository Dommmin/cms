export type MediaCustomProperties = {
    alt?: string;
    caption?: string;
    description?: string;
    author?: string;
};
export type MediaItem = {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    url: string;
    thumbnail_url: string | null;
    custom_properties: MediaCustomProperties | null;
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
export type MetaForm = {
    alt: string;
    caption: string;
    description: string;
    author: string;
};
