'use client';

import { useQuery } from '@tanstack/react-query';

import { apiGetMany } from '@/lib/api';
import type { ActivePromotion } from '@/types/api';

export function useActivePromotions() {
    return useQuery({
        queryKey: ['promotions'],
        queryFn: () => apiGetMany<ActivePromotion>('/promotions'),
        staleTime: 5 * 60 * 1000,
    });
}
