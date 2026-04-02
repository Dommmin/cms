export interface PageProps {
    searchParams: Promise<{ page?: string; category?: string; sort?: string }>;
}
