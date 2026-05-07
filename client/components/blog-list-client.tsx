'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useBlogCategories, useBlogPosts } from '@/hooks/use-blog';
import { useLocalePath } from '@/hooks/use-locale';
import type { BlogListClientProps } from './blog-list-client.types';

const SORT_OPTIONS = [
    { value: '-created_at', label: 'Newest' },
    { value: 'popular', label: 'Most popular' },
    { value: 'top_rated', label: 'Top rated' },
];

export function BlogListClient({ params }: BlogListClientProps) {
    const lp = useLocalePath();
    const { page = 1, category, sort = '-created_at', locale } = params;

    const { data: posts, isLoading: postsLoading } = useBlogPosts(params);
    const { data: categories = [] } = useBlogCategories();

    const buildUrl = (
        overrides: Record<string, string | number | undefined>,
    ) => {
        const urlParams = new URLSearchParams();
        const merged = { page, category, sort, ...overrides };
        if (merged.page && merged.page !== 1 && merged.page !== '1')
            urlParams.set('page', String(merged.page));
        if (merged.category) urlParams.set('category', String(merged.category));
        if (merged.sort && merged.sort !== '-created_at')
            urlParams.set('sort', String(merged.sort));
        const qs = urlParams.toString();
        return lp(`/blog${qs ? `?${qs}` : ''}`);
    };

    if (postsLoading && !posts) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold">Blog</h1>
                    <p className="text-muted-foreground mt-2">
                        Articles, news and inspiration
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="border-border bg-card overflow-hidden rounded-xl border"
                        >
                            <div className="bg-muted aspect-video animate-pulse" />
                            <div className="flex flex-col gap-2 p-4">
                                <div className="bg-muted h-3 w-16 animate-pulse rounded" />
                                <div className="bg-muted h-5 w-full animate-pulse rounded" />
                                <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
                                <div className="bg-muted mt-2 h-3 w-24 animate-pulse rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!posts) {
        return (
            <div className="text-muted-foreground py-24 text-center">
                Could not load blog posts.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold">Blog</h1>
                <p className="text-muted-foreground mt-2">
                    Articles, news and inspiration
                </p>
            </div>

            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={buildUrl({ category: undefined, page: 1 })}
                            className={`rounded-full border px-4 py-1 text-sm font-medium transition-colors ${
                                !category
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-input hover:bg-accent'
                            }`}
                        >
                            All
                        </Link>
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={buildUrl({
                                    category: cat.slug,
                                    page: 1,
                                })}
                                className={`rounded-full border px-4 py-1 text-sm font-medium transition-colors ${
                                    category === cat.slug
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-input hover:bg-accent'
                                }`}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Sort:</span>
                    <div className="flex gap-1">
                        {SORT_OPTIONS.map((opt) => (
                            <Link
                                key={opt.value}
                                href={buildUrl({ sort: opt.value, page: 1 })}
                                className={`rounded-md px-3 py-1 transition-colors ${
                                    sort === opt.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'border-input hover:bg-accent border'
                                }`}
                            >
                                {opt.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {posts.data.length === 0 ? (
                <div className="text-muted-foreground py-24 text-center">
                    No posts found.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.data.map((post) => (
                            <Link
                                key={post.id}
                                href={lp(`/blog/${post.slug}`)}
                                className="group border-border bg-card flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-lg"
                            >
                                {post.featured_image ? (
                                    <div className="bg-muted relative aspect-video overflow-hidden">
                                        <Image
                                            src={post.featured_image}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-muted aspect-video" />
                                )}
                                <div className="flex flex-col gap-2 p-4">
                                    {post.category && (
                                        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                            {post.category.name}
                                        </span>
                                    )}
                                    <h2 className="group-hover:text-primary line-clamp-2 leading-snug font-semibold">
                                        {post.title}
                                    </h2>
                                    {post.excerpt && (
                                        <p className="text-muted-foreground line-clamp-3 text-sm">
                                            {post.excerpt}
                                        </p>
                                    )}
                                    <p className="text-muted-foreground mt-auto pt-2 text-xs">
                                        {post.published_at
                                            ? new Date(
                                                  post.published_at,
                                              ).toLocaleDateString('en-US', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : ''}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {posts.meta.last_page > 1 && (
                        <nav
                            aria-label="Blog pagination"
                            className="mt-10 flex justify-center gap-2"
                        >
                            {Array.from(
                                { length: posts.meta.last_page },
                                (_, i) => i + 1,
                            ).map((p) => (
                                <Link
                                    key={p}
                                    href={buildUrl({ page: p })}
                                    aria-current={
                                        p === posts.meta.current_page
                                            ? 'page'
                                            : undefined
                                    }
                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ${
                                        p === posts.meta.current_page
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border-input hover:bg-accent border'
                                    }`}
                                >
                                    {p}
                                </Link>
                            ))}
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}
