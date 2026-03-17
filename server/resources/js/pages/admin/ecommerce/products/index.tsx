import { Link, Head, router } from '@inertiajs/react';
import { Package, PlusIcon, DownloadIcon } from 'lucide-react';
import {
    productColumns,
    type ProductRow,
} from '@/components/columns/product-columns';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type ProductData = {
    data: ProductRow[];
    prev_page_url?: string;
    next_page_url?: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/admin/ecommerce/products' },
];

export default function ProductsIndex({
    products,
    filters,
}: {
    products: ProductData;
    filters: { search?: string };
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <Wrapper>
                <PageHeader
                    title="Products"
                    description="Manage products catalog"
                >
                    <PageHeaderActions>
                        <Button variant="outline" asChild>
                            <a href="/admin/ecommerce/products/export">
                                <DownloadIcon className="mr-2 h-4 w-4" />
                                Export CSV
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                <Link href='/admin/ecommerce/products/create' prefetch cacheFor={30}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Product
                        
                </Link>
            </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={productColumns}
                    data={products.data}
                    pagination={{
                        current_page: products.current_page,
                        last_page: products.last_page,
                        per_page: products.per_page,
                        total: products.total,
                        prev_page_url: products.prev_page_url ?? null,
                        next_page_url: products.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search products..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/ecommerce/products"
                />
            </Wrapper>
        </AppLayout>
    );
}
