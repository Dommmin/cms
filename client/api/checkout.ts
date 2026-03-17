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
  requires_pickup_point: boolean;
  uses_native_widget: boolean;
  /** False when env vars required for the pickup picker are missing in server/.env */
  configured: boolean;
  /** Names of missing env vars, e.g. ["FURGONETKA_CLIENT_ID"] */
  missing_config: string[];
}

export interface PaymentMethodConfig {
  id: "cash_on_delivery" | "payu" | "p24" | "apple_pay" | "google_pay" | "bank_transfer";
  configured: boolean;
  /** Names of missing env vars in server/.env */
  missing_env: string[];
}

export interface BankDetails {
  account_name: string;
  iban: string;
  swift: string;
  bank_name: string;
  reference: string;
  amount: number;
  currency: string;
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
  guest_email?: string;
  shipping_method_id: number;
  pickup_point_id?: string;
  payment_provider: string;
  payment_method?: string;
  blik_code?: string;
  payment_token?: string;
  billing_address: AddressPayload;
  shipping_address: AddressPayload;
  notes?: string;
}

export interface PaymentResult {
  id: number | null;
  action: "redirect" | "wait" | "none";
  redirect_url: string | null;
  bank_details?: BankDetails | null;
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

export interface CheckoutResponse {
  order: OrderResponse;
  payment: PaymentResult;
}

export async function getPaymentMethods(): Promise<PaymentMethodConfig[]> {
  const { data } = await api.get<{ data: PaymentMethodConfig[] }>("/checkout/payment-methods");
  return data.data ?? [];
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const { data } = await api.get<{ data: ShippingMethod[] }>(
    "/checkout/shipping-methods",
  );
  return data.data ?? data;
}

export async function submitCheckout(
  payload: CheckoutPayload,
): Promise<CheckoutResponse> {
  const { data } = await api.post<CheckoutResponse>(
    "/checkout",
    payload,
    {
      headers: {
        "Idempotency-Key": `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    },
  );
  return data;
}
