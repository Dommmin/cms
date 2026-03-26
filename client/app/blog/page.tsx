import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import { getBlogCategories, getBlogPosts } from '@/api/cms';
import { localePath } from '@/lib/i18n';
import { generateAlternates } from '@/lib/seo';
import type { PageProps } from './page.types';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles, news and inspiration from our team.',
  alternates: generateAlternates('/blog'),
};

export default async function BlogPage({ searchParams }: PageProps) {
  const { page = '1', category } = await searchParams;

  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? 'en';

  const lp = (path: string) => localePath(locale, path);

  let posts;
  let categories;
  try {
    [posts, categories] = await Promise.all([
      getBlogPosts({ page: Number(page), category, locale }),
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

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <Link
            href={lp('/blog')}
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
              href={lp(`/blog?category=${cat.slug}`)}
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

      {/* Posts grid */}
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

          {/* Pagination */}
          {posts.meta.last_page > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: posts.meta.last_page }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={lp(`/blog?page=${p}${category ? `&category=${category}` : ''}`)}
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
    </div>
  );
}
