"use client";

import { useEffect, useRef } from "react";

interface BlikInputProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export function BlikInput({ value, onChange, autoFocus = true }: BlikInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(digits);
  }

  const isValid = value.length === 6;

  return (
    <div className="mt-3">
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
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
        className={`w-full rounded-lg border bg-background px-4 py-2.5 text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-ring ${
          value.length > 0 && !isValid
            ? "border-destructive focus:ring-destructive"
            : "border-input"
        }`}
        autoComplete="one-time-code"
      />
      {value.length > 0 && !isValid && (
        <p className="mt-1 text-xs text-destructive">
          Wprowadź 6-cyfrowy kod BLIK
        </p>
      )}
    </div>
  );
}
