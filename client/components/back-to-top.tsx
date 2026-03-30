'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTranslation } from '@/hooks/use-translation';

export function BackToTop() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

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
      className="bg-primary text-primary-foreground fixed right-6 bottom-6 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-opacity hover:opacity-90"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
