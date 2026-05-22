'use client';

import { useState } from 'react';

import { Check } from 'lucide-react';
import Link from 'next/link';

import type {
    PricingTableConfig,
    PricingTableProps,
} from './pricing-table.types';

export function PricingTableBlock({ block }: PricingTableProps) {
    const cfg = block.configuration as PricingTableConfig;
    const plans = cfg.plans ?? [];
    const currency = cfg.currency_symbol ?? 'zł';
    const showToggle = cfg.billing_toggle === true;

    const [isYearly, setIsYearly] = useState(false);

    if (plans.length === 0) return null;

    return (
        <div className="flex flex-col gap-10">
            {(cfg.title || cfg.subtitle) && (
                <div className="text-center">
                    {cfg.title && (
                        <h2 className="text-2xl font-bold md:text-3xl">
                            {cfg.title}
                        </h2>
                    )}
                    {cfg.subtitle && (
                        <p className="text-muted-foreground mt-2">
                            {cfg.subtitle}
                        </p>
                    )}
                </div>
            )}

            {showToggle && (
                <div className="flex items-center justify-center gap-4">
                    <span
                        className={
                            !isYearly
                                ? 'font-semibold'
                                : 'text-muted-foreground'
                        }
                    >
                        Monthly
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsYearly(!isYearly)}
                        className={`relative h-6 w-12 rounded-full transition-colors ${isYearly ? 'bg-primary' : 'bg-muted'}`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isYearly ? 'translate-x-6' : ''}`}
                        />
                    </button>
                    <span
                        className={
                            isYearly ? 'font-semibold' : 'text-muted-foreground'
                        }
                    >
                        Yearly{' '}
                        <span className="ml-1 text-xs font-medium text-green-600">
                            Save ~20%
                        </span>
                    </span>
                </div>
            )}

            <div
                className={`grid gap-6 ${
                    plans.length === 1
                        ? 'mx-auto max-w-sm'
                        : plans.length === 2
                          ? 'md:grid-cols-2'
                          : plans.length === 4
                            ? 'md:grid-cols-4'
                            : 'md:grid-cols-3'
                }`}
            >
                {plans.map((plan, i) => {
                    const price = isYearly
                        ? plan.price_yearly
                        : plan.price_monthly;
                    const features = (plan.features ?? '')
                        .split('\n')
                        .map((f) => f.trim())
                        .filter(Boolean);

                    return (
                        <div
                            key={i}
                            className={`elevated-surface interactive-surface relative flex flex-col rounded-2xl p-8 ${
                                plan.is_featured
                                    ? 'border-primary ring-primary/10 ring-1'
                                    : ''
                            }`}
                        >
                            {plan.badge && (
                                <span
                                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold ${
                                        plan.is_featured
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-accent text-accent-foreground'
                                    }`}
                                >
                                    {plan.badge}
                                </span>
                            )}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold">
                                    {plan.name}
                                </h3>
                                {plan.description && (
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        {plan.description}
                                    </p>
                                )}
                            </div>

                            {price && (
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold">
                                        {price}
                                        <span className="text-sm">
                                            {currency}
                                        </span>
                                    </span>
                                    <span className="text-muted-foreground ml-1 text-sm">
                                        /
                                        {isYearly ? 'mo (billed yearly)' : 'mo'}
                                    </span>
                                </div>
                            )}

                            {features.length > 0 && (
                                <ul className="mb-8 flex flex-1 flex-col gap-3">
                                    {features.map((feat, fi) => (
                                        <li
                                            key={fi}
                                            className="flex items-start gap-2 text-sm"
                                        >
                                            <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {plan.cta_label && plan.cta_url && (
                                <Link
                                    href={plan.cta_url}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 mt-auto block rounded-lg px-6 py-3 text-center font-semibold transition-colors"
                                >
                                    {plan.cta_label}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
