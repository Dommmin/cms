export type Menu = {
    id: number;
    name: string;
    location: string | null;
    is_active: boolean;
    all_items_count: number;
    created_at: string;
};
export type MenusData = {
    data: Menu[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    menus: MenusData;
    filters: { search?: string; location?: string; is_active?: string };
    locations: { value: string; label: string }[];
};
