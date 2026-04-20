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
import type { CustomersProps } from './customers.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Analytics', href: '' },
    { title: 'Customers', href: '' },
];

function formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('pl-PL', {
        style: 'currency',
        currency: 'PLN',
    });
}

export default function CustomersReport({ data, filters }: CustomersProps) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    function applyFilters() {
        router.get(
            AnalyticsController.customers.url(),
            { from, to },
            { preserveState: true, replace: true },
        );
    }

    const chartEntries = Object.entries(data.chart);
    const maxChartValue = Math.max(...chartEntries.map(([, v]) => v), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Analytics" />
            <Wrapper>
                <PageHeader
                    title="Customer Analytics"
                    description="New vs returning customers and lifetime value overview."
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

                {/* Summary cards */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            New Customers
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {data.new_customers.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Registered in period
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Returning Customers
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {data.returning_customers.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Ordered before &amp; in period
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            New Buyers
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {data.new_buyers.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            First purchase in period
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Avg Lifetime Value
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {formatPrice(data.avg_lifetime_value)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            All-time average
                        </p>
                    </div>
                </div>

                {/* Daily chart */}
                {chartEntries.length > 0 && (
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-base font-semibold">
                            New Customers per Day
                        </h2>
                        <div className="overflow-x-auto">
                            <div className="flex min-w-max items-end gap-1">
                                {chartEntries.map(([date, count]) => (
                                    <div
                                        key={date}
                                        className="group flex flex-col items-center gap-1"
                                    >
                                        <span className="hidden text-xs text-muted-foreground tabular-nums group-hover:block">
                                            {count}
                                        </span>
                                        <div
                                            className="min-h-1 w-6 rounded-t bg-primary/70 transition-all group-hover:bg-primary"
                                            style={{
                                                height: `${Math.max(4, Math.round((count / maxChartValue) * 80))}px`,
                                            }}
                                            title={`${date}: ${count}`}
                                        />
                                        <span className="rotate-45 text-[9px] text-muted-foreground">
                                            {date.slice(5)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Wrapper>
        </AppLayout>
    );
}
