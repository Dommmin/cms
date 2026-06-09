'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';

import { type AddressPayload } from '@/api/checkout';
import {
    addressToPayload,
    validateAddress,
} from '@/components/checkout/address-fieldset';
import type { PaymentMethodValue } from '@/components/checkout/payment-step.types';
import { useCart } from '@/hooks/use-cart';
import {
    useCheckout,
    usePaymentMethods,
    useShippingMethods,
} from '@/hooks/use-checkout';
import { useStorefrontRoutes } from '@/hooks/use-cms';
import { useCurrency } from '@/hooks/use-currency';
import { useLocalePath } from '@/hooks/use-locale';
import { useAddresses, useCreateAddress } from '@/hooks/use-profile';
import { useTranslation } from '@/hooks/use-translation';
import { getToken } from '@/lib/axios';
import {
    getGaClientId,
    trackAddPaymentInfo,
    trackAddShippingInfo,
    trackBeginCheckout,
    trackPurchase,
} from '@/lib/datalayer';
import type { Address } from '@/types/api';
import { CheckoutAddressSection } from './components/checkout-address-section';
import { CheckoutPaymentSection } from './components/checkout-payment-section';
import { GuestEmailStep } from './components/guest-email-step';
import { OrderSummary } from './components/order-summary';
import { ShippingMethodStep } from './components/shipping-method-step';

// ── Helpers ────────────────────────────────────────────────────────────────

function payloadToAddress(
    payload: AddressPayload,
    type: 'billing' | 'shipping',
): Omit<Address, 'id' | 'is_default'> {
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
    first_name: '',
    last_name: '',
    company_name: '',
    street: '',
    street2: '',
    city: '',
    postal_code: '',
    country_code: 'PL',
    phone: '',
});

// ── Main checkout page ─────────────────────────────────────────────────────

export default function CheckoutPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const lp = useLocalePath();
    const queryClient = useQueryClient();
    const { data: storefrontRoutes } = useStorefrontRoutes();
    const [mounted] = useState(() => typeof window !== 'undefined');
    const [token, setToken] = useState<string | null>(() =>
        typeof window !== 'undefined' ? getToken() : null,
    );

    const handleLoginSuccess = (newToken: string) => {
        setToken(newToken);
        void queryClient.invalidateQueries({ queryKey: ['profile'] });
        void queryClient.invalidateQueries({ queryKey: ['cart'] });
    };
    const { data: cart, isLoading: cartLoading } = useCart();
    const { data: shippingMethods = [], isLoading: methodsLoading } =
        useShippingMethods();
    const { data: paymentMethods } = usePaymentMethods();
    const { mutate: checkout, isPending, error } = useCheckout();
    const { data: savedAddresses = [] } = useAddresses(mounted && !!token);
    const { mutate: createAddress } = useCreateAddress();
    const { formatPrice, currencyCode } = useCurrency();

    const [guestEmail, setGuestEmail] = useState('');
    const [billing, setBilling] = useState<AddressPayload>(emptyAddress);
    const [shipping, setShipping] = useState<AddressPayload>(emptyAddress);
    const [sameAddress, setSameAddress] = useState(true);
    const [saveBilling, setSaveBilling] = useState(false);
    const [saveShipping, setSaveShipping] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
    const [pickupPointId, setPickupPointId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethodValue>('cash_on_delivery');
    const [blikCode, setBlikCode] = useState('');
    const [paymentToken, setPaymentToken] = useState('');
    const [notes, setNotes] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // token and mounted are initialized via lazy useState — no effect needed

    // Fire begin_checkout once cart loads
    useEffect(() => {
        if (cart && cart.items.length > 0) {
            trackBeginCheckout(cart.subtotal, cart.currency, cart.items);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart?.id]);

    // Auto-select first configured shipping method
    useEffect(() => {
        if (shippingMethods.length > 0 && selectedMethod === null) {
            const firstConfigured = shippingMethods.find((m) => m.configured);
            if (firstConfigured)
                void Promise.resolve().then(() =>
                    setSelectedMethod(firstConfigured.id),
                );
        }
    }, [shippingMethods, selectedMethod]);

    // Reset pickup point when switching to a non-locker method
    const handleMethodChange = (id: number) => {
        setSelectedMethod(id);
        const method = shippingMethods.find((m) => m.id === id);
        if (!method?.requires_pickup_point) {
            setPickupPointId('');
        }
        if (method && cart) {
            trackAddShippingInfo(
                cart.subtotal,
                cart.currency,
                method.name,
                cart.items,
            );
        }
    };

    // Pre-fill default address when saved addresses load
    useEffect(() => {
        if (savedAddresses.length > 0) {
            const defaultAddr =
                savedAddresses.find(
                    (a) => a.is_default && a.type === 'billing',
                ) ??
                savedAddresses.find((a) => a.is_default) ??
                savedAddresses[0];
            void Promise.resolve().then(() =>
                setBilling(addressToPayload(defaultAddr)),
            );
        }
    }, [savedAddresses]);

    const selectedShippingMethod = shippingMethods.find(
        (m) => m.id === selectedMethod,
    );
    const isProviderConfigured = (id: string): boolean =>
        paymentMethods?.find((method) => method.id === id)?.configured ?? false;
    const paymentProviderFor = (method: PaymentMethodValue): string => {
        if (method === 'paynow' || method === 'paypo') return 'paynow';
        if (method === 'blik') {
            return isProviderConfigured('payu') ? 'payu' : 'paynow';
        }
        if (method === 'apple_pay' || method === 'google_pay') return 'payu';

        return method;
    };
    const isPickup = selectedShippingMethod?.carrier === 'pickup';
    const shippingCost = selectedShippingMethod?.base_price ?? 0;
    const subtotal = cart?.subtotal ?? 0;
    const freeThreshold =
        selectedShippingMethod?.free_shipping_threshold ?? null;
    const effectiveShipping =
        freeThreshold !== null && subtotal >= freeThreshold ? 0 : shippingCost;
    const total = subtotal + effectiveShipping;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitAttempted(true);

        let hasErrors = false;

        // 1. Guest email
        if (!token && !guestEmail.trim()) {
            hasErrors = true;
        }

        // 2. Addresses
        const billingErrors = validateAddress(billing);
        const shippingErrors = !sameAddress ? validateAddress(shipping) : {};
        if (
            Object.keys(billingErrors).length > 0 ||
            Object.keys(shippingErrors).length > 0
        ) {
            hasErrors = true;
        }

        // 3. Shipping method selection
        if (!selectedMethod) {
            hasErrors = true;
        } else {
            const selectedShippingCfg = shippingMethods.find(
                (m) => m.id === selectedMethod,
            );
            if (selectedShippingCfg && !selectedShippingCfg.configured) {
                hasErrors = true;
            }
            // 4. Pickup point selection
            if (selectedShippingCfg?.requires_pickup_point && !pickupPointId) {
                hasErrors = true;
            }
        }

        // 5. Terms acceptance
        if (!termsAccepted) {
            hasErrors = true;
        }

        // 6. Payment method/provider checks
        const selectedProvider = paymentProviderFor(paymentMethod);
        if (
            paymentMethod === 'blik' &&
            selectedProvider === 'payu' &&
            blikCode.length !== 6
        ) {
            hasErrors = true;
        }

        // If any validations failed, scroll to the first invalid field or error message and abort.
        if (hasErrors) {
            setTimeout(() => {
                const firstErrorEl = document.querySelector(
                    '[aria-invalid="true"], [role="alert"], #shipping-method-error, #pickup-point-error, #terms-error',
                );
                if (firstErrorEl) {
                    firstErrorEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                    if (
                        firstErrorEl instanceof HTMLInputElement ||
                        firstErrorEl instanceof HTMLTextAreaElement ||
                        firstErrorEl instanceof HTMLSelectElement
                    ) {
                        firstErrorEl.focus();
                    }
                }
            }, 50);
            return;
        }

        if (!cart || cart.items.length === 0) return;

        const shippingAddr = sameAddress ? billing : shipping;

        checkout(
            {
                guest_email: !token ? guestEmail : undefined,
                shipping_method_id: selectedMethod!,
                pickup_point_id: pickupPointId || undefined,
                payment_provider: selectedProvider,
                payment_method:
                    paymentMethod !== 'cash_on_delivery' &&
                    paymentMethod !== 'p24'
                        ? paymentMethod
                        : undefined,
                blik_code:
                    paymentMethod === 'blik' && selectedProvider === 'payu'
                        ? blikCode
                        : undefined,
                payment_token: paymentToken || undefined,
                billing_address: billing,
                shipping_address: shippingAddr,
                notes: notes || undefined,
                terms_accepted: termsAccepted,
                ga_client_id: getGaClientId() ?? undefined,
            },
            {
                onSuccess: (response) => {
                    setIsRedirecting(true);
                    const order = response.order;
                    const payment = response.payment;

                    trackPurchase({
                        transactionId: order.reference_number,
                        revenue: order.total,
                        currency: order.currency_code,
                        shippingCost: order.shipping_cost,
                        items: (cart?.items ?? []).map((item) => ({
                            item_id: item.variant_id,
                            item_name: item.product.name,
                            price: item.unit_price,
                            quantity: item.quantity,
                        })),
                    });
                    if (token && saveBilling) {
                        createAddress(payloadToAddress(billing, 'billing'));
                    }
                    if (token && saveShipping && !sameAddress) {
                        createAddress(
                            payloadToAddress(shippingAddr, 'shipping'),
                        );
                    }

                    if (payment.action === 'redirect' && payment.redirect_url) {
                        window.location.href = payment.redirect_url;
                    } else if (payment.action === 'wait' && payment.id) {
                        router.push(
                            lp(`/checkout/pending?payment=${payment.id}`),
                        );
                    } else {
                        const guestParam = !token ? '&guest=1' : '';
                        // Persist bank details for the success page before navigating
                        if (payment.bank_details) {
                            sessionStorage.setItem(
                                'bank_transfer_details',
                                JSON.stringify(payment.bank_details),
                            );
                        }
                        router.push(
                            lp(
                                `/checkout/success?ref=${order.reference_number}${guestParam}`,
                            ),
                        );
                    }
                },
            },
        );
    }

    // Render nothing until mounted — consistent with SSR (no token available server-side)
    if (!mounted) return null;

    if (isRedirecting) {
        return (
            <div
                className="mx-auto max-w-4xl px-4 py-16 text-center"
                role="status"
                aria-label={t(
                    'checkout.redirecting',
                    'Redirecting to payment...',
                )}
            >
                <div
                    className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
                    aria-hidden="true"
                />
                <p className="text-muted-foreground mt-4 animate-pulse text-sm">
                    {t(
                        'checkout.redirecting_to_payment',
                        'Redirecting to payment...',
                    )}
                </p>
            </div>
        );
    }

    if (cartLoading) {
        return (
            <div
                className="mx-auto max-w-4xl px-4 py-16 text-center"
                role="status"
                aria-label={t('common.loading', 'Loading')}
            >
                <div
                    className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
                    aria-hidden="true"
                />
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-16 text-center">
                <ShoppingBag className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h1 className="mb-2 text-2xl font-bold">
                    {t('checkout.empty_cart', 'Cart is empty')}
                </h1>
                <p className="text-muted-foreground mb-6">
                    {t(
                        'checkout.empty_cart_desc',
                        'Add items to your cart before checkout.',
                    )}
                </p>
                <Link
                    href={lp(storefrontRoutes?.product_listing ?? '/products')}
                    className="bg-primary text-primary-foreground inline-flex items-center rounded-xl px-6 py-3 text-sm font-medium hover:opacity-90"
                >
                    {t('checkout.browse_products', 'Browse products')}
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                    strategy="lazyOnload"
                />
            )}
            <h1 className="mb-6 text-3xl font-bold">
                {t('checkout.title', 'Checkout')}
            </h1>

            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    {/* ── Left column: forms ── */}
                    <div className="space-y-6 lg:col-span-3">
                        {/* ── Card 1: Contact & Address ── */}
                        <div className="border-border bg-card/50 space-y-5 rounded-xl border p-5 shadow-sm">
                            <div className="border-border flex items-center gap-3 border-b pb-3">
                                <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold">
                                    1
                                </span>
                                <h2 className="text-base font-semibold">
                                    {t(
                                        'checkout.contact_and_shipping',
                                        'Contact & Shipping',
                                    )}
                                </h2>
                            </div>
                            {!token && (
                                <GuestEmailStep
                                    guestEmail={guestEmail}
                                    submitAttempted={submitAttempted}
                                    onGuestEmailChange={setGuestEmail}
                                    onLoginSuccess={handleLoginSuccess}
                                />
                            )}
                            <CheckoutAddressSection
                                billing={billing}
                                sameAddress={sameAddress}
                                savedAddresses={savedAddresses}
                                saveBilling={saveBilling}
                                saveShipping={saveShipping}
                                shipping={shipping}
                                submitAttempted={submitAttempted}
                                token={token}
                                onBillingChange={setBilling}
                                onSameAddressChange={setSameAddress}
                                onSaveBillingChange={setSaveBilling}
                                onSaveShippingChange={setSaveShipping}
                                onShippingChange={setShipping}
                            />
                        </div>

                        {/* ── Card 2: Shipping Method ── */}
                        <div className="border-border bg-card/50 space-y-4 rounded-xl border p-5 shadow-sm">
                            <div className="border-border flex items-center gap-3 border-b pb-3">
                                <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold">
                                    2
                                </span>
                                <h2 className="text-base font-semibold">
                                    {t(
                                        'checkout.shipping_method_section',
                                        'Shipping Method',
                                    )}
                                </h2>
                            </div>
                            <ShippingMethodStep
                                billing={billing}
                                isLoading={methodsLoading}
                                pickupPointId={pickupPointId}
                                selectedMethod={selectedMethod}
                                selectedShippingMethod={selectedShippingMethod}
                                shippingMethods={shippingMethods}
                                subtotal={subtotal}
                                submitAttempted={submitAttempted}
                                onMethodChange={handleMethodChange}
                                onPickupPointChange={setPickupPointId}
                                formatPrice={formatPrice}
                            />
                        </div>

                        {/* ── Card 3: Payment Method ── */}
                        <div className="border-border bg-card/50 space-y-4 rounded-xl border p-5 shadow-sm">
                            <div className="border-border flex items-center gap-3 border-b pb-3">
                                <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold">
                                    3
                                </span>
                                <h2 className="text-base font-semibold">
                                    {t(
                                        'checkout.payment_method_section',
                                        'Payment Method',
                                    )}
                                </h2>
                            </div>
                            <CheckoutPaymentSection
                                blikCode={blikCode}
                                currencyCode={currencyCode}
                                isPickup={isPickup}
                                paymentMethod={paymentMethod}
                                paymentMethods={paymentMethods}
                                total={total}
                                onApplePayToken={setPaymentToken}
                                onBlikCode={setBlikCode}
                                onGooglePayToken={setPaymentToken}
                                onPaymentMethodChange={(method) => {
                                    setPaymentMethod(method);
                                    setPaymentToken('');
                                    if (cart) {
                                        trackAddPaymentInfo(
                                            cart.subtotal,
                                            cart.currency,
                                            method,
                                            cart.items,
                                        );
                                    }
                                }}
                            />
                        </div>

                        {/* Notes */}
                        <div className="border-border bg-card/50 rounded-xl border p-5 shadow-sm">
                            <label
                                htmlFor="order-notes"
                                className="mb-2 block text-sm font-medium"
                            >
                                {t(
                                    'checkout.optional_notes',
                                    'Order Notes (optional)',
                                )}
                            </label>
                            <textarea
                                id="order-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                maxLength={1000}
                                placeholder={t(
                                    'checkout.notes_placeholder',
                                    'Any special instructions...',
                                )}
                                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* ── Right column: summary ── */}
                    <div className="lg:col-span-2">
                        <OrderSummary
                            cart={cart}
                            effectiveShipping={effectiveShipping}
                            error={error}
                            isPending={isPending}
                            submitAttempted={submitAttempted}
                            subtotal={subtotal}
                            termsAccepted={termsAccepted}
                            total={total}
                            onTermsAcceptedChange={setTermsAccepted}
                            formatPrice={formatPrice}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
