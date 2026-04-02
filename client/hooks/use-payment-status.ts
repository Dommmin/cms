'use client';

import { useQuery } from '@tanstack/react-query';

import { apiGet } from '@/lib/api';
import type { PaymentStatus } from './use-payment-status.types';

export function usePaymentStatus(paymentId: number | null) {
    return useQuery<PaymentStatus | null>({
        queryKey: ['payment-status', paymentId],
        queryFn: () => apiGet<PaymentStatus>(`/payments/${paymentId}/status`),
        refetchInterval: (query) =>
            query.state.data?.status === 'pending' ? 3000 : false,
        enabled: paymentId !== null,
        staleTime: 0,
    });
}
