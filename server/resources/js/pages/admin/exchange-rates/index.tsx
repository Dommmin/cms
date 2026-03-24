import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Currency, ExchangeRate, RatesData, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exchange Rates', href: '/admin/exchange-rates' },
];

export default function ExchangeRatesIndex({
    rates,
    currencies: _currencies,
    filters: _filters,
}: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<ExchangeRate>[] = [
        {
            accessorKey: 'currency',
            header: __('label.currency', 'Currency'),
            cell: ({ row }) => (
                <div className="font-mono font-medium">
                    {row.original.currency.code}
                </div>
            ),
        },
        {
            accessorKey: 'rate',
            header: __('column.rate', 'Rate'),
            cell: ({ row }) => (
                <span className="font-mono">
                    {row.original.rate.toFixed(6)}
                </span>
            ),
        },
        {
            accessorKey: 'source',
            header: __('column.source', 'Source'),
            cell: ({ row }) =>
                row.original.source ? (
                    <Badge variant="outline" className="text-xs">
                        {row.original.source}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">Manual</span>
                ),
        },
        {
            accessorKey: 'fetched_at',
            header: __('column.fetched_at', 'Fetched'),
            cell: ({ row }) => (
                <span className="text-sm">
                    {new Date(row.original.fetched_at).toLocaleString()}
                </span>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={`/admin/exchange-rates/${row.original.id}/edit`}
                            prefetch
                            cacheFor={30}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Rate')}
                        description={`Are you sure you want to delete this exchange rate?`}
                        onConfirm={() => {
                            router.delete(
                                `/admin/exchange-rates/${row.original.id}`,
                                {
                                    onSuccess: () =>
                                        toast.success('Exchange rate deleted'),
                                },
                            );
                        }}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exchange Rates" />
            <Wrapper>
                <PageHeader
                    title={__('page.exchange_rates', 'Exchange Rates')}
                    description={__(
                        'page.exchange_rates_desc',
                        'Manage currency exchange rates',
                    )}
                >
                    <PageHeaderActions>
                        <Link href="/admin/exchange-rates/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add', 'Add Rate')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={rates.data}
                    pagination={{
                        current_page: rates.current_page,
                        last_page: rates.last_page,
                        per_page: rates.per_page,
                        total: rates.total,
                        prev_page_url: rates.prev_page_url ?? null,
                        next_page_url: rates.next_page_url ?? null,
                    }}
                    baseUrl="/admin/exchange-rates"
                />
            </Wrapper>
        </AppLayout>
    );
}
