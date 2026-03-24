export type ReviewRow = {
    id: number;
    product: {
        id: number;
        name: string | Record<string, string>;
        slug: string;
    };
    customer?: { id: number; name: string; email: string };
    rating: number;
    title?: string;
    body: string;
    status: string;
    helpful_count: number;
    created_at: string;
};
