import Image from 'next/image';
import Link from 'next/link';

import { BlogViewTracker } from '@/app/blog/_blog-view-tracker';
import { BlogComments } from '@/components/blog-comments';
import { BlogVotes } from '@/components/blog-votes';
import { Breadcrumb } from '@/components/breadcrumb';
import { JsonLd } from '@/components/json-ld';
import { enrichArticleHtml } from '@/lib/blog-content';
import { localePath } from '@/lib/i18n';
import { sanitizeHtml } from '@/lib/sanitize';
import { buildBlogPosting, buildBreadcrumbList } from '@/lib/schema';
import { absoluteUrl, localizedBlogPath } from '@/lib/seo';
import type { BlogPostClientProps } from './blog-post-client.types';

export function BlogPostClient({
    post,
    relatedPosts = [],
    locale,
    basePath,
}: BlogPostClientProps) {
    const lp = (path: string) => localePath(locale, path);
    const articlePath = localizedBlogPath(
        locale,
        post.slug_translations,
        post.canonical_slug,
        basePath,
    );
    const articleUrl = post.canonical_url ?? absoluteUrl(locale, articlePath);
    const { html, toc } = enrichArticleHtml(sanitizeHtml(post.content));

    return (
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <JsonLd data={buildBlogPosting(post, locale)} />
            <JsonLd
                data={buildBreadcrumbList([
                    { name: 'Blog', url: absoluteUrl(locale, basePath) },
                    {
                        name: post.title,
                        url: articleUrl,
                    },
                ])}
            />

            <Breadcrumb
                homeHref={lp('/')}
                items={[
                    { label: 'Blog', href: lp(basePath) },
                    ...(post.category
                        ? [
                              {
                                  label: post.category.name,
                                  href: lp(
                                      `${basePath}?category=${post.category.slug}`,
                                  ),
                              },
                          ]
                        : []),
                    { label: post.title },
                ]}
            />

            {post.category && (
                <div className="mb-3">
                    <Link
                        href={lp(`${basePath}?category=${post.category.slug}`)}
                        className="border-input text-muted-foreground hover:bg-accent rounded-full border px-3 py-0.5 text-xs font-medium"
                    >
                        {post.category.name}
                    </Link>
                </div>
            )}

            <h1 className="text-4xl leading-tight font-bold">{post.title}</h1>

            <div className="text-muted-foreground mt-3 flex items-center gap-4 text-sm">
                {post.author && <span>By {post.author.name}</span>}
                {post.published_at && (
                    <span>
                        {new Date(post.published_at).toLocaleDateString(
                            locale === 'pl' ? 'pl-PL' : 'en-US',
                            {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            },
                        )}
                    </span>
                )}
                {post.reading_time && <span>{post.reading_time} min read</span>}
            </div>

            {post.updated_at && (
                <p className="text-muted-foreground mt-2 text-sm">
                    Last updated{' '}
                    {new Date(post.updated_at).toLocaleDateString(
                        locale === 'pl' ? 'pl-PL' : 'en-US',
                        {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        },
                    )}
                </p>
            )}

            {post.featured_image && (
                <div className="relative mt-8 aspect-video overflow-hidden rounded-xl">
                    <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 768px"
                        priority
                    />
                </div>
            )}

            {toc.length > 0 && (
                <nav
                    aria-label="Table of contents"
                    className="border-border bg-muted/30 mt-8 border-y py-4"
                >
                    <ol className="space-y-2 text-sm">
                        {toc.map((item) => (
                            <li
                                key={item.id}
                                className={
                                    item.level === 3 ? 'pl-4' : undefined
                                }
                            >
                                <a
                                    href={`#${item.id}`}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    {item.text}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            <div
                className="prose prose-lg mt-8"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
            />

            {post.author && (
                <aside className="border-border mt-10 border-t pt-6">
                    <p className="text-muted-foreground text-sm">Author</p>
                    <p className="mt-1 font-semibold">{post.author.name}</p>
                    <p className="text-muted-foreground text-sm">
                        Editorial contributor
                    </p>
                </aside>
            )}

            {relatedPosts.length > 0 && (
                <section className="border-border mt-10 border-t pt-6">
                    <h2 className="text-2xl font-semibold">Related posts</h2>
                    <ul className="mt-4 space-y-3">
                        {relatedPosts.map((relatedPost) => (
                            <li key={relatedPost.id}>
                                <Link
                                    href={lp(
                                        localizedBlogPath(
                                            locale,
                                            relatedPost.slug_translations,
                                            relatedPost.canonical_slug,
                                            basePath,
                                        ),
                                    )}
                                    className="font-medium hover:underline"
                                >
                                    {relatedPost.title}
                                </Link>
                                {relatedPost.excerpt && (
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        {relatedPost.excerpt}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="mt-8 flex items-center justify-between">
                <BlogVotes post={post} locale={locale} />
                <BlogViewTracker
                    slug={post.slug}
                    initialCount={post.views_count ?? 0}
                />
            </div>
            <BlogComments slug={post.slug} locale={locale} />
        </article>
    );
}
