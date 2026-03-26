import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getBlogPost } from '@/api/cms';
import { JsonLd } from '@/components/json-ld';
import { localePath } from '@/lib/i18n';
import { buildBlogPosting, buildBreadcrumbList } from '@/lib/schema';
import { generateAlternates, generateCanonical } from '@/lib/seo';
import type { PageProps } from './page.types';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value ?? 'en';
    const post = await getBlogPost(slug, locale);
    return {
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt ?? undefined,
      robots: post.meta_robots ?? 'index, follow',
      alternates: generateAlternates(`/blog/${slug}`),
      openGraph: {
        title: post.seo_title ?? post.title,
        description: post.seo_description ?? post.excerpt ?? undefined,
        images: post.og_image ? [post.og_image] : post.featured_image ? [post.featured_image] : [],
        type: 'article',
      },
      twitter: { card: 'summary_large_image' },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? 'en';

  let post;
  try {
    post = await getBlogPost(slug, locale);
  } catch {
    // Post not found or not available in the current locale — redirect to blog list.
    redirect(localePath(locale, '/blog'));
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={buildBlogPosting(post)} />
      <JsonLd
        data={buildBreadcrumbList([
          { name: 'Blog', url: generateCanonical('/blog') },
          { name: post.title, url: generateCanonical(`/blog/${post.slug}`) },
        ])}
      />
      {/* Back */}
      <Link
        href={localePath(locale, '/blog')}
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      {/* Category */}
      {post.category && (
        <div className="mb-3">
          <Link
            href={localePath(locale, `/blog?category=${post.category.slug}`)}
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
            {new Date(post.published_at).toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        )}
        {post.reading_time && <span>{post.reading_time} min read</span>}
      </div>

      {/* Hero image */}
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

      {/* Content */}
      <div className="prose prose-lg mt-8" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
