'use client';

import { useEffect, useRef } from 'react';
import type { BlikInputProps } from './blik-input.types';

export function BlikInput({ value, onChange, autoFocus = true }: BlikInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange(digits);
  }

  const isValid = value.length === 6;

  return (
    <div className="mt-3">
      <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
        Kod BLIK (6 cyfr)
      </label>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        value={value}
        onChange={handleChange}
        placeholder="000000"
        className={`bg-background focus:ring-ring w-full rounded-lg border px-4 py-2.5 text-center font-mono text-xl tracking-[0.5em] focus:ring-2 focus:outline-none ${
          value.length > 0 && !isValid
            ? 'border-destructive focus:ring-destructive'
            : 'border-input'
        }`}
        autoComplete="one-time-code"
      />
      {value.length > 0 && !isValid && (
        <p className="text-destructive mt-1 text-xs">Wprowadź 6-cyfrowy kod BLIK</p>
      )}
    </div>
  );
}
