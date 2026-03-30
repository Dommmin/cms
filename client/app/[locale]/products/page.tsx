import type { Metadata } from 'next';
import { Suspense } from 'react';

import ProductsClient from '@/app/products/ProductsClient';
import { generateAlternates } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Shop',
    description: 'Browse our products',
    alternates: generateAlternates('/products'),
  };
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsClient />
    </Suspense>
  );
}
