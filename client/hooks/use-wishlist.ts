'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addToWishlist, getWishlist, removeFromWishlist } from '@/api/wishlist';
import { getToken } from '@/lib/axios';

export const wishlistKeys = {
    wishlist: ['wishlist'] as const,
};

export function useWishlist() {
    return useQuery({
        queryKey: wishlistKeys.wishlist,
        queryFn: getWishlist,
        enabled: !!getToken(),
        staleTime: 2 * 60 * 1000, // 2 min — wishlist rarely changes in background
        gcTime: 10 * 60 * 1000,
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
