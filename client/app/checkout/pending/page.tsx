"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader2, XCircle } from "lucide-react";
import { useLocalePath } from "@/hooks/use-locale";
import { useTranslation } from "@/hooks/use-translation";
import { usePaymentStatus } from "@/hooks/use-payment-status";

const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

export default function CheckoutPendingPage() {
  const router = useRouter();
  const lp = useLocalePath();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const paymentIdParam = searchParams.get("payment");
  const paymentId = paymentIdParam ? parseInt(paymentIdParam, 10) : null;

  const { data, isError } = usePaymentStatus(paymentId);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start timeout on mount
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      router.push(lp("/checkout?error=timeout"));
    }, TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // React to status changes
  useEffect(() => {
    if (!data) return;

    if (data.status === "completed") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      router.push(lp(`/checkout/success?ref=${data.order_reference ?? ""}`));
    }

    if (data.status === "failed") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      router.push(lp("/checkout?error=payment_failed"));
    }
  }, [data, router, lp]);

  if (isError || paymentId === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h1 className="mb-2 text-xl font-bold">{t("checkout.payment_error", "Payment Error")}</h1>
        <p className="mb-6 text-muted-foreground">
          {t("checkout.payment_error_desc", "Unable to verify payment status.")}
        </p>
        <button
          onClick={() => router.push(lp("/checkout"))}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {t("checkout.back_to_cart", "Back to Cart")}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mb-6 flex justify-center">
        <Loader2 className="h-14 w-14 animate-spin text-primary" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">{t("checkout.awaiting_payment", "Awaiting Payment")}</h1>
      <p className="text-muted-foreground">
        {t("checkout.approve_in_app", "Approve the payment in your banking app.")}
        <br />
        {t("checkout.page_auto_refresh", "This page will refresh automatically.")}
      </p>
      <p className="mt-6 text-xs text-muted-foreground">
        {t("checkout.payment_expires", "Payment will expire in 3 minutes.")}
      </p>
    </div>
  );
}
