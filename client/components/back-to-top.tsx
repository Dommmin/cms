'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useComparisonIds } from '@/hooks/use-comparison';
import { useTranslation } from '@/hooks/use-translation';

export function BackToTop() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const comparisonIds = useComparisonIds();
  // When comparison bar is visible (bottom-0, ~56px tall), lift the button above it
  const bottomClass = comparisonIds.length > 0 ? 'bottom-20' : 'bottom-6';

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('ui.back_to_top', 'Back to top')}
      className={`bg-primary text-primary-foreground fixed right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all hover:opacity-90 ${bottomClass}`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
