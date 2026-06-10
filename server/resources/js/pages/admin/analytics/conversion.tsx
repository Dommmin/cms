import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import * as AnalyticsController from '@/actions/App/Http/Controllers/Admin/AnalyticsController';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    const [activeTab, setActiveTab] = useState('funnel');

    function applyFilters() {
        router.get(
            AnalyticsController.conversion.url(),
            { from, to },
            { preserveState: true, replace: true },
        );
    }

    const maxCount = Math.max(...data.stages.map((s) => s.count), 1);

    const formatMoney = (cents: number) => {
        return (cents / 100).toLocaleString('pl-PL', {
            style: 'currency',
            currency: 'PLN',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conversion Funnel" />
            <Wrapper>
                <PageHeader
                    title="Storefront Analytics"
                    description="Track conversion funnels, landing page performance, and marketing attribution."
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

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList>
                        <TabsTrigger value="funnel">
                            Conversion Funnel
                        </TabsTrigger>
                        <TabsTrigger value="landing">Landing Pages</TabsTrigger>
                        <TabsTrigger value="promo">
                            Promo Attribution
                        </TabsTrigger>
                    </TabsList>

                    {/* Funnel Stage Content */}
                    <TabsContent value="funnel" className="space-y-6">
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
                                                    {stage.count.toLocaleString()}{' '}
                                                    sessions
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
                    </TabsContent>

                    {/* Landing Pages Content */}
                    <TabsContent value="landing" className="space-y-6">
                        <div className="rounded-xl border bg-card">
                            <div className="border-b px-6 py-4">
                                <h2 className="text-base font-semibold">
                                    Landing Pages with Conversions
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Analyze which landing pages generate
                                    sessions, checkouts, and sales.
                                </p>
                            </div>
                            {!data.landing_pages ||
                            data.landing_pages.length === 0 ? (
                                <div className="p-10 text-center text-sm text-muted-foreground">
                                    No landing page event data recorded.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50 text-left font-medium text-muted-foreground">
                                                <th className="px-6 py-3">
                                                    Path
                                                </th>
                                                <th className="px-6 py-3 text-right">
                                                    Sessions
                                                </th>
                                                <th className="px-6 py-3 text-right">
                                                    Conversions
                                                </th>
                                                <th className="px-6 py-3 text-right">
                                                    CR
                                                </th>
                                                <th className="px-6 py-3 text-right">
                                                    Revenue
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.landing_pages.map((row) => {
                                                const cr =
                                                    row.sessions > 0
                                                        ? round(
                                                              (row.conversions /
                                                                  row.sessions) *
                                                                  100,
                                                              1,
                                                          )
                                                        : 0;
                                                return (
                                                    <tr
                                                        key={row.url}
                                                        className="border-b last:border-0 hover:bg-muted/30"
                                                    >
                                                        <td className="px-6 py-3 font-mono text-xs">
                                                            {row.url}
                                                        </td>
                                                        <td className="px-6 py-3 text-right tabular-nums">
                                                            {row.sessions}
                                                        </td>
                                                        <td className="px-6 py-3 text-right tabular-nums">
                                                            {row.conversions}
                                                        </td>
                                                        <td className="px-6 py-3 text-right tabular-nums">
                                                            {cr}%
                                                        </td>
                                                        <td className="px-6 py-3 text-right font-medium text-green-600 tabular-nums dark:text-green-400">
                                                            {formatMoney(
                                                                row.revenue,
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Promo Attribution Content */}
                    <TabsContent value="promo" className="space-y-6">
                        <div className="rounded-xl border bg-card">
                            <div className="border-b px-6 py-4">
                                <h2 className="text-base font-semibold">
                                    Promotion Code Attribution
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Track conversion metrics and revenue
                                    generated by promotional coupon codes.
                                </p>
                            </div>
                            {!data.promotions ||
                            data.promotions.length === 0 ? (
                                <div className="p-10 text-center text-sm text-muted-foreground">
                                    No promotional sales recorded in this
                                    period.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50 text-left font-medium text-muted-foreground">
                                                <th className="px-6 py-3">
                                                    Promo Code
                                                </th>
                                                <th className="px-6 py-3 text-right">
                                                    Orders
                                                </th>
                                                <th className="px-6 py-3 text-right">
                                                    Attributed Revenue
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.promotions.map((row) => (
                                                <tr
                                                    key={row.code}
                                                    className="border-b last:border-0 hover:bg-muted/30"
                                                >
                                                    <td className="px-6 py-3">
                                                        <span className="rounded bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                                            {row.code}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-right font-medium tabular-nums">
                                                        {row.purchases}
                                                    </td>
                                                    <td className="px-6 py-3 text-right font-semibold text-green-600 tabular-nums dark:text-green-400">
                                                        {formatMoney(
                                                            row.revenue,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </Wrapper>
        </AppLayout>
    );
}

function round(value: number, decimals: number): number {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}
