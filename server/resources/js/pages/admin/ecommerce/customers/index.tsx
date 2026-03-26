import { Head } from '@inertiajs/react';
import { UserCircle, DownloadIcon } from 'lucide-react';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customers',
        href: '/admin/ecommerce/customers',
    },
];

export default function CustomersIndex({ customers, filters }: IndexProps) {
    const __ = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />

            <Wrapper>
                <PageHeader
                    title="Customers"
                    description={`${customers.total} registered customers`}
                >
                    <PageHeaderActions>
                        <Button variant="outline" asChild>
                            <a href="/admin/ecommerce/customers/export">
                                <DownloadIcon className="mr-2 h-4 w-4" />
                                {__('action.export_csv', 'Export CSV')}
                            </a>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: __('column.customer', 'Customer'),
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-100">
                                        <UserCircle className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            {row.original.first_name}{' '}
                                            {row.original.last_name}
                                        </span>
                                        {row.original.company_name && (
                                            <p className="text-xs text-muted-foreground">
                                                {row.original.company_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ),
                        },
                        {
                            accessorKey: 'email',
                            header: __('column.email', 'Email'),
                        },
                        {
                            accessorKey: 'orders_count',
                            header: __('column.orders', 'Orders'),
                        },
                        {
                            accessorKey: 'orders_sum_total',
                            header: __('column.total_spent', 'Total Spent'),
                            cell: ({ row }) => (
                                <span className="font-medium">
                                    $
                                    {(
                                        row.original.orders_sum_total / 100
                                    ).toFixed(2)}
                                </span>
                            ),
                        },
                    ]}
                    data={customers.data}
                    pagination={{
                        current_page: customers.current_page,
                        last_page: customers.last_page,
                        per_page: customers.per_page,
                        total: customers.total,
                        prev_page_url: customers.prev_page_url ?? null,
                        next_page_url: customers.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search customers...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/ecommerce/customers"
                />
            </Wrapper>
        </AppLayout>
    );
}
