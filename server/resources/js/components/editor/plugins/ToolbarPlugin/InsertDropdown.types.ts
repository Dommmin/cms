export type MediaItem = {
    id: number;
    name: string;
    mime_type: string;
    url: string;
};
export type MediaResponse = {
    data: MediaItem[];
    next_page_url: string | null;
    prev_page_url: string | null;
    current_page: number;
    last_page: number;
};
export type ModalType =
    | 'date'
    | 'image'
    | 'table'
    | 'youtube'
    | 'tweet'
    | 'figma'
    | 'columns'
    | null;
export interface InsertDropdownProps {
    disabled?: boolean;
}
