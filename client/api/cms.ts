import { serverFetch } from '@/lib/server-fetch';
import type {
    BlogCategory,
    BlogPost,
    Brand,
    Category,
    Faq,
    Menu,
    Page,
    PaginatedResponse,
} from '@/types/api';

// ── Pages ─────────────────────────────────────────────────────────────────────

export async function getPage(
    slug: string,
    locale?: string,
    previewToken?: string,
): Promise<Page> {
    const path = previewToken
        ? `/pages/${slug}?preview_token=${encodeURIComponent(previewToken)}`
        : `/pages/${slug}`;
    return serverFetch<Page>(path, {
        locale,
        revalidate: previewToken ? false : 60,
        tags: previewToken ? undefined : [`page:${slug}`],
    });
}

// ── Menus ─────────────────────────────────────────────────────────────────────

export async function getMenu(
    location: string,
    locale?: string,
): Promise<Menu> {
    return serverFetch<Menu>(`/menus/${location}`, {
        locale,
        revalidate: 300,
        tags: [`menu:${location}`],
    });
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
    return serverFetch<Category[]>('/categories', {
        revalidate: 120,
        tags: ['categories'],
    });
}

export async function getCategory(slug: string): Promise<Category> {
    return serverFetch<Category>(`/categories/${slug}`, {
        revalidate: 120,
        tags: [`category:${slug}`],
    });
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export async function getBlogPosts(
    params: {
        page?: number;
        per_page?: number;
        category?: string;
        locale?: string;
        sort?: string;
    } = {},
): Promise<PaginatedResponse<BlogPost>> {
    const { locale, ...rest } = params;
    const query = new URLSearchParams(
        Object.fromEntries(
            Object.entries(rest)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, String(v)]),
        ),
    ).toString();
    return serverFetch<PaginatedResponse<BlogPost>>(
        `/blog/posts${query ? `?${query}` : ''}`,
        {
            locale,
            revalidate: 120,
            tags: ['blog-posts'],
        },
    );
}

export async function getBlogPost(
    slug: string,
    locale?: string,
): Promise<BlogPost> {
    return serverFetch<BlogPost>(`/blog/posts/${slug}`, {
        locale,
        revalidate: 300,
        tags: [`blog-post:${slug}`],
    });
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
    return serverFetch<BlogCategory[]>('/blog/categories', {
        revalidate: 300,
        tags: ['blog-categories'],
    });
}

// ── Brands ────────────────────────────────────────────────────────────────────

export async function getBrands(): Promise<Brand[]> {
    return serverFetch<Brand[]>('/brands', {
        revalidate: 300,
        tags: ['brands'],
    });
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

export async function getFaqs(): Promise<Faq[]> {
    return serverFetch<Faq[]>('/faqs', { revalidate: 300, tags: ['faqs'] });
}
