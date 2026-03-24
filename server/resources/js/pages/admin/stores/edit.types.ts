export type Store = {
    id: number;
    name: string;
    slug: string;
    address: string;
    city: string;
    country: string;
    phone: string | null;
    email: string | null;
    opening_hours: Record<string, string> | null;
    lat: string;
    lng: string;
    is_active: boolean;
};
export type EditProps = {
    store: Store;
};
