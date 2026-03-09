import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    DollarSign,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    StarIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type ExchangeRate = {
    rate: number;
    fetched_at: string;
};

type Currency = {
    id: number;
    code: string;
    name: string;
    symbol: string;
    decimal_places: number;
    is_active: boolean;
    is_base: boolean;
    exchange_rates: ExchangeRate[];
};

type CurrenciesData = {
    data: Currency[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    currencies: CurrenciesData;
    filters: { search?: string; is_active?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Currencies', href: '/admin/currencies' },
];

export default function CurrenciesIndex({ currencies, filters }: Props) {
    const columns: ColumnDef<Currency>[] = [
        {
            accessorKey: 'code',
            header: 'Code',
            cell: ({ row }) => (
                <div className="font-mono font-medium">{row.original.code}</div>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => <div>{row.original.name}</div>,
        },
        {
            accessorKey: 'symbol',
            header: 'Symbol',
            cell: ({ row }) => (
                <span className="font-mono">{row.original.symbol}</span>
            ),
        },
        {
            accessorKey: 'decimal_places',
            header: 'Decimals',
            cell: ({ row }) => <span>{row.original.decimal_places}</span>,
        },
        {
            accessorKey: 'exchange_rates',
            header: 'Rate',
            cell: ({ row }) => {
                const rate = row.original.exchange_rates?.[0];
                if (row.original.is_base) {
                    return (
                        <Badge variant="outline">
                            <StarIcon className="mr-1 h-3 w-3" />
                            Base
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
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Link href={`/admin/currencies/${row.original.id}/edit`}>
                        <Button variant="outline" size="sm">
                            <PencilIcon className="mr-1 h-3 w-3" />
                            Edit
                        </Button>
                    </Link>
                    <ConfirmButton
                        variant="destructive"
                        size="sm"
                        title="Delete Currency"
                        description={`Are you sure you want to delete "${row.original.code}"?`}
                        onConfirm={() => {
                            router.delete(
                                `/admin/currencies/${row.original.id}`,
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
                    title="Currencies"
                    description="Manage currencies and exchange rates"
                >
                    <PageHeaderActions>
                        <Link href="/admin/currencies/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Currency
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
                    searchPlaceholder="Search currencies..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/currencies"
                />
            </Wrapper>
        </AppLayout>
    );
}
