"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { type AddressPayload } from "@/api/checkout";
import { getToken } from "@/lib/axios";
import { AddressFieldset, addressToPayload, validateAddress } from "@/components/checkout/address-fieldset";
import { InpostPicker } from "@/components/checkout/inpost-picker";
import { PickupPointPicker } from "@/components/checkout/pickup-point-picker";
import { PaymentStep, type PaymentMethodValue } from "@/components/checkout/payment-step";
import { useCart } from "@/hooks/use-cart";
import { useCheckout, usePaymentMethods, useShippingMethods } from "@/hooks/use-checkout";
import { useAddresses, useCreateAddress } from "@/hooks/use-profile";
import { useTranslation } from "@/hooks/use-translation";
import { useLocalePath } from "@/hooks/use-locale";
import { useCurrency } from "@/hooks/use-currency";
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
    company_name: payload.company_name ?? null,
    street: payload.street,
    street2: payload.street2 ?? null,
    city: payload.city,
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
  const { data: shippingMethods = [], isLoading: methodsLoading } = useShippingMethods();
  const { data: paymentMethods } = usePaymentMethods();
  const { mutate: checkout, isPending, error } = useCheckout();
  const { data: savedAddresses = [] } = useAddresses(mounted && !!token);
  const { mutate: createAddress } = useCreateAddress();
  const { formatPrice, currencyCode } = useCurrency();

  const [guestEmail, setGuestEmail] = useState("");
  const [billing, setBilling] = useState<AddressPayload>(emptyAddress);
  const [shipping, setShipping] = useState<AddressPayload>(emptyAddress);
  const [sameAddress, setSameAddress] = useState(true);
  const [saveBilling, setSaveBilling] = useState(false);
  const [saveShipping, setSaveShipping] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [pickupPointId, setPickupPointId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("cash_on_delivery");
  const [blikCode, setBlikCode] = useState("");
  const [paymentToken, setPaymentToken] = useState("");
  const [notes, setNotes] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Resolve auth token client-side only — avoids server/client hydration mismatch
  useEffect(() => {
    const t = getToken();
    setToken(t);
    setMounted(true);
  }, []);

  // Fire begin_checkout once cart loads
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      trackBeginCheckout(cart.subtotal, cart.currency, cart.items);
    }
  }, [cart?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first configured shipping method
  useEffect(() => {
    if (shippingMethods.length > 0 && selectedMethod === null) {
      const firstConfigured = shippingMethods.find((m) => m.configured);
      if (firstConfigured) setSelectedMethod(firstConfigured.id);
    }
  }, [shippingMethods, selectedMethod]);

  // Reset pickup point when switching to a non-locker method
  const handleMethodChange = (id: number) => {
    setSelectedMethod(id);
    const method = shippingMethods.find((m) => m.id === id);
    if (!method?.requires_pickup_point) {
      setPickupPointId("");
    }
  };

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

  const selectedShippingMethod = shippingMethods.find((m) => m.id === selectedMethod);
  const isPickup = selectedShippingMethod?.carrier === "pickup";
  const shippingCost = selectedShippingMethod?.base_price ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const freeThreshold = selectedShippingMethod?.free_shipping_threshold ?? null;
  const effectiveShipping =
    freeThreshold !== null && subtotal >= freeThreshold ? 0 : shippingCost;
  const total = subtotal + effectiveShipping;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);

    // Guest email required when not authenticated
    if (!token && !guestEmail.trim()) return;

    // Client-side validation before submitting
    const billingErrors = validateAddress(billing);
    const shippingErrors = !sameAddress ? validateAddress(shipping) : {};
    if (Object.keys(billingErrors).length > 0 || Object.keys(shippingErrors).length > 0) {
      return;
    }

    if (!selectedMethod || !cart || cart.items.length === 0) return;

    // Prevent submitting with an unconfigured shipping method
    const selectedShippingCfg = shippingMethods.find((m) => m.id === selectedMethod);
    if (selectedShippingCfg && !selectedShippingCfg.configured) return;

    // BLIK requires 6-digit code
    if (paymentMethod === "blik" && blikCode.length !== 6) return;

    // Locker method requires a pickup point
    if (selectedShippingMethod?.requires_pickup_point && !pickupPointId) return;

    const shippingAddr = sameAddress ? billing : shipping;

    const providerMap: Record<PaymentMethodValue, string> = {
      blik: "payu",
      apple_pay: "payu",
      google_pay: "payu",
      p24: "p24",
      cash_on_delivery: "cash_on_delivery",
      bank_transfer: "bank_transfer",
    };

    checkout(
      {
        guest_email: !token ? guestEmail : undefined,
        shipping_method_id: selectedMethod,
        pickup_point_id: pickupPointId || undefined,
        payment_provider: providerMap[paymentMethod],
        payment_method: paymentMethod !== "cash_on_delivery" && paymentMethod !== "p24"
          ? paymentMethod
          : undefined,
        blik_code: paymentMethod === "blik" ? blikCode : undefined,
        payment_token: paymentToken || undefined,
        billing_address: billing,
        shipping_address: shippingAddr,
        notes: notes || undefined,
      },
      {
        onSuccess: (response) => {
          const order = response.order;
          const payment = response.payment;

          trackPurchase({
            transactionId: order.reference_number,
            revenue: order.total,
            currency: order.currency_code,
            items: [],
          });
          if (token && saveBilling) {
            createAddress(payloadToAddress(billing, "billing"));
          }
          if (token && saveShipping && !sameAddress) {
            createAddress(payloadToAddress(shippingAddr, "shipping"));
          }

          if (payment.action === "redirect" && payment.redirect_url) {
            window.location.href = payment.redirect_url;
          } else if (payment.action === "wait" && payment.id) {
            router.push(lp(`/checkout/pending?payment=${payment.id}`));
          } else {
            const guestParam = !token ? "&guest=1" : "";
            // Persist bank details for the success page before navigating
            if (payment.bank_details) {
              sessionStorage.setItem("bank_transfer_details", JSON.stringify(payment.bank_details));
            }
            router.push(lp(`/checkout/success?ref=${order.reference_number}${guestParam}`));
          }
        },
      },
    );
  }

  // Render nothing until mounted — consistent with SSR (no token available server-side)
  if (!mounted) return null;

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
            {/* Guest email */}
            {!token && (
              <div className="rounded-xl border border-border p-5">
                <h2 className="mb-3 text-sm font-semibold">
                  {t("checkout.guest_email_title", "Your Email Address")}
                </h2>
                <p className="mb-3 text-xs text-muted-foreground">
                  {t("checkout.guest_email_hint", "We'll send your order confirmation here.")}
                </p>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {submitAttempted && !guestEmail.trim() && (
                  <p className="mt-1 text-xs text-destructive">
                    {t("checkout.guest_email_required", "Email address is required.")}
                  </p>
                )}
              </div>
            )}

            {/* Billing address */}
            <AddressFieldset
              title={t("checkout.billing_address", "Billing Address")}
              value={billing}
              onChange={setBilling}
              savedAddresses={savedAddresses}
              autocompleteSection="billing"
              showAllErrors={submitAttempted}
            />
            {token && savedAddresses.length === 0 && (
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
                {token && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={saveShipping}
                      onChange={(e) => setSaveShipping(e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    {t("checkout.save_shipping", "Save shipping address to account")}
                  </label>
                )}
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
                    const methodThreshold = method.free_shipping_threshold ?? null;
                    const isFree = methodThreshold !== null && subtotal >= methodThreshold;
                    const price = isFree ? 0 : method.base_price;
                    const unconfigured = !method.configured;

                    return (
                      <label
                        key={method.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                          unconfigured
                            ? "cursor-not-allowed border-border opacity-60"
                            : selectedMethod === method.id
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
                            disabled={unconfigured}
                            onChange={() => !unconfigured && handleMethodChange(method.id)}
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
                            {unconfigured && method.missing_config.length > 0 && (
                              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                Set in server/.env: {method.missing_config.join(", ")}
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

              {selectedShippingMethod?.requires_pickup_point && (
                selectedShippingMethod.uses_native_widget ? (
                  <InpostPicker
                    value={pickupPointId || null}
                    onChange={(id) => setPickupPointId(id)}
                  />
                ) : (
                  <PickupPointPicker
                    carrier={selectedShippingMethod.carrier ?? ""}
                    postalCode={billing.postal_code}
                    value={pickupPointId || null}
                    onChange={(id) => setPickupPointId(id)}
                  />
                )
              )}
            </div>

            {/* Payment method */}
            <PaymentStep
              selected={paymentMethod}
              onSelect={(method) => {
                setPaymentMethod(method);
                setPaymentToken("");
              }}
              blikCode={blikCode}
              onBlikCode={setBlikCode}
              onApplePayToken={(token) => setPaymentToken(token)}
              onGooglePayToken={(token) => setPaymentToken(token)}
              cartTotal={total}
              currency={currencyCode}
              providerConfig={paymentMethods}
              isPickup={isPickup}
            />

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
