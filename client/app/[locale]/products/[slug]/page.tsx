import type { Metadata } from 'next';

import ProductDetailClient from '@/app/products/[slug]/ProductDetailClient';
import { generateAlternates } from '@/lib/seo';
import { serverFetch } from '@/lib/server-fetch';
import type { Product } from '@/types/api';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { data: product } = await serverFetch<{ data: Product }>(`/products/${slug}`);
    return {
      title: product.seo_title ?? product.name,
      description: product.seo_description ?? product.short_description ?? undefined,
      robots: product.meta_robots ?? 'index, follow',
      alternates: generateAlternates(`/products/${slug}`),
      openGraph: {
        title: product.seo_title ?? product.name,
        description: product.seo_description ?? product.short_description ?? undefined,
        images: product.og_image
          ? [product.og_image]
          : product.images?.[0]?.url
            ? [product.images[0].url]
            : [],
        type: 'website',
      },
      twitter: { card: 'summary_large_image' },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
