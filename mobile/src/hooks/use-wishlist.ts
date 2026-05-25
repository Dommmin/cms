import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as wishlistApi from '@/api/wishlist';
import type { Wishlist } from '@/types/api';

const wishlistKey = ['wishlist'];

export function useWishlist(enabled = true) {
  const queryClient = useQueryClient();
  const wishlistQuery = useQuery({
    queryKey: wishlistKey,
    queryFn: wishlistApi.getWishlist,
    enabled,
  });

  const setWishlist = (wishlist: Wishlist | null) => queryClient.setQueryData(wishlistKey, wishlist);

  const add = useMutation({
    mutationFn: wishlistApi.addToWishlist,
    onSuccess: setWishlist,
  });

  const remove = useMutation({
    mutationFn: wishlistApi.removeFromWishlist,
    onSuccess: setWishlist,
  });

  return {
    wishlist: wishlistQuery.data ?? null,
    isLoading: wishlistQuery.isLoading,
    add,
    remove,
  };
}
