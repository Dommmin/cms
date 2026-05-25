import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { getRecentlyViewed, rememberProduct } from '@/lib/recently-viewed';
import type { Product } from '@/types/api';

const recentlyViewedKey = ['recently-viewed'];

export function useRecentlyViewed() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: recentlyViewedKey,
    queryFn: getRecentlyViewed,
  });
  const remember = useCallback(
    async (product: Product) => {
      await rememberProduct(product);
      await queryClient.invalidateQueries({ queryKey: recentlyViewedKey });
    },
    [queryClient],
  );

  return {
    products: query.data ?? [],
    remember,
  };
}
