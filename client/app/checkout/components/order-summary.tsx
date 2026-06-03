'use client';

import { ChevronDown, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useStorefrontRoutes } from '@/hooks/use-cms';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';

import type { OrderSummaryProps } from '../checkout.types';

export function OrderSummary({
    cart,
    effectiveShipping,
    error,
    isPending,
    selectedMethod,
    submitAttempted,
    subtotal,
    termsAccepted,
    total,
    onTermsAcceptedChange,
    formatPrice,
}: OrderSummaryProps) {
    const { t } = useTranslation();
    const lp = useLocalePath();
    const { data: storefrontRoutes } = useStorefrontRoutes();
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const termsUrl = lp(
        storefrontRoutes?.terms_of_service ?? '/terms-of-service',
    );
    const privacyUrl = lp(
        storefrontRoutes?.privacy_policy ?? '/privacy-policy',
    );

    const trustBadges = [
        {
            icon: ShieldCheck,
            label: t('checkout.secure_payment', 'Secure SSL payment'),
        },
        {
            icon: RotateCcw,
            label: t('checkout.returns_badge', '14 days for returns'),
        },
        {
            icon: Truck,
            label: t(
                'checkout.free_shipping_badge',
                'Free shipping from 200 zł',
            ),
        },
    ];

    return (
        <div className="border-border rounded-xl border p-5 lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">
                    {t('checkout.summary', 'Order Summary')}
                </h2>
                <button
                    type="button"
                    className="border-input bg-background hover:bg-accent inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-medium lg:hidden"
                    aria-expanded={isMobileExpanded}
                    aria-controls="checkout-order-summary-details"
                    onClick={() => setIsMobileExpanded((expanded) => !expanded)}
                >
                    <span>{formatPrice(total)}</span>
                    <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                            isMobileExpanded ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                    />
                </button>
            </div>

            <div
                id="checkout-order-summary-details"
                className={`${isMobileExpanded ? 'block' : 'hidden'} lg:block`}
            >
                <ul className="divide-border mb-4 divide-y text-sm">
                    {cart.items.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center justify-between gap-2 py-2"
                        >
                            <span className="text-muted-foreground truncate">
                                {item.product?.name ??
                                    t('product.no_image', 'Product')}
                                <span className="ml-1 text-xs">
                                    x{item.quantity}
                                </span>
                            </span>
                            <span className="shrink-0 font-medium">
                                {formatPrice(item.subtotal)}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="border-border space-y-1.5 border-t pt-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {t('checkout.products', 'Products')}
                        </span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    {cart.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>{t('checkout.discount', 'Discount')}</span>
                            <span>-{formatPrice(cart.discount_amount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {t('checkout.shipping_method', 'Shipping')}
                        </span>
                        <span>
                            {effectiveShipping === 0 ? (
                                <span className="text-green-600">
                                    {t('checkout.free', 'Free')}
                                </span>
                            ) : (
                                formatPrice(effectiveShipping)
                            )}
                        </span>
                    </div>
                    <div className="border-border flex justify-between border-t pt-2 text-base font-bold">
                        <span>{t('cart.total', 'Total')}</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>

                <div className="border-border text-muted-foreground mt-4 flex flex-col gap-2 border-t pt-4 text-xs">
                    {trustBadges.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2">
                            <Icon
                                className="text-primary h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                            />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <p
                    role="alert"
                    className="bg-destructive/10 text-destructive mt-3 rounded-lg p-2 text-xs"
                >
                    {t('checkout.error', 'Error')}: {error.message}
                </p>
            )}

            <div className="mt-5">
                <label
                    htmlFor="terms-accepted"
                    className="flex cursor-pointer items-start gap-3"
                >
                    <input
                        id="terms-accepted"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) =>
                            onTermsAcceptedChange(e.target.checked)
                        }
                        className="accent-primary mt-0.5 h-4 w-4 shrink-0"
                        required
                        aria-describedby={
                            submitAttempted && !termsAccepted
                                ? 'terms-error'
                                : undefined
                        }
                        aria-invalid={submitAttempted && !termsAccepted}
                    />
                    <span className="text-muted-foreground text-xs">
                        {t(
                            'checkout.terms_accept_prefix',
                            'I have read and accept the',
                        )}{' '}
                        <Link
                            href={termsUrl}
                            target="_blank"
                            className="hover:text-foreground underline"
                        >
                            {t('checkout.terms_link', 'Terms of Service')}
                        </Link>{' '}
                        {t('checkout.and', 'and')}{' '}
                        <Link
                            href={privacyUrl}
                            target="_blank"
                            className="hover:text-foreground underline"
                        >
                            {t('checkout.privacy_link', 'Privacy Policy')}
                        </Link>
                        {'. '}
                        {t(
                            'checkout.withdrawal_note',
                            'I am aware of my right to withdraw within 14 days.',
                        )}
                    </span>
                </label>

                {submitAttempted && !termsAccepted && (
                    <p
                        id="terms-error"
                        role="alert"
                        className="text-destructive mt-1 text-xs"
                    >
                        {t(
                            'checkout.terms_required',
                            'You must accept the terms to place an order.',
                        )}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending || !selectedMethod || !termsAccepted}
                aria-busy={isPending}
                className="bg-primary text-primary-foreground mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending
                    ? t('checkout.placing_order', 'Placing order...')
                    : t('checkout.place_order', 'Place Order')}
            </button>
        </div>
    );
}
