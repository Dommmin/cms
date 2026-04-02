import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, PlusIcon, StarIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import * as CurrencyController from '@/actions/App/Http/Controllers/Admin/CurrencyController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Currency, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Currencies', href: CurrencyController.index.url() },
];

export default function CurrenciesIndex({ currencies, filters }: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<Currency>[] = [
        {
            accessorKey: 'code',
            header: __('label.code', 'Code'),
            cell: ({ row }) => (
                <div className="font-mono font-medium">{row.original.code}</div>
            ),
        },
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => <div>{row.original.name}</div>,
        },
        {
            accessorKey: 'symbol',
            header: __('label.symbol', 'Symbol'),
            cell: ({ row }) => (
                <span className="font-mono">{row.original.symbol}</span>
            ),
        },
        {
            accessorKey: 'decimal_places',
            header: __('column.decimals', 'Decimals'),
            cell: ({ row }) => <span>{row.original.decimal_places}</span>,
        },
        {
            accessorKey: 'exchange_rates',
            header: __('column.rate', 'Rate'),
            cell: ({ row }) => {
                const rate = row.original.exchange_rates?.[0];
                if (row.original.is_base) {
                    return (
                        <Badge variant="outline">
                            <StarIcon className="mr-1 h-3 w-3" />
                            {__('misc.default', 'Base')}
                        </Badge>
                    );
                }
                return rate ? (
                    <span className="text-sm">
                        {rate.rate.toFixed(4)} (
                        {new Date(rate.fetched_at).toLocaleDateString()})
                    </span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active
                        ? __('status.active', 'Active')
                        : __('status.inactive', 'Inactive')}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={CurrencyController.edit.url(row.original.id)}
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
                        title={__('dialog.delete_title', 'Delete Currency')}
                        description={`Are you sure you want to delete "${row.original.code}"?`}
                        onConfirm={() => {
                            router.delete(
                                CurrencyController.destroy.url(row.original.id),
                                {
                                    onSuccess: () =>
                                        toast.success('Currency deleted'),
                                },
                            );
                        }}
                        disabled={row.original.is_base}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Currencies" />
            <Wrapper>
                <PageHeader
                    title={__('page.currencies', 'Currencies')}
                    description={__(
                        'page.currencies_desc',
                        'Manage currencies and exchange rates',
                    )}
                >
                    <PageHeaderActions>
                        <Link href={CurrencyController.create.url()}>
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add', 'Add Currency')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={currencies.data}
                    pagination={{
                        current_page: currencies.current_page,
                        last_page: currencies.last_page,
                        per_page: currencies.per_page,
                        total: currencies.total,
                        prev_page_url: currencies.prev_page_url ?? null,
                        next_page_url: currencies.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search currencies...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={CurrencyController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
