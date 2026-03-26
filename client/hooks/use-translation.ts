'use client';

import { TranslationContext } from '@/providers/translation-provider';
import { useContext } from 'react';

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return ctx;
}
