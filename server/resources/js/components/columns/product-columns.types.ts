export type ProductRow = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
    price: number;
    is_active: boolean;
    is_saleable: boolean;
    category?: { id: number; name: string | Record<string, string> };
    product_type?: { id: number; name: string | Record<string, string> };
    images?: Array<{ url: string }>;
};
