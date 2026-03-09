"use client";

import { GitCompare } from "lucide-react";

import { useIsInComparison, useToggleComparison, useComparisonIds } from "@/hooks/use-comparison";
import { useTranslation } from "@/hooks/use-translation";

const MAX_COMPARE = 4;

interface Props {
  productId: number;
  className?: string;
}

export function CompareButton({ productId, className = "" }: Props) {
  const { t } = useTranslation();
  const inComparison = useIsInComparison(productId);
  const toggle = useToggleComparison(productId);
  const ids = useComparisonIds();
  const isFull = ids.length >= MAX_COMPARE && !inComparison;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggle();
      }}
      disabled={isFull}
      title={isFull ? t("compare.max_reached", "Max 4 products") : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
        inComparison
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-accent"
      } ${className}`}
    >
      <GitCompare className="h-3.5 w-3.5" />
      {inComparison
        ? t("compare.remove", "Remove")
        : t("compare.add", "Compare")}
    </button>
  );
}
