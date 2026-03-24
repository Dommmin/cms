export type Customer = {
    id: number;
    name: string;
    email: string;
};
export type Product = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
    thumbnail?: string;
};
export type Review = {
    id: number;
    product: Product;
    customer?: Customer;
    rating: number;
    title?: string;
    body: string;
    status: string;
    helpful_count: number;
    pros?: string;
    cons?: string;
    created_at: string;
    updated_at: string;
};
export type ShowProps = { review: Review };
