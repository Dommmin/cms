'use client';

import { useLocalePath } from '@/hooks/use-locale';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

export default function CheckoutPendingPage() {
    const router = useRouter();
    const lp = useLocalePath();
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const paymentIdParam = searchParams.get('payment');
    const paymentId = paymentIdParam ? parseInt(paymentIdParam, 10) : null;
    /** Present when coming from pay-again flow — order already exists */
    const orderRef = searchParams.get('ref');

    const { data, isError } = usePaymentStatus(paymentId);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [mounted, setMounted] = useState(false);

    /** Navigate to the right failure destination */
    function goToFailure() {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (orderRef) {
            router.push(lp(`/account/orders/${orderRef}?error=payment_failed`));
        } else {
            router.push(lp('/checkout?error=payment_failed'));
        }
    }

    // Start timeout on mount
    useEffect(() => {
        setMounted(true);
        timeoutRef.current = setTimeout(goToFailure, TIMEOUT_MS);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // React to status changes
    useEffect(() => {
        if (!data) return;

        if (data.status === 'completed') {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (orderRef) {
                // pay-again: order already exists, go to order detail
                router.push(lp(`/account/orders/${orderRef}?payment=success`));
            } else {
                router.push(
                    lp(`/checkout/success?ref=${data.order_reference ?? ''}`),
                );
            }
        }

        if (data.status === 'failed') {
            goToFailure();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    if (isError || paymentId === null) {
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <XCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
                <h1 className="mb-2 text-xl font-bold">
                    {t('checkout.payment_error', 'Payment Error')}
                </h1>
                <p className="text-muted-foreground mb-6">
                    {t(
                        'checkout.payment_error_desc',
                        'Unable to verify payment status.',
                    )}
                </p>
                <button
                    onClick={() =>
                        orderRef
                            ? router.push(lp(`/account/orders/${orderRef}`))
                            : router.push(lp('/checkout'))
                    }
                    className="bg-primary text-primary-foreground rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90"
                >
                    {orderRef
                        ? t('order.back_to_order', 'Back to Order')
                        : t('checkout.back_to_cart', 'Back to Cart')}
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-md px-4 py-24 text-center">
            <div className="mb-6 flex justify-center">
                <Loader2 className="text-primary h-14 w-14 animate-spin" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">
                {t('checkout.awaiting_payment', 'Awaiting Payment')}
            </h1>
            <p className="text-muted-foreground">
                {t(
                    'checkout.approve_in_app',
                    'Approve the payment in your banking app.',
                )}
                <br />
                {t(
                    'checkout.page_auto_refresh',
                    'This page will refresh automatically.',
                )}
            </p>
            <p className="text-muted-foreground mt-6 text-xs">
                {t(
                    'checkout.payment_expires',
                    'Payment will expire in 3 minutes.',
                )}
            </p>

            {mounted && orderRef && (
                <div className="border-border mt-8 border-t pt-6">
                    <button
                        onClick={goToFailure}
                        className="border-border hover:bg-accent text-foreground inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-all"
                    >
                        <XCircle className="text-destructive h-4 w-4" />
                        {t(
                            'checkout.cancel_and_retry',
                            'Cancel & Retry Payment',
                        )}
                    </button>
                    <p className="text-muted-foreground mt-2 text-xs">
                        {t(
                            'checkout.retry_desc',
                            "If your bank app didn't open or the transaction failed, click above to choose another payment method.",
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}
