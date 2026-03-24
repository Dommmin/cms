export type Category = { id: number; name: string; slug: string };
export type ProductType = { id: number; name: string };
export type Brand = { id: number; name: string };
export type ProductFlag = {
    id: number;
    name: string;
    color: string;
    description?: string | null;
};
export type FormErrors = Record<string, string>;
export type TabKey = 'general' | 'pricing' | 'media' | 'metadata';
export type FormData = {
    name: Record<string, string>;
    slug: string;
    description: Record<string, string>;
    short_description: Record<string, string>;
    sku_prefix: string;
    category_id: string | number | null;
    product_type_id: string | number | null;
    brand_id: string | number | null;
    is_active: boolean;
    is_saleable: boolean;
    seo_title: string;
    seo_description: string;
    flags: number[];
    variant: {
        sku: string;
        name: string;
        price: string;
        cost_price: string;
        compare_at_price: string;
        weight: string;
        stock_quantity: string;
        stock_threshold: string;
        is_active: boolean;
    };
    categories: number[];
};
