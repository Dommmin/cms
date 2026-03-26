import { generateAlternates } from '@/lib/seo';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProductsClient from './ProductsClient';

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
