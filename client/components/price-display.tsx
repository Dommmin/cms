"use client";

import { useCurrency } from "@/hooks/use-currency";
import { useTranslation } from "@/hooks/use-translation";

interface Props {
  price: number;
  compareAtPrice?: number | null;
  omnibusPrice?: number | null;
  isOnSale?: boolean;
  /** Tailwind text size class for the main price, e.g. "text-lg" (default) or "text-sm" */
  size?: "sm" | "base" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};

export function PriceDisplay({ price, compareAtPrice, omnibusPrice, isOnSale, size = "lg", className }: Props) {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const onSale = isOnSale ?? (!!compareAtPrice && compareAtPrice > price);

  return (
    <div className={className}>
      <div className="flex items-baseline gap-2">
        <span className={`${sizeClasses[size]} font-semibold`}>{formatPrice(price)}</span>
        {onSale && compareAtPrice && (
          <span className="text-sm text-muted-foreground line-through">{formatPrice(compareAtPrice)}</span>
        )}
      </div>
      {onSale && omnibusPrice != null && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("product.omnibus_label", "Lowest price in last 30 days")}:{" "}
          <span className="font-medium">{formatPrice(omnibusPrice)}</span>
        </p>
      )}
    </div>
  );
}
