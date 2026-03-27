import { Head } from '@inertiajs/react';
import { DownloadIcon } from 'lucide-react';
import * as OrderController from '@/actions/App/Http/Controllers/Admin/Ecommerce/OrderController';
import { useOrderColumns } from '@/components/columns/order-columns';

import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import * as OrderRoutes from '@/routes/admin/ecommerce/orders';
import type { BreadcrumbItem } from '@/types';
import type { OrderData } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: OrderController.index.url() },
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
