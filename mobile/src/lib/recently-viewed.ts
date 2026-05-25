import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Product } from '@/types/api';

const RECENTLY_VIEWED_KEY = 'recently_viewed_products';
const MAX_RECENTLY_VIEWED = 10;

export type RecentlyViewedProduct = Pick<Product, 'id' | 'name' | 'slug' | 'thumbnail' | 'price_min'>;

export async function getRecentlyViewed(): Promise<RecentlyViewedProduct[]> {
  const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as RecentlyViewedProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function rememberProduct(product: Product): Promise<void> {
  const current = await getRecentlyViewed();
  const next = [
    {
      id: product.id,
      name: product.name,
      slug: product.slug,
      thumbnail: product.thumbnail,
      price_min: product.price_min,
    },
    ...current.filter((item) => item.id !== product.id),
  ].slice(0, MAX_RECENTLY_VIEWED);

  await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
}
