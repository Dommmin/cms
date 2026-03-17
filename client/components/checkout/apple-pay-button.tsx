"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface ApplePayButtonProps {
  amount: number;
  currency: string;
  onToken: (token: string) => void;
}

declare global {
  interface Window {
    ApplePaySession?: {
      canMakePayments(): boolean;
      new (version: number, request: object): ApplePaySessionInstance;
    };
  }
}

interface ApplePaySessionInstance {
  onvalidatemerchant: (event: { validationURL: string }) => void;
  onpaymentauthorized: (event: { payment: { token: { paymentData: object } } }) => void;
  oncancel: () => void;
  completeMerchantValidation(session: object): void;
  completePayment(status: number): void;
  begin(): void;
}

export function ApplePayButton({ amount, currency, onToken }: ApplePayButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ApplePaySession?.canMakePayments()) {
      setIsAvailable(true);
    }
  }, []);

  if (!isAvailable) return null;

  function handleClick() {
    const request = {
      countryCode: "PL",
      currencyCode: currency.toUpperCase(),
      supportedNetworks: ["visa", "masterCard"],
      merchantCapabilities: ["supports3DS"],
      total: {
        label: "Zamówienie",
        amount: (amount / 100).toFixed(2),
      },
    };

    const session = new window.ApplePaySession!(3, request) as ApplePaySessionInstance;

    session.onvalidatemerchant = async (event) => {
      try {
        const { data } = await api.post("/payments/apple-pay/validate-merchant", {
          validation_url: event.validationURL,
          domain: window.location.hostname,
        });
        session.completeMerchantValidation(data);
      } catch {
        session.completeMerchantValidation({});
      }
    };

    session.onpaymentauthorized = (event) => {
      const tokenData = JSON.stringify(event.payment.token.paymentData);
      onToken(tokenData);
      session.completePayment(0); // STATUS_SUCCESS = 0
    };

    session.oncancel = () => {};

    session.begin();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:opacity-90"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <span className="mr-1.5 text-base">🍎</span> Pay
    </button>
  );
}
