import { Link, Head } from '@inertiajs/react';
import * as ProductController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductController';
import { PlusIcon, DownloadIcon } from 'lucide-react';
import { useProductColumns } from '@/components/columns/product-columns';

import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ProductData } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: ProductController.index.url() },
];

export default function ProductsIndex({
    products,
    filters,
}: {
    products: ProductData;
    filters: { search?: string };
}) {
    const __ = useTranslation();
    const productColumns = useProductColumns();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <Wrapper>
                <PageHeader
                    title={__('page.products', 'Products')}
                    description={__(
                        'page.products_desc',
                        'Manage products catalog',
                    )}
                >
                    <PageHeaderActions>
                        <Button variant="outline" asChild>
                            <a href={ProductController.exportMethod.url()}>
                                <DownloadIcon className="mr-2 h-4 w-4" />
                                {__('action.export_csv', 'Export CSV')}
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <Link
                                href={ProductController.create.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add', 'Add Product')}
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
                    searchPlaceholder={__(
                        'placeholder.search_products',
                        'Search products...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={ProductController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
