'use client';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useState } from 'react';
import type { BlockRendererProps } from '../block-renderer.types';

interface Plan {
    name: string;
    price_monthly: number;
    price_yearly: number;
    features: string[];
    is_popular?: boolean;
    cta_label?: string;
    cta_url?: string;
}

export function PricingCardsBlock({ block }: BlockRendererProps) {
    const {
        title,
        subtitle,
        show_toggle = true,
        plans = [],
    } = block.configuration as {
        title?: string;
        subtitle?: string;
        show_toggle?: boolean;
        plans?: Plan[];
    };

    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className="py-8 text-center">
            {title && (
                <h2 className="mb-2 text-3xl font-bold tracking-tight">
                    {title}
                </h2>
            )}
            {subtitle && (
                <p className="text-muted-foreground mb-6">{subtitle}</p>
            )}
            {show_toggle && (
                <div className="mb-8 inline-flex items-center gap-3 rounded-full border p-1">
                    <button
                        type="button"
                        onClick={() => setIsYearly(false)}
                        className={cn(
                            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                            !isYearly
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsYearly(true)}
                        className={cn(
                            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                            isYearly
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        Yearly{' '}
                        <span className="text-xs font-semibold text-green-600">
                            -20%
                        </span>
                    </button>
                </div>
            )}
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(plans as Plan[]).map((plan, i) => (
                    <div
                        key={i}
                        className={cn(
                            'relative flex flex-col rounded-2xl border p-6 text-left',
                            plan.is_popular
                                ? 'border-primary shadow-primary/10 shadow-lg'
                                : 'border-border',
                        )}
                    >
                        {plan.is_popular && (
                            <span className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold">
                                Popular
                            </span>
                        )}
                        <h3 className="mb-1 text-lg font-bold">{plan.name}</h3>
                        <div className="mb-4">
                            <span className="text-4xl font-black">
                                {isYearly
                                    ? plan.price_yearly
                                    : plan.price_monthly}
                            </span>
                            <span className="text-muted-foreground text-sm">
                                /{isYearly ? 'yr' : 'mo'}
                            </span>
                        </div>
                        <ul className="mb-6 flex-1 space-y-2">
                            {(plan.features ?? []).map((f, fi) => (
                                <li
                                    key={fi}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <Check className="text-primary h-4 w-4 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        {plan.cta_url && (
                            <a
                                href={plan.cta_url}
                                className={cn(
                                    'mt-auto rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-colors',
                                    plan.is_popular
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        : 'border-border hover:border-primary hover:text-primary border',
                                )}
                            >
                                {plan.cta_label ?? 'Get started'}
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
