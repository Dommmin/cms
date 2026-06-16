import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { BlogListClient } from '@/components/blog-list-client';
import { PageHeader } from '@/components/composition';
import type { Page } from '@/types/api';

export async function BlogModule({
    page,
    searchParams,
    locale,
}: {
    page: Page;
    searchParams?: { [key: string]: string | string[] | undefined };
    locale: string;
}) {
    const {
        page: pageNum = '1',
        category,
        sort = '-created_at',
    } = (await searchParams) ?? {};

    const perPage = page.module_config?.per_page as number | undefined;

    const params = {
        page: Number(pageNum),
        per_page: perPage,
        category: category as string | undefined,
        sort: sort as string,
        locale,
    };

    const [posts, categories] = await Promise.all([
        getBlogPosts(params),
        getBlogCategories(),
    ]);

    // Calculate the base path for this blog module from the CMS page slug
    const basePath = page.path;

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <PageHeader
                title={page.title}
                description={page.excerpt ?? undefined}
                align="center"
            />
            <BlogListClient
                posts={posts}
                categories={categories}
                params={params}
                basePath={basePath}
            />
        </div>
    );
}
