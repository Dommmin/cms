export interface BlogPostParams {
    page?: number;
    per_page?: number;
    category?: string;
    locale?: string;
    sort?: string;
    search?: string;
}

export const blogKeys = {
    all: ['blog'] as const,
    posts: (params: BlogPostParams) => ['blog', 'posts', params] as const,
    post: (slug: string, locale: string) =>
        ['blog', 'post', slug, locale] as const,
    categories: () => ['blog', 'categories'] as const,
    comments: (slug: string) => ['blog', 'comments', slug] as const,
};
