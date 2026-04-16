import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { InventoryItem, InventoryProps } from './inventory.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Analytics', href: '' },
    { title: 'Inventory', href: '' },
];

function formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('pl-PL', {
        style: 'currency',
        currency: 'PLN',
    });
}

function StatusBadge({ status }: { status: InventoryItem['status'] }) {
    if (status === 'out_of_stock') {
        return <Badge variant="destructive">Out of stock</Badge>;
    }
    if (status === 'low_stock') {
        return (
            <Badge
                variant="outline"
                className="border-yellow-400 text-yellow-600 dark:text-yellow-400"
            >
                Low stock
            </Badge>
        );
    }
    return (
        <Badge
            variant="outline"
            className="border-green-400 text-green-600 dark:text-green-400"
        >
            In stock
        </Badge>
    );
}

export default function InventoryReport({ data }: InventoryProps) {
    const { summary, top_by_value, out_of_stock_items } = data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Report" />
            <Wrapper>
                <PageHeader
                    title="Inventory Report"
                    description="Live stock levels, values, and out-of-stock items."
                />

                {/* Summary cards */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Total Variants
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {summary.total_variants.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Out of Stock
                        </p>
                        <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                            {summary.out_of_stock.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Low Stock
                        </p>
                        <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {summary.low_stock.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            In Stock
                        </p>
                        <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                            {summary.in_stock.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Total Stock Value
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {formatPrice(summary.total_stock_value)}
                        </p>
                    </div>
                </div>

                {/* Out of stock items */}
                {out_of_stock_items.length > 0 && (
                    <div className="mb-6 rounded-xl border">
                        <div className="border-b px-4 py-3">
                            <h2 className="text-base font-semibold">
                                Out of Stock Items
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                First {out_of_stock_items.length} items with
                                zero stock
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            SKU
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {out_of_stock_items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs">
                                                {item.sku}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatPrice(item.price)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge
                                                    status={item.status}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Top by stock value */}
                {top_by_value.length > 0 && (
                    <div className="rounded-xl border">
                        <div className="border-b px-4 py-3">
                            <h2 className="text-base font-semibold">
                                Top by Stock Value
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Top 20 variants by (qty × price)
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            SKU
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                            Qty
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                            Unit Price
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                            Stock Value
                                        </th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {top_by_value.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs">
                                                {item.sku}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {item.stock_quantity.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatPrice(item.price)}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums font-medium">
                                                {formatPrice(
                                                    item.stock_value ?? 0,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge
                                                    status={item.status}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Wrapper>
        </AppLayout>
    );
}
