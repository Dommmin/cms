import Image from 'next/image';
import Link from 'next/link';

import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { BackToTop } from '@/components/back-to-top';
import { localePath } from '@/lib/i18n';

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'top_rated', label: 'Top rated' },
];

export async function BlogListView({
  locale,
  page,
  category,
  sort = '-created_at',
}: {
  locale: string;
  page: string;
  category?: string;
  sort?: string;
}) {
  const lp = (path: string) => localePath(locale, path);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { page, category, sort, ...overrides };
    if (merged.page && merged.page !== '1') params.set('page', merged.page);
    if (merged.category) params.set('category', merged.category);
    if (merged.sort && merged.sort !== '-created_at') params.set('sort', merged.sort);
    const qs = params.toString();
    return lp(`/blog${qs ? `?${qs}` : ''}`);
  };

  let posts;
  let categories;
  try {
    [posts, categories] = await Promise.all([
      getBlogPosts({ page: Number(page), category, locale, sort }),
      getBlogCategories(),
    ]);
  } catch {
    return (
      <div className="text-muted-foreground py-24 text-center">Could not load blog posts.</div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="text-muted-foreground mt-2">Articles, news and inspiration</p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildUrl({ category: undefined, page: '1' })}
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
                href={buildUrl({ category: cat.slug, page: '1' })}
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
                href={buildUrl({ sort: opt.value, page: '1' })}
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
        <div className="text-muted-foreground py-24 text-center">No posts found.</div>
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
                    <p className="text-muted-foreground line-clamp-3 text-sm">{post.excerpt}</p>
                  )}
                  <p className="text-muted-foreground mt-auto pt-2 text-xs">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('en-US', {
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
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: posts.meta.last_page }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ${
                    p === posts.meta.current_page
                      ? 'bg-primary text-primary-foreground'
                      : 'border-input hover:bg-accent border'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
      <BackToTop />
    </div>
  );
}
