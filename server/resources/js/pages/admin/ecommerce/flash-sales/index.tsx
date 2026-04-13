import { Head, Link, router } from '@inertiajs/react';
import { Flame, Plus, Trash2 } from 'lucide-react';
import * as FlashSaleController from '@/actions/App/Http/Controllers/Admin/Ecommerce/FlashSaleController';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FlashSaleStatus, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Flash Sales', href: FlashSaleController.index.url() },
];

function StatusBadge({ status }: { status: FlashSaleStatus }) {
    const config: Record<FlashSaleStatus, { label: string; className: string }> = {
        active: { label: 'Active', className: 'bg-green-100 text-green-700' },
        scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
        ended: { label: 'Ended', className: 'bg-gray-100 text-gray-600' },
        exhausted: { label: 'Exhausted', className: 'bg-yellow-100 text-yellow-700' },
        inactive: { label: 'Inactive', className: 'bg-red-100 text-red-600' },
    };
    const { label, className } = config[status] ?? config.inactive;
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}

export default function FlashSalesIndex({ flashSales, filters }: IndexProps) {
    const __ = useTranslation();

    function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this flash sale?')) return;
        router.delete(FlashSaleController.destroy.url(id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Flash Sales" />

            <Wrapper>
                <PageHeader
                    title="Flash Sales"
                    description={`${flashSales.total} flash sale(s)`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={FlashSaleController.create.url()} prefetch cacheFor={30}>
                                <Plus className="mr-2 h-4 w-4" />
                                {__('action.add', 'Add Flash Sale')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: 'Name',
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-100">
                                        <Flame className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{row.original.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {row.original.product?.name ?? '—'}
                                            {row.original.variant ? ` / ${row.original.variant.sku}` : ''}
                                        </p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            accessorKey: 'sale_price',
                            header: 'Sale Price',
                            cell: ({ row }) => (
                                <span className="font-mono">
                                    {(row.original.sale_price / 100).toFixed(2)} PLN
                                </span>
                            ),
                        },
                        {
                            accessorKey: 'starts_at',
                            header: 'Start',
                            cell: ({ row }) => new Date(row.original.starts_at).toLocaleString('pl-PL'),
                        },
                        {
                            accessorKey: 'ends_at',
                            header: 'End',
                            cell: ({ row }) => new Date(row.original.ends_at).toLocaleString('pl-PL'),
                        },
                        {
                            accessorKey: 'stock_sold',
                            header: 'Stock',
                            cell: ({ row }) =>
                                row.original.stock_limit !== null
                                    ? `${row.original.stock_sold} / ${row.original.stock_limit}`
                                    : 'Unlimited',
                        },
                        {
                            accessorKey: 'status',
                            header: 'Status',
                            cell: ({ row }) => <StatusBadge status={row.original.status} />,
                        },
                        {
                            id: 'actions',
                            header: '',
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={FlashSaleController.edit.url(row.original.id)}>
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(row.original.id)}
                                        aria-label={`Delete ${row.original.name}`}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    data={flashSales.data}
                    pagination={{
                        current_page: flashSales.current_page,
                        last_page: flashSales.last_page,
                        per_page: flashSales.per_page,
                        total: flashSales.total,
                        prev_page_url: flashSales.prev_page_url ?? null,
                        next_page_url: flashSales.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search flash sales..."
                    searchValue={filters.search ?? ''}
                    baseUrl={FlashSaleController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
