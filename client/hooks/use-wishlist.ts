"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addToWishlist, getWishlist, removeFromWishlist } from "@/api/wishlist";

export const wishlistKeys = {
  wishlist: ["wishlist"] as const,
};

export function useWishlist() {
  return useQuery({
    queryKey: wishlistKeys.wishlist,
    queryFn: getWishlist,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: number) => addToWishlist(variantId),
    onSuccess: (wishlist) => {
      queryClient.setQueryData(wishlistKeys.wishlist, wishlist);
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: number) => removeFromWishlist(variantId),
    onSuccess: (wishlist) => {
      queryClient.setQueryData(wishlistKeys.wishlist, wishlist);
    },
  });
}

/** Convenience — returns true if variantId is in wishlist */
export function useIsInWishlist(variantId: number): boolean {
  const { data } = useWishlist();
  return data?.items.some((item) => item.variant_id === variantId) ?? false;
}
