import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useState } from 'react';
import * as AnalyticsController from '@/actions/App/Http/Controllers/Admin/AnalyticsController';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { VatProps } from './vat.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Analytics', href: '' },
    { title: 'VAT Report', href: '' },
];

function formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('pl-PL', {
        style: 'currency',
        currency: 'PLN',
    });
}

export default function VatReport({ data, filters }: VatProps) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    function applyFilters() {
        router.get(
            AnalyticsController.vat.url(),
            { from, to },
            { preserveState: true, replace: true },
        );
    }

    const jpkMonth = from.substring(0, 7); // YYYY-MM

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="VAT Report" />
            <Wrapper>
                <PageHeader
                    title="VAT Report"
                    description="Tax collected on completed orders by period."
                >
                    <PageHeaderActions>
                        <a
                            href={`${AnalyticsController.jpkExport.url()}?month=${jpkMonth}-01`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent"
                        >
                            <Download className="h-4 w-4" />
                            JPK_V7M ({jpkMonth})
                        </a>
                    </PageHeaderActions>
                </PageHeader>

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
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Orders
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {data.orders_count.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Net Total
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {formatPrice(data.net_total)}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            VAT Total
                        </p>
                        <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {formatPrice(data.vat_total)}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Gross Total
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {formatPrice(data.gross_total)}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Effective VAT Rate
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {data.effective_vat_rate}%
                        </p>
                    </div>
                </div>

                {/* Monthly breakdown */}
                {data.by_month.length === 0 ? (
                    <div className="rounded-xl border bg-muted/30 p-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            No completed orders in the selected period.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <div className="border-b px-4 py-3">
                            <h2 className="text-base font-semibold">
                                Monthly Breakdown
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            Month
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                            Orders
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                            Net
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                            VAT
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                            Gross
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.by_month.map((row) => (
                                        <tr
                                            key={row.month}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 font-medium tabular-nums">
                                                {row.month}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {row.count.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatPrice(row.net)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-amber-600 tabular-nums dark:text-amber-400">
                                                {formatPrice(row.vat)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium tabular-nums">
                                                {formatPrice(row.gross)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t bg-muted/50 font-semibold">
                                        <td className="px-4 py-3">Total</td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {data.orders_count.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {formatPrice(data.net_total)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-amber-600 tabular-nums dark:text-amber-400">
                                            {formatPrice(data.vat_total)}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {formatPrice(data.gross_total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}
            </Wrapper>
        </AppLayout>
    );
}
