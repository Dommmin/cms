import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { BlogListClient } from '@/components/blog-list-client';
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
    const basePath = `/${page.slug}`;

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <header className="mb-12 text-center">
                <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
                    {page.title}
                </h1>
                {page.excerpt && (
                    <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
                        {page.excerpt}
                    </p>
                )}
            </header>
            <BlogListClient
                posts={posts}
                categories={categories}
                params={params}
                basePath={basePath}
            />
        </div>
    );
}
