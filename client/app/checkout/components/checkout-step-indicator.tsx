'use client';

import { Check } from 'lucide-react';

import type { CheckoutStepIndicatorProps } from '../checkout.types';

export function CheckoutStepIndicator({
    label,
    number,
    state,
}: CheckoutStepIndicatorProps) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    state === 'completed'
                        ? 'bg-green-500 text-white'
                        : state === 'current'
                          ? 'bg-primary text-primary-foreground shadow-[var(--store-focus-ring)]'
                          : 'bg-muted text-muted-foreground'
                }`}
            >
                {state === 'completed' ? <Check className="h-4 w-4" /> : number}
            </span>
            <span
                className={`hidden text-sm font-medium sm:inline ${
                    state === 'upcoming'
                        ? 'text-muted-foreground'
                        : 'text-foreground'
                }`}
            >
                {label}
            </span>
        </div>
    );
}
