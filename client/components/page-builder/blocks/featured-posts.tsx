import Image from 'next/image';
import Link from 'next/link';

import { getRelationsByKey } from '@/lib/format';
import type { BlogPost } from '@/types/api';
import type {
    FeaturedPostsConfig,
    FeaturedPostsProps,
} from './featured-posts.types';

export function FeaturedPostsBlock({ block }: FeaturedPostsProps) {
    const cfg = block.configuration as FeaturedPostsConfig;
    const columns = cfg.columns ?? 3;

    const postRelations = getRelationsByKey(block.relations, 'posts');
    const posts = postRelations
        .map((r) => r.data as BlogPost | null)
        .filter((p): p is BlogPost => p !== null);

    const colClass =
        {
            1: 'grid-cols-1',
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        }[columns] ?? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

    return (
        <div className="flex flex-col gap-8">
            {(cfg.title || cfg.subtitle || cfg.cta_url) && (
                <div className="flex items-end justify-between gap-4">
                    <div>
                        {cfg.title && (
                            <h2 className="text-2xl font-bold md:text-3xl">
                                {cfg.title}
                            </h2>
                        )}
                        {cfg.subtitle && (
                            <p className="text-muted-foreground mt-1">
                                {cfg.subtitle}
                            </p>
                        )}
                    </div>
                    {cfg.cta_url && (
                        <Link
                            href={cfg.cta_url}
                            className="text-primary shrink-0 text-sm font-medium hover:underline"
                        >
                            {cfg.cta_text ?? 'View all →'}
                        </Link>
                    )}
                </div>
            )}

            {posts.length > 0 ? (
                <div className={`grid gap-6 ${colClass}`}>
                    {posts.map((post) => (
                        <article key={post.id} className="flex flex-col gap-3">
                            {post.featured_image && (
                                <Link href={`/blog/${post.slug}`}>
                                    <div className="relative aspect-video overflow-hidden rounded-xl">
                                        <Image
                                            src={post.featured_image}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                </Link>
                            )}

                            <div className="flex flex-col gap-2">
                                {cfg.show_category !== false &&
                                    post.category && (
                                        <span className="text-primary text-xs font-semibold tracking-wide uppercase">
                                            {post.category.name}
                                        </span>
                                    )}

                                <Link href={`/blog/${post.slug}`}>
                                    <h3 className="hover:text-primary text-lg leading-snug font-semibold transition-colors">
                                        {post.title}
                                    </h3>
                                </Link>

                                {cfg.show_excerpt !== false && post.excerpt && (
                                    <p className="text-muted-foreground line-clamp-3 text-sm">
                                        {post.excerpt}
                                    </p>
                                )}

                                <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                                    {cfg.show_author !== false &&
                                        post.author && (
                                            <span>{post.author.name}</span>
                                        )}
                                    {cfg.show_date !== false &&
                                        post.published_at && (
                                            <span>
                                                {new Date(
                                                    post.published_at,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    },
                                                )}
                                            </span>
                                        )}
                                    {cfg.show_read_time &&
                                        post.reading_time && (
                                            <span>
                                                {post.reading_time} min read
                                            </span>
                                        )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center">
                    No posts to display.
                </p>
            )}
        </div>
    );
}
