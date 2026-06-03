import { serverFetch } from '@/lib/server-fetch';
import type {
    BlogCategory,
    BlogPost,
    Brand,
    Category,
    CategoryShowResponse,
    Faq,
    Menu,
    Page,
    PaginatedResponse,
    StorefrontRoutes,
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

export async function getSystemPage(
    systemPageKey: string,
    locale?: string,
): Promise<Page> {
    return serverFetch<Page>(`/pages/system/${systemPageKey}`, {
        locale,
        revalidate: 60,
        tags: [`system-page:${systemPageKey}`],
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
    const response = await serverFetch<{ data: Category[] }>('/categories', {
        revalidate: 120,
        tags: ['categories'],
    });

    return response.data;
}

export async function getCategory(slug: string): Promise<CategoryShowResponse> {
    return serverFetch<CategoryShowResponse>(`/categories/${slug}`, {
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
        revalidate: 30,
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

export async function getBrand(slug: string): Promise<Brand> {
    return serverFetch<Brand>(`/brands/${slug}`, {
        revalidate: 120,
        tags: [`brand:${slug}`],
    });
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

export async function getFaqs(): Promise<Faq[]> {
    return serverFetch<Faq[]>('/faqs', { revalidate: 300, tags: ['faqs'] });
}

export async function getStorefrontRoutes(
    locale?: string,
): Promise<StorefrontRoutes> {
    return serverFetch<StorefrontRoutes>('/storefront/routes', {
        locale,
        revalidate: 300,
        tags: ['storefront-routes'],
    });
}
