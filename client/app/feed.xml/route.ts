import { serverFetch } from '@/lib/server-fetch';
import type { PaginatedResponse, Product } from '@/types/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Store';
const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? 'EUR';

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(): Promise<Response> {
  let products: Product[] = [];

  try {
    // Fetch up to 500 active products for the feed
    const response = await serverFetch<PaginatedResponse<Product>>(
      '/products?per_page=500&filter[is_active]=1',
    );
    products = response.data;
  } catch {
    // Return empty feed if API is unavailable
  }

  const items = products
    .filter((p) => p.is_active)
    .map((product) => {
      const price = formatPrice(product.price_min);
      const imageUrl = product.thumbnail?.url ?? '';
      const productUrl = `${SITE_URL}/products/${product.slug}`;
      const availability =
        product.variants.some((v) => v.is_available && v.stock_quantity > 0)
          ? 'in stock'
          : 'out of stock';

      return `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.short_description ?? product.name)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      ${imageUrl ? `<g:image_link>${escapeXml(imageUrl)}</g:image_link>` : ''}
      <g:price>${price} ${DEFAULT_CURRENCY}</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      ${product.brand ? `<g:brand>${escapeXml(product.brand.name)}</g:brand>` : ''}
      ${product.category ? `<g:product_type>${escapeXml(product.category.name)}</g:product_type>` : ''}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(STORE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(STORE_NAME)} product feed</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
