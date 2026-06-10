import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon } from 'lucide-react';
import * as ReturnRequestController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ReturnRequestController';
import DataTable from '@/components/data-table';
import ListFilters from '@/components/list-filters';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { EnumOption, IndexProps, ReturnRequest } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Returns & Complaints',
        href: ReturnRequestController.index.url(),
    },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    return_label_sent: 'bg-purple-100 text-purple-800',
    awaiting_return: 'bg-orange-100 text-orange-800',
    received: 'bg-indigo-100 text-indigo-800',
    inspected: 'bg-cyan-100 text-cyan-800',
    refunded: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-700',
};

const resolveLabel = (value: string, options: EnumOption[]): string =>
    options.find((option) => option.value === value)?.label ?? value;

export default function ReturnsIndex({
    returns,
    filters,
    statuses,
    returnTypes,
}: IndexProps) {
    const __ = useTranslation();
    const activeFilterCount = [filters.status, filters.return_type].filter(
        Boolean,
    ).length;

    const updateFilters = (
        nextFilters: Partial<
            Pick<IndexProps['filters'], 'status' | 'return_type'>
        >,
    ) => {
        router.get(
            ReturnRequestController.index.url(),
            { ...filters, ...nextFilters },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const columns: ColumnDef<ReturnRequest>[] = [
        {
            accessorKey: 'reference_number',
            header: __('column.id', 'Reference'),
            cell: ({ row }) => (
                <span className="font-mono font-medium">
                    {row.original.reference_number}
                </span>
            ),
        },
        {
            accessorKey: 'order',
            header: __('column.orders', 'Order'),
            cell: ({ row }) => (
                <span className="font-mono">
                    {row.original.order.reference_number}
                </span>
            ),
        },
        {
            id: 'customer',
            header: __('column.customer', 'Customer'),
            cell: ({ row }) => {
                const customer = row.original.order.customer;
                if (!customer)
                    return (
                        <span className="text-muted-foreground">
                            {__('misc.guest', 'Guest')}
                        </span>
                    );
                return (
                    <div>
                        <p className="font-medium">
                            {customer.first_name} {customer.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {customer.email}
                        </p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'return_type',
            header: __('column.type', 'Type'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {resolveLabel(row.original.return_type, returnTypes)}
                </Badge>
            ),
        },
        {
            accessorKey: 'status',
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    className={
                        statusColors[row.original.status] ||
                        'bg-gray-100 text-gray-800'
                    }
                >
                    {resolveLabel(row.original.status, statuses)}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: __('column.created_at', 'Requested'),
            cell: ({ row }) => (
                <span className="text-sm">
                    {new Date(row.original.created_at).toLocaleDateString()}
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
                            href={ReturnRequestController.show.url(
                                row.original.id,
                            )}
                            prefetch
                            cacheFor={60}
                        >
                            <EyeIcon className="mr-1 h-3 w-3" />
                            {__('action.show', 'View')}
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Returns & Complaints" />
            <Wrapper>
                <PageHeader
                    title={__(
                        'page.returns_complaints',
                        'Returns & Complaints',
                    )}
                    description={__(
                        'page.returns_desc',
                        'Manage return and complaint requests',
                    )}
                />

                <ListFilters
                    activeCount={activeFilterCount}
                    description={__(
                        'page.returns_filters_desc',
                        'Filter requests by lifecycle status and return type.',
                    )}
                    contentClassName="sm:grid sm:grid-cols-2 sm:items-end sm:gap-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="return-status-filter">
                            {__('column.status', 'Status')}
                        </Label>
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    status: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="return-status-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__('column.status', 'Status')}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                {statuses.map((status) => (
                                    <SelectItem
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="return-type-filter">
                            {__('column.type', 'Type')}
                        </Label>
                        <Select
                            value={filters.return_type || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    return_type: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="return-type-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__('column.type', 'Type')}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                {returnTypes.map((type) => (
                                    <SelectItem
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </ListFilters>

                <DataTable
                    columns={columns}
                    data={returns.data}
                    pagination={{
                        current_page: returns.current_page,
                        last_page: returns.last_page,
                        per_page: returns.per_page,
                        total: returns.total,
                        prev_page_url: returns.prev_page_url ?? null,
                        next_page_url: returns.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search returns & complaints...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={ReturnRequestController.index.url()}
                    mobilePrimaryColumns={4}
                    mobileCardTitle={(row) => row.reference_number}
                />
            </Wrapper>
        </AppLayout>
    );
}
