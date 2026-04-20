import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import * as AnalyticsController from '@/actions/App/Http/Controllers/Admin/AnalyticsController';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ConversionProps } from './conversion.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Analytics', href: '' },
    { title: 'Conversion Funnel', href: '' },
];

export default function ConversionReport({ data, filters }: ConversionProps) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    function applyFilters() {
        router.get(
            AnalyticsController.conversion.url(),
            { from, to },
            { preserveState: true, replace: true },
        );
    }

    const maxCount = Math.max(...data.stages.map((s) => s.count), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conversion Funnel" />
            <Wrapper>
                <PageHeader
                    title="Conversion Funnel"
                    description="Track how customers move through the purchase journey."
                />

                {/* Date filters */}
                <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border bg-card p-4">
                    <div className="space-y-1">
                        <Label htmlFor="from">From</Label>
                        <Input
                            id="from"
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-40"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="to">To</Label>
                        <Input
                            id="to"
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-40"
                        />
                    </div>
                    <Button onClick={applyFilters}>Apply</Button>
                </div>

                {/* Conversion rate metrics */}
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Cart → Checkout
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {data.cart_to_checkout_rate}%
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Checkout → Purchase
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {data.checkout_to_purchase_rate}%
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Overall Conversion
                        </p>
                        <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                            {data.overall_conversion_rate}%
                        </p>
                    </div>
                </div>

                {/* Funnel visualization */}
                <div className="rounded-xl border bg-card p-6">
                    <h2 className="mb-6 text-base font-semibold">
                        Funnel Stages
                    </h2>
                    <div className="space-y-4">
                        {data.stages.map((stage, index) => (
                            <div key={stage.name} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                            {index + 1}
                                        </span>
                                        <span className="font-medium">
                                            {stage.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-muted-foreground tabular-nums">
                                            {stage.count.toLocaleString()}
                                        </span>
                                        <span className="w-12 text-right font-medium tabular-nums">
                                            {stage.rate}%
                                        </span>
                                    </div>
                                </div>
                                <div className="h-8 overflow-hidden rounded-md bg-muted">
                                    <div
                                        className="h-full rounded-md bg-primary transition-all duration-500"
                                        style={{
                                            width: `${maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
