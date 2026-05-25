import { apiGet } from '@/api/client';
import type { PaymentStatus } from '@/types/api';

export function getPaymentStatus(paymentId: number): Promise<PaymentStatus | null> {
  return apiGet<PaymentStatus>(`/payments/${paymentId}/status`);
}
