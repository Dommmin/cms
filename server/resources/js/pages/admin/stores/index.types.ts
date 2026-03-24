export type Store = {
    id: number;
    name: string;
    slug: string;
    address: string;
    city: string;
    country: string;
    lat: string;
    lng: string;
    is_active: boolean;
    created_at: string;
};
export type StoresData = {
    data: Store[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    stores: StoresData;
    filters: { search?: string };
};
