"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { type AddressPayload } from "@/api/checkout";
import { getToken } from "@/lib/axios";
import { AddressFieldset, addressToPayload, validateAddress } from "@/components/checkout/address-fieldset";
import { useCart } from "@/hooks/use-cart";
import { useCheckout, useShippingMethods } from "@/hooks/use-checkout";
import { useAddresses, useCreateAddress } from "@/hooks/use-profile";
import { useTranslation } from "@/hooks/use-translation";
import { useLocalePath } from "@/hooks/use-locale";
import { trackBeginCheckout, trackPurchase } from "@/lib/datalayer";
import type { Address } from "@/types/api";

// ── Helpers ────────────────────────────────────────────────────────────────

function payloadToAddress(
  payload: AddressPayload,
  type: "billing" | "shipping",
): Omit<Address, "id" | "is_default"> {
  return {
    type,
    first_name: payload.first_name,
    last_name: payload.last_name,
    company: payload.company_name ?? null,
    address_line_1: payload.street,
    address_line_2: payload.street2 ?? null,
    city: payload.city,
    state: null,
    postal_code: payload.postal_code,
    country_code: payload.country_code,
    phone: payload.phone || null,
  };
}

const emptyAddress = (): AddressPayload => ({
  first_name: "",
  last_name: "",
  company_name: "",
  street: "",
  street2: "",
  city: "",
  postal_code: "",
  country_code: "PL",
  phone: "",
});

// ── Main checkout page ─────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const lp = useLocalePath();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: shippingMethods = [], isLoading: methodsLoading } =
    useShippingMethods();
  const { mutate: checkout, isPending, error } = useCheckout();
  const { data: savedAddresses = [] } = useAddresses(mounted && !!token);
  const { mutate: createAddress } = useCreateAddress();

  const [billing, setBilling] = useState<AddressPayload>(emptyAddress);
  const [shipping, setShipping] = useState<AddressPayload>(emptyAddress);
  const [sameAddress, setSameAddress] = useState(true);
  const [saveBilling, setSaveBilling] = useState(false);
  const [saveShipping, setSaveShipping] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Resolve auth token client-side only — avoids server/client hydration mismatch
  useEffect(() => {
    const t = getToken();
    setToken(t);
    setMounted(true);
    if (!t) {
      router.push("/login?redirect=/checkout");
    }
  }, [router]);

  // Fire begin_checkout once cart loads
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      trackBeginCheckout(cart.subtotal, cart.currency, cart.items);
    }
  }, [cart?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first shipping method
  useEffect(() => {
    if (shippingMethods.length > 0 && selectedMethod === null) {
      setSelectedMethod(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedMethod]);

  // Pre-fill default address when saved addresses load
  useEffect(() => {
    if (savedAddresses.length > 0) {
      const defaultAddr =
        savedAddresses.find((a) => a.is_default && a.type === "billing") ??
        savedAddresses.find((a) => a.is_default) ??
        savedAddresses[0];
      setBilling(addressToPayload(defaultAddr));
    }
  }, [savedAddresses]);

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
      cents / 100,
    );

  const selectedShippingMethod = shippingMethods.find((m) => m.id === selectedMethod);
  const shippingCost = selectedShippingMethod?.base_price ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const freeThreshold = selectedShippingMethod?.free_shipping_threshold ?? null;
  const effectiveShipping =
    freeThreshold !== null && subtotal >= freeThreshold ? 0 : shippingCost;
  const total = subtotal + effectiveShipping;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);

    // Client-side validation before submitting
    const billingErrors = validateAddress(billing);
    const shippingErrors = !sameAddress ? validateAddress(shipping) : {};
    if (Object.keys(billingErrors).length > 0 || Object.keys(shippingErrors).length > 0) {
      return;
    }

    if (!selectedMethod || !cart || cart.items.length === 0) return;

    const shippingAddr = sameAddress ? billing : shipping;

    checkout(
      {
        shipping_method_id: selectedMethod,
        payment_provider: "cash_on_delivery",
        billing_address: billing,
        shipping_address: shippingAddr,
        notes: notes || undefined,
      },
      {
        onSuccess: (order) => {
          trackPurchase({
            transactionId: order.reference_number,
            revenue: order.total,
            currency: order.currency_code,
            items: order.items,
          });
          if (saveBilling) {
            createAddress(payloadToAddress(billing, "billing"));
          }
          if (saveShipping && !sameAddress) {
            createAddress(payloadToAddress(shippingAddr, "shipping"));
          }
          router.push(`/checkout/success?ref=${order.reference_number}`);
        },
      },
    );
  }

  // Render nothing until mounted — consistent with SSR (no token available server-side)
  if (!mounted || !token) return null;

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">{t("checkout.empty_cart", "Cart is empty")}</h1>
        <p className="mb-6 text-muted-foreground">
          {t("checkout.empty_cart_desc", "Add items to your cart before checkout.")}
        </p>
        <Link
          href={lp("/products")}
          className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {t("checkout.browse_products", "Browse products")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">{t("checkout.title", "Checkout")}</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Left column: forms ── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Billing address */}
            <AddressFieldset
              title={t("checkout.billing_address", "Billing Address")}
              value={billing}
              onChange={setBilling}
              savedAddresses={savedAddresses}
              autocompleteSection="billing"
              showAllErrors={submitAttempted}
            />
            {savedAddresses.length === 0 && (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={saveBilling}
                  onChange={(e) => setSaveBilling(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                {t("checkout.save_billing", "Save billing address to account")}
              </label>
            )}

            {/* Same address toggle */}
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sameAddress}
                onChange={(e) => setSameAddress(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              {t("checkout.same_as_billing", "Shipping address same as billing")}
            </label>

            {/* Shipping address */}
            {!sameAddress && (
              <>
                <AddressFieldset
                  title={t("checkout.shipping_address", "Shipping Address")}
                  value={shipping}
                  onChange={setShipping}
                  savedAddresses={savedAddresses.filter((a) => a.type === "shipping")}
                  autocompleteSection="shipping"
                  showAllErrors={submitAttempted}
                />
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={saveShipping}
                    onChange={(e) => setSaveShipping(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  {t("checkout.save_shipping", "Save shipping address to account")}
                </label>
              </>
            )}

            {/* Shipping methods */}
            <div className="rounded-xl border border-border p-5">
              <h2 className="mb-3 text-sm font-semibold">{t("checkout.shipping_method", "Shipping Method")}</h2>
              {methodsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {shippingMethods.map((method) => {
                    const isFree = freeThreshold !== null && subtotal >= freeThreshold;
                    const price = isFree ? 0 : method.base_price;

                    return (
                      <label
                        key={method.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                          selectedMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping_method"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={() => setSelectedMethod(method.id)}
                            className="accent-primary"
                          />
                          <div>
                            <p className="text-sm font-medium">{method.name}</p>
                            {method.description && (
                              <p className="text-xs text-muted-foreground">
                                {method.description}
                              </p>
                            )}
                            {method.estimated_days_min && method.estimated_days_max && (
                              <p className="text-xs text-muted-foreground">
                                {method.estimated_days_min}–{method.estimated_days_max} {t("checkout.business_days", "business days")}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-semibold">
                          {price === 0 ? (
                            <span className="text-green-600">{t("checkout.free", "Free")}</span>
                          ) : (
                            formatPrice(price)
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment method — only COD for now */}
            <div className="rounded-xl border border-border p-5">
              <h2 className="mb-3 text-sm font-semibold">{t("checkout.payment_method", "Payment Method")}</h2>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary bg-primary/5 p-3">
                <input type="radio" checked readOnly className="accent-primary" />
                <div>
                  <p className="text-sm font-medium">{t("checkout.cod", "Cash on Delivery")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("checkout.cod_desc", "Pay with cash upon delivery or in-store.")}
                  </p>
                </div>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("checkout.optional_notes", "Order Notes (optional)")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={t("checkout.notes_placeholder", "Any special instructions...")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* ── Right column: summary ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border p-5">
              <h2 className="mb-4 text-base font-semibold">{t("checkout.summary", "Order Summary")}</h2>

              {/* Items */}
              <ul className="mb-4 divide-y divide-border text-sm">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="truncate text-muted-foreground">
                      {item.product?.name ?? t("product.no_image", "Product")}
                      <span className="ml-1 text-xs">×{item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium">{formatPrice(item.subtotal)}</span>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="space-y-1.5 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.products", "Products")}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {cart.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t("checkout.discount", "Discount")}</span>
                    <span>-{formatPrice(cart.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.shipping_method", "Shipping")}</span>
                  <span>
                    {effectiveShipping === 0 ? (
                      <span className="text-green-600">{t("checkout.free", "Free")}</span>
                    ) : (
                      formatPrice(effectiveShipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                  <span>{t("cart.total", "Total")}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {error && (
                <p className="mt-3 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                  {t("checkout.error", "Error")}: {(error as Error).message}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending || !selectedMethod}
                className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? t("checkout.placing_order", "Placing order...") : t("checkout.place_order", "Place Order")}
              </button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t("checkout.order_terms", 'By clicking "Place Order" you agree to the terms of sale.')}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
