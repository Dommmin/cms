import { Head, router } from '@inertiajs/react';
import { DownloadIcon } from 'lucide-react';
import { useState } from 'react';
import * as OrderController from '@/actions/App/Http/Controllers/Admin/Ecommerce/OrderController';
import { useOrderColumns } from '@/components/columns/order-columns';

import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
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
import { bulkUpdateStatus } from '@/routes/admin/ecommerce/orders';
import type { BreadcrumbItem } from '@/types';
import type { OrderData } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: OrderController.index.url() },
];

const BULK_STATUS_OPTIONS = [
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersIndex({
    orders,
    filters,
}: {
    orders: OrderData;
    filters: { search?: string };
}) {
    const __ = useTranslation();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkStatus, setBulkStatus] = useState<string>('');

    const allIds = orders.data.map((o) => o.id);
    const allSelected =
        allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

    function toggleAll() {
        setSelectedIds(allSelected ? [] : allIds);
    }

    function toggleOne(id: number) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    }

    function handleBulkSubmit() {
        if (selectedIds.length === 0 || !bulkStatus) return;
        router.post(
            bulkUpdateStatus.url(),
            { ids: selectedIds, status: bulkStatus },
            {
                onSuccess: () => {
                    setSelectedIds([]);
                    setBulkStatus('');
                },
            },
        );
    }

    const orderColumns = useOrderColumns({
        selectedIds,
        onToggleAll: toggleAll,
        onToggleOne: toggleOne,
        allSelected,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            <Wrapper>
                <PageHeader
                    title={__('page.orders', 'Orders')}
                    description={__(
                        'page.orders_desc',
                        'Manage customer orders',
                    )}
                >
                    <PageHeaderActions>
                        <Button variant="outline" asChild>
                            <a href={OrderRoutes.exportMethod.url()}>
                                <DownloadIcon className="mr-2 h-4 w-4" />
                                {__('action.export_csv', 'Export CSV')}
                            </a>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                {selectedIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/50 px-4 py-3">
                        <span className="text-sm font-medium">
                            {selectedIds.length}{' '}
                            {selectedIds.length === 1 ? 'order' : 'orders'}{' '}
                            selected
                        </span>
                        <div className="flex flex-1 items-center gap-2">
                            <Select
                                value={bulkStatus}
                                onValueChange={setBulkStatus}
                            >
                                <SelectTrigger className="h-8 w-[180px]">
                                    <SelectValue placeholder="Change status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {BULK_STATUS_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                size="sm"
                                disabled={!bulkStatus}
                                onClick={handleBulkSubmit}
                            >
                                Apply
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setSelectedIds([]);
                                    setBulkStatus('');
                                }}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                <DataTable
                    columns={orderColumns}
                    data={orders.data}
                    pagination={{
                        current_page: orders.current_page,
                        last_page: orders.last_page,
                        per_page: orders.per_page,
                        total: orders.total,
                        prev_page_url: orders.prev_page_url ?? null,
                        next_page_url: orders.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search_orders',
                        'Search orders...',
                    )}
                    searchValue={filters?.search ?? ''}
                    baseUrl={OrderController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
