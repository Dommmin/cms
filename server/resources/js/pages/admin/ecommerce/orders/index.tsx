import { Head, router } from '@inertiajs/react';
import { ShoppingCart, EyeIcon, DownloadIcon } from 'lucide-react';
import {
    useOrderColumns,
    type OrderRow,
} from '@/components/columns/order-columns';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/hooks/use-translation';
import type { BreadcrumbItem } from '@/types';

type OrderData = {
    data: OrderRow[];
    prev_page_url?: string;
    next_page_url?: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/admin/ecommerce/orders' },
];

export default function OrdersIndex({
    orders,
    filters,
}: {
    orders: OrderData;
    filters: { search?: string };
}) {
    const __ = useTranslation();
    const orderColumns = useOrderColumns();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            <Wrapper>
                <PageHeader
                    title={__('page.orders', 'Orders')}
                    description={__('page.orders_desc', 'Manage customer orders')}
                >
                    <PageHeaderActions>
                        <Button variant="outline" asChild>
                            <a href="/admin/ecommerce/orders/export">
                                <DownloadIcon className="mr-2 h-4 w-4" />
                                {__('action.export_csv', 'Export CSV')}
                            </a>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

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
                    searchPlaceholder={__('placeholder.search_orders', 'Search orders...')}
                    searchValue={filters?.search ?? ''}
                    baseUrl="/admin/ecommerce/orders"
                />
            </Wrapper>
        </AppLayout>
    );
}
