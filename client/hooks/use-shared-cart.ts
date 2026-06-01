'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    createSharedCart,
    getSharedCartPreview,
    importSharedCart,
} from '@/api/shared-cart';
import { cartKeys } from '@/hooks/use-cart';
import type { SharedCartImportMode } from '@/types/api';

export const sharedCartKeys = {
    preview: (token: string) => ['shared-cart', 'preview', token] as const,
};

export function useCreateSharedCart() {
    return useMutation({
        mutationFn: (expiresInDays?: number) => createSharedCart(expiresInDays),
    });
}

export function useSharedCartPreview(token: string) {
    return useQuery({
        queryKey: sharedCartKeys.preview(token),
        queryFn: () => getSharedCartPreview(token),
        enabled: token.length > 0,
    });
}

export function useImportSharedCart(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (mode: SharedCartImportMode) =>
            importSharedCart(token, mode),
        onSuccess: (result) => {
            queryClient.setQueryData(cartKeys.cart, result.cart);
            queryClient.invalidateQueries({
                queryKey: sharedCartKeys.preview(token),
            });
        },
    });
}
