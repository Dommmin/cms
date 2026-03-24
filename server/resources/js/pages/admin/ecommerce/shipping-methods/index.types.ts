export type ShippingMethod = {
    id: number;
    name: string;
    carrier: string;
    base_price: number;
    price_per_kg: number;
    is_active: boolean;
    shipments_count: number;
};
export type MethodsData = {
    data: ShippingMethod[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    methods: MethodsData;
    filters: { search?: string; is_active?: string; carrier?: string };
};
