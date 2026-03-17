import type { Metadata } from "next";
import { serverFetch } from "@/lib/server-fetch";
import { generateCanonical, generateAlternates } from "@/lib/seo";
import type { Product } from "@/types/api";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { data: product } = await serverFetch<{ data: Product }>(`/products/${slug}`);
    return {
      title: product.seo_title ?? product.name,
      description: product.seo_description ?? product.short_description ?? undefined,
      robots: product.meta_robots ?? "index, follow",
      alternates: generateAlternates(`/products/${slug}`),
      openGraph: {
        title: product.seo_title ?? product.name,
        description: product.seo_description ?? product.short_description ?? undefined,
        images: product.og_image
          ? [product.og_image]
          : product.images?.[0]?.url
            ? [product.images[0].url]
            : [],
        type: "website",
      },
      twitter: { card: "summary_large_image" },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
