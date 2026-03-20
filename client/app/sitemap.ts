import type { MetadataRoute } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import { absoluteUrl } from '@/lib/seo';
import { LOCALES } from '@/lib/i18n';
import type { PaginatedResponse, Product, BlogPost } from '@/types/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Build sitemap entries for a given path with all locale alternates. */
function sitemapEntry(
  path: string,
  lastModified?: Date,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly',
  priority = 0.8,
): MetadataRoute.Sitemap[number] {
  const alternates: Record<string, string> = {};
  for (const locale of LOCALES) {
    alternates[locale] = absoluteUrl(locale, path);
  }

  return {
    url: `${SITE_URL}${path}`,
    lastModified: lastModified ?? new Date(),
    changeFrequency,
    priority,
    alternates: { languages: alternates },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  entries.push(sitemapEntry('/', undefined, 'daily', 1.0));
  entries.push(sitemapEntry('/products', undefined, 'daily', 0.9));
  entries.push(sitemapEntry('/blog', undefined, 'daily', 0.8));
  entries.push(sitemapEntry('/faq', undefined, 'monthly', 0.5));

  // Products
  try {
    const products = await serverFetch<PaginatedResponse<Product>>('/products?per_page=500');
    for (const product of products.data.filter(p => !p.sitemap_exclude)) {
      const d = product.created_at ? new Date(product.created_at) : null;
      entries.push(
        sitemapEntry(
          `/products/${product.slug}`,
          d && !isNaN(d.getTime()) ? d : new Date(),
          'weekly',
          0.8,
        ),
      );
    }
  } catch {
    // skip if API unavailable during build
  }

  // Blog posts
  try {
    const posts = await serverFetch<PaginatedResponse<BlogPost>>('/blog/posts?per_page=500');
    for (const post of posts.data.filter(p => !p.sitemap_exclude)) {
      entries.push(
        sitemapEntry(
          `/blog/${post.slug}`,
          post.published_at ? new Date(post.published_at) : new Date(),
          'monthly',
          0.7,
        ),
      );
    }
  } catch {
    // skip if API unavailable during build
  }

  return entries;
}
