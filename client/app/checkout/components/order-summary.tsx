'use client';

import { ChevronDown, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useApplyDiscount, useRemoveDiscount } from '@/hooks/use-cart';
import { useStorefrontRoutes } from '@/hooks/use-cms';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';

import type { OrderSummaryProps } from '../checkout.types';

export function OrderSummary({
    cart,
    effectiveShipping,
    error,
    isPending,
    submitAttempted,
    subtotal,
    termsAccepted,
    total,
    onTermsAcceptedChange,
    formatPrice,
}: Omit<OrderSummaryProps, 'selectedMethod'>) {
    const { mutate: applyCode, isPending: applyingCode } = useApplyDiscount();
    const { mutate: removeCode, isPending: removingCode } = useRemoveDiscount();
    const [promoCode, setPromoCode] = useState('');
    const [promoError, setPromoError] = useState<string | null>(null);

    const handleApplyPromo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!promoCode.trim()) return;
        setPromoError(null);
        applyCode(promoCode.trim(), {
            onSuccess: () => {
                setPromoCode('');
            },
            onError: (err: unknown) => {
                const axiosError = err as {
                    response?: {
                        data?: {
                            errors?: { code?: string[] };
                            message?: string;
                        };
                    };
                    message?: string;
                };
                const msg =
                    axiosError.response?.data?.errors?.code?.[0] ||
                    axiosError.response?.data?.message ||
                    axiosError.message ||
                    'Invalid code';
                setPromoError(msg);
            },
        });
    };

    const handleRemovePromo = () => {
        setPromoError(null);
        removeCode();
    };
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
                            className="flex items-center gap-3 py-2.5"
                        >
                            <div className="bg-muted border-border relative h-14 w-14 shrink-0 rounded-lg border">
                                {item.product?.thumbnail?.url ? (
                                    <Image
                                        src={item.product.thumbnail.url}
                                        alt={item.product.name}
                                        fill
                                        className="rounded-lg object-cover"
                                        sizes="56px"
                                    />
                                ) : (
                                    <div className="text-muted-foreground flex h-full items-center justify-center text-[10px]">
                                        No img
                                    </div>
                                )}
                                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-600 text-[10px] font-semibold text-white">
                                    {item.quantity}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-foreground truncate text-sm font-medium">
                                    {item.product?.name ??
                                        t('product.no_image', 'Product')}
                                </p>
                                {item.variant?.sku && (
                                    <p className="text-muted-foreground font-mono text-[10px]">
                                        {item.variant.sku}
                                    </p>
                                )}
                            </div>
                            <span className="shrink-0 text-sm font-medium">
                                {formatPrice(item.subtotal)}
                            </span>
                        </li>
                    ))}
                </ul>

                {/* Promo code input block */}
                <div className="border-border border-t pt-4 pb-4">
                    {!cart.discount_code ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder={t(
                                    'checkout.promo_placeholder',
                                    'Promo code',
                                )}
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                disabled={applyingCode}
                                className="border-input bg-background focus:ring-ring h-9 flex-1 rounded-lg border px-3 text-xs outline-none focus:ring-2"
                            />
                            <button
                                type="button"
                                onClick={handleApplyPromo}
                                disabled={applyingCode || !promoCode.trim()}
                                className="h-9 cursor-pointer rounded-lg bg-neutral-800 px-4 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 dark:bg-neutral-200 dark:text-black"
                            >
                                {applyingCode
                                    ? '...'
                                    : t('checkout.apply_promo', 'Apply')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-400">
                            <span className="font-medium">
                                {t('checkout.promo_code', 'Code')}:{' '}
                                <span className="font-bold">
                                    {cart.discount_code}
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={handleRemovePromo}
                                disabled={removingCode}
                                className="text-destructive cursor-pointer font-semibold hover:underline"
                            >
                                {removingCode
                                    ? '...'
                                    : t('checkout.remove_promo', 'Remove')}
                            </button>
                        </div>
                    )}
                    {promoError && (
                        <p className="text-destructive mt-1.5 text-xs font-medium">
                            {promoError}
                        </p>
                    )}
                </div>

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
                disabled={isPending}
                aria-busy={isPending}
                className="bg-primary text-primary-foreground mt-4 w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending
                    ? t('checkout.placing_order', 'Placing order...')
                    : t('checkout.place_order', 'Place Order')}
            </button>
        </div>
    );
}
