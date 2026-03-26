'use client';

import { api } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'authorized' | 'refunded' | 'partially_refunded';
  order_reference: string | null;
}

export function usePaymentStatus(paymentId: number | null) {
  return useQuery<PaymentStatus>({
    queryKey: ['payment-status', paymentId],
    queryFn: () => api.get<PaymentStatus>(`/payments/${paymentId}/status`).then((r) => r.data),
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 3000 : false),
    enabled: paymentId !== null,
    staleTime: 0,
  });
}
