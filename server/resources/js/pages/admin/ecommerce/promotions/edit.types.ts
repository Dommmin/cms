export interface Category {
    id: number;
    name: string | Record<string, string>;
}
export interface Product {
    id: number;
    name: string | Record<string, string>;
    price: number;
}
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
    products: Array<{
        id: number;
        name: string | Record<string, string>;
        pivot: { discount_value: number | null; discount_type: string | null };
    }>;
    categories: Array<{
        id: number;
        name: string | Record<string, string>;
        pivot: { discount_value: number | null; discount_type: string | null };
    }>;
}
export interface FormData {
    name: string;
    slug: string;
    description: string;
    type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
    value: string;
    min_value: string;
    max_discount: string;
    apply_to: 'all' | 'specific_products' | 'specific_categories';
    is_active: boolean;
    is_stackable: boolean;
    priority: string;
    starts_at: string;
    ends_at: string;
    products: Record<string, { discount_value: string; discount_type: string }>;
    categories: Record<
        string,
        { discount_value: string; discount_type: string }
    >;
    metadata: Record<string, string>;
}
