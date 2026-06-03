import type { BlogCategory, BlogPost, PaginatedResponse } from '@/types/api';

export interface BlogListParams {
    page?: number;
    category?: string;
    sort?: string;
    locale: string;
}

export interface BlogListClientProps {
    posts: PaginatedResponse<BlogPost>;
    categories: BlogCategory[];
    params: BlogListParams;
    basePath: string;
}
