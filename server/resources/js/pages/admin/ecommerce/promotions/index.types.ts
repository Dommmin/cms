export interface Promotion {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
    value: number | null;
    min_value: number | null;
    max_discount: number | null;
    apply_to: 'all' | 'specific_products' | 'specific_categories';
    is_active: boolean;
    is_stackable: boolean;
    priority: number;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    products: Array<{ id: number; name: string }>;
    categories: Array<{ id: number; name: string }>;
}
export interface PaginatedPromotions {
    data: Promotion[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    links: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: any;
}
