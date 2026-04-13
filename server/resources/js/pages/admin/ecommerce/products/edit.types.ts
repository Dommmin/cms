export type Category = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
};
export type ProductType = { id: number; name: string };
export type Brand = { id: number; name: string };
export type ProductFlag = {
    id: number;
    name: string;
    color: string;
    description?: string | null;
};
export type FormErrors = Record<string, string>;
export type TabKey =
    | 'general'
    | 'pricing'
    | 'media'
    | 'metadata'
    | 'price_history';
export type ProductVariant = {
    id?: number;
    sku: string;
    name: string;
    price: number;
    cost_price: number;
    compare_at_price?: number;
    weight: number;
    stock_quantity: number;
    stock_threshold: number;
    is_active: boolean;
    is_default: boolean;
    position: number;
};
export type ProductImage = {
    id: number;
    media_id: number;
    url: string;
    name: string;
    is_thumbnail: boolean;
    position: number;
};
export type PriceHistoryEntry = {
    id: number;
    price: number;
    recorded_at: string;
};
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
    is_search_promoted: boolean;
    seo_title: string;
    seo_description: string;
    meta_robots: string;
    og_image: string | null;
    sitemap_exclude: boolean;
    flags: number[];
    variant: ProductVariant;
    categories: number[];
};
