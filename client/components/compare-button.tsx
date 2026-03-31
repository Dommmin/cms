'use client';

import { GitCompare } from 'lucide-react';

import { useComparisonIds, useIsInComparison, useToggleComparison } from '@/hooks/use-comparison';
import { useTranslation } from '@/hooks/use-translation';
import type { CompareButtonProps } from './compare-button.types';

const MAX_COMPARE = 4;

export function CompareButton({ productId, className = '', iconOnly = false }: CompareButtonProps) {
  const { t } = useTranslation();
  const inComparison = useIsInComparison(productId);
  const toggle = useToggleComparison(productId);
  const ids = useComparisonIds();
  const isFull = ids.length >= MAX_COMPARE && !inComparison;

  const label = inComparison ? t('compare.remove', 'Remove') : t('compare.add', 'Compare');

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggle();
      }}
      disabled={isFull}
      aria-label={
        iconOnly ? (isFull ? t('compare.max_reached', 'Max 4 products') : label) : undefined
      }
      title={isFull ? t('compare.max_reached', 'Max 4 products') : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
        iconOnly ? 'h-8 w-8 justify-center' : 'px-3 py-1.5 text-xs font-medium'
      } ${
        inComparison
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background hover:bg-accent'
      } ${className}`}
    >
      <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
      {!iconOnly && label}
    </button>
  );
}
