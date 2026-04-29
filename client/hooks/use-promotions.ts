'use client';

import { useQuery } from '@tanstack/react-query';

import { apiGetMany } from '@/lib/api';
import { useModules } from '@/providers/modules-provider';
import type { ActivePromotion } from '@/types/api';

export function useActivePromotions() {
    const { ecommerce } = useModules();

    return useQuery({
        queryKey: ['promotions'],
        queryFn: () => apiGetMany<ActivePromotion>('/promotions'),
        staleTime: 5 * 60 * 1000,
        enabled: ecommerce,
    });
}
