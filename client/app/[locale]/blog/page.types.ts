export interface PageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ page?: string; category?: string; sort?: string }>;
}
