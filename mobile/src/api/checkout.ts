import { api, apiGetMany } from '@/api/client';
import { makeIdempotencyKey } from '@/lib/idempotency';
import type { CheckoutPayload, CheckoutResponse, PaymentMethodConfig, ShippingMethod } from '@/types/api';

export function getPaymentMethods(): Promise<PaymentMethodConfig[]> {
  return apiGetMany<PaymentMethodConfig>('/checkout/payment-methods');
}

export function getShippingMethods(): Promise<ShippingMethod[]> {
  return apiGetMany<ShippingMethod>('/checkout/shipping-methods');
}

export async function submitCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const { data } = await api.post<CheckoutResponse>('/checkout', payload, {
    headers: { 'Idempotency-Key': makeIdempotencyKey('checkout') },
  });
  return data;
}
