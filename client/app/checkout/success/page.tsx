'use client';

import { Building2, CheckCircle2, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import type { BankDetails } from '@/api/checkout';
import { useCurrency } from '@/hooks/use-currency';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';

function SuccessContent() {
    const searchParams = useSearchParams();
    const ref = searchParams.get('ref');
    const isGuest = searchParams.get('guest') === '1';
    const { t } = useTranslation();
    const lp = useLocalePath();
    const { formatPrice } = useCurrency();

    const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);

    // Read bank details that checkout page stored before redirecting
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('bank_transfer_details');
            if (raw) {
                const parsed = JSON.parse(raw) as BankDetails;
                sessionStorage.removeItem('bank_transfer_details');
                void Promise.resolve().then(() => setBankDetails(parsed));
            }
        } catch {
            // ignore parse errors
        }
    }, []);

    return (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
            <CheckCircle2
                className="mx-auto mb-4 h-16 w-16 text-green-500"
                aria-hidden="true"
            />
            <h1 className="mb-2 text-3xl font-bold">
                {t('checkout.success_title', 'Order Placed!')}
            </h1>
            {ref && (
                <p className="text-primary mb-1 text-lg font-medium">#{ref}</p>
            )}
            <p className="text-muted-foreground mb-8">
                {t(
                    'checkout.success_desc',
                    "Thank you for your order. We've sent a confirmation to your email address.",
                )}
            </p>

            {/* Bank transfer details */}
            {bankDetails && (
                <div className="border-primary/30 bg-primary/5 mb-8 rounded-xl border p-5 text-left text-sm">
                    <div className="text-primary mb-3 flex items-center gap-2 font-semibold">
                        <Building2 className="h-4 w-4" aria-hidden="true" />
                        {t(
                            'checkout.bank_transfer_instructions',
                            'Transfer details',
                        )}
                    </div>
                    <dl className="space-y-2">
                        {bankDetails.account_name && (
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    {t(
                                        'checkout.bank_transfer_account_name',
                                        'Account holder',
                                    )}
                                </dt>
                                <dd className="font-medium">
                                    {bankDetails.account_name}
                                </dd>
                            </div>
                        )}
                        {bankDetails.bank_name && (
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    {t(
                                        'checkout.bank_transfer_bank_name',
                                        'Bank',
                                    )}
                                </dt>
                                <dd className="font-medium">
                                    {bankDetails.bank_name}
                                </dd>
                            </div>
                        )}
                        {bankDetails.iban && (
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    {t('checkout.bank_transfer_iban', 'IBAN')}
                                </dt>
                                <dd className="font-mono font-semibold tracking-wider">
                                    {bankDetails.iban}
                                </dd>
                            </div>
                        )}
                        {bankDetails.swift && (
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    {t(
                                        'checkout.bank_transfer_swift',
                                        'SWIFT / BIC',
                                    )}
                                </dt>
                                <dd className="font-mono font-medium">
                                    {bankDetails.swift}
                                </dd>
                            </div>
                        )}
                        <div className="border-primary/20 flex justify-between gap-3 border-t pt-2">
                            <dt className="text-muted-foreground">
                                {t('checkout.bank_transfer_amount', 'Amount')}
                            </dt>
                            <dd className="text-primary font-bold">
                                {formatPrice(bankDetails.amount)}
                            </dd>
                        </div>
                        {bankDetails.reference && (
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    {t(
                                        'checkout.bank_transfer_reference',
                                        'Transfer title',
                                    )}
                                </dt>
                                <dd className="text-primary font-semibold">
                                    {bankDetails.reference}
                                </dd>
                            </div>
                        )}
                    </dl>
                    <p className="text-muted-foreground mt-3 text-xs">
                        {t(
                            'checkout.bank_transfer_note',
                            'Your order will be processed after we receive the payment.',
                        )}
                    </p>
                </div>
            )}

            <div className="border-border mb-8 rounded-xl border p-5 text-left text-sm">
                <h2 className="mb-3 font-semibold">
                    {t('checkout.whats_next', "What's next?")}
                </h2>
                <ol className="text-muted-foreground space-y-2">
                    <li className="flex gap-3">
                        <span className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                            1
                        </span>
                        {t(
                            'checkout.next_step_1',
                            "You'll receive an order confirmation email.",
                        )}
                    </li>
                    <li className="flex gap-3">
                        <span className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                            2
                        </span>
                        {bankDetails
                            ? t(
                                  'checkout.next_step_2_bank',
                                  'Complete your bank transfer using the details above.',
                              )
                            : t(
                                  'checkout.next_step_2',
                                  "We'll notify you when your order has been shipped.",
                              )}
                    </li>
                    <li className="flex gap-3">
                        <span className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                            3
                        </span>
                        {isGuest
                            ? t(
                                  'checkout.next_step_3_guest',
                                  'Save your order reference number to follow up later.',
                              )
                            : t(
                                  'checkout.next_step_3',
                                  'Track your order in your account.',
                              )}
                    </li>
                </ol>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                {isGuest ? (
                    <Link
                        href={lp('/products')}
                        className="bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium hover:opacity-90"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        {t('checkout.continue_shopping', 'Continue Shopping')}
                    </Link>
                ) : (
                    <>
                        <Link
                            href={lp('/account/orders')}
                            className="bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium hover:opacity-90"
                        >
                            <Package className="h-4 w-4" />
                            {t('account.my_orders', 'My Orders')}
                        </Link>
                        <Link
                            href={lp('/products')}
                            className="border-border hover:bg-accent inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            {t(
                                'checkout.continue_shopping',
                                'Continue Shopping',
                            )}
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense>
            <SuccessContent />
        </Suspense>
    );
}
