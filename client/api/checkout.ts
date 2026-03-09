import { api } from "@/lib/axios";

export interface ShippingMethod {
  id: number;
  name: string;
  description: string | null;
  carrier: string;
  base_price: number;
  estimated_days_min: number | null;
  estimated_days_max: number | null;
  free_shipping_threshold: number | null;
}

export interface AddressPayload {
  first_name: string;
  last_name: string;
  company_name?: string;
  street: string;
  street2?: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone: string;
}

export interface CheckoutPayload {
  shipping_method_id: number;
  payment_provider: string;
  billing_address: AddressPayload;
  shipping_address: AddressPayload;
  notes?: string;
}

export interface OrderResponse {
  id: number;
  reference_number: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  currency_code: string;
  created_at: string;
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const { data } = await api.get<{ data: ShippingMethod[] }>(
    "/checkout/shipping-methods",
  );
  return data.data ?? data;
}

export async function submitCheckout(
  payload: CheckoutPayload,
): Promise<OrderResponse> {
  const { data } = await api.post<{ data: OrderResponse; order: OrderResponse }>(
    "/checkout",
    payload,
    {
      headers: {
        "Idempotency-Key": `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    },
  );
  return data.data ?? data.order ?? (data as unknown as OrderResponse);
}
