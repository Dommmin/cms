"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useLocale } from "@/hooks/use-locale";

type LocaleWithCurrency = {
  code: string;
  currency_code: string | null;
  currency: {
    code: string;
    symbol: string;
    decimal_places: number;
    is_base: boolean;
    exchange_rate: number;
  } | null;
};

async function fetchLocales(): Promise<LocaleWithCurrency[]> {
  const { data } = await api.get<LocaleWithCurrency[]>("/locales");
  return data;
}

/**
 * Returns a `formatPrice(cents)` function that converts PLN cents
 * to the current locale's currency using the configured exchange rate.
 *
 * Example:
 *   locale=pl → currency=PLN → 1499 → "14,99 zł"
 *   locale=en → currency=USD (rate=0.25) → 1499 → "$3.75"
 */
export function useCurrency() {
  const locale = useLocale();

  const { data: locales } = useQuery({
    queryKey: ["locales"],
    queryFn: fetchLocales,
    staleTime: Infinity,
  });

  const localeData = locales?.find((l) => l.code === locale);
  const currency = localeData?.currency ?? null;

  const formatPrice = (cents: number): string => {
    if (!currency) {
      // Fallback: PLN
      return new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: "PLN",
      }).format(cents / 100);
    }

    const divisor = 10 ** currency.decimal_places;
    const rate = currency.is_base ? 1.0 : currency.exchange_rate;
    const amount = (cents / divisor) * rate;

    // Pick a sensible locale for formatting based on currency
    const intlLocale =
      currency.code === "PLN"
        ? "pl-PL"
        : currency.code === "EUR"
          ? "de-DE"
          : "en-US";

    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: currency.code,
    }).format(amount);
  };

  return {
    currency,
    currencyCode: currency?.code ?? "PLN",
    formatPrice,
  };
}
