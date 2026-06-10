import { Head, Link, router } from '@inertiajs/react';
import { DownloadIcon, PlusIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';
import * as ProductController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductController';
import { useProductColumns } from '@/components/columns/product-columns';

import DataTable from '@/components/data-table';
import ListFilters from '@/components/list-filters';
import {
    PageHeader,
    PageHeaderActions,
    PageHeaderOverflowMenu,
} from '@/components/page-header';
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
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';
import ImportDialog from './ImportDialog';
import type { ProductData } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: ProductController.index.url() },
];

export default function ProductsIndex({
    products,
    filters,
}: {
    products: ProductData;
    filters: { search?: string; is_featured?: string };
}) {
    const __ = useTranslation();
    const productColumns = useProductColumns();
    const [importOpen, setImportOpen] = useState(false);
    const activeFilterCount = filters.is_featured ? 1 : 0;

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
                    <PageHeaderActions compact>
                        <div className="flex w-full items-center gap-2 sm:hidden">
                            <Button asChild className="flex-1">
                                <Link
                                    href={ProductController.create.url()}
                                    prefetch
                                    cacheFor={30}
                                >
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    {__('action.add', 'Add Product')}
                                </Link>
                            </Button>
                            <PageHeaderOverflowMenu label="More">
                                <Button variant="outline" asChild>
                                    <a
                                        href={ProductController.exportMethod.url()}
                                    >
                                        <DownloadIcon className="mr-2 h-4 w-4" />
                                        {__('action.export_csv', 'Export CSV')}
                                    </a>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setImportOpen(true)}
                                >
                                    <UploadIcon className="mr-2 h-4 w-4" />
                                    {__('action.import', 'Import')}
                                </Button>
                            </PageHeaderOverflowMenu>
                        </div>

                        <div className="hidden items-center gap-2 sm:flex sm:flex-wrap sm:justify-end">
                            <Button variant="outline" asChild>
                                <a href={ProductController.exportMethod.url()}>
                                    <DownloadIcon className="mr-2 h-4 w-4" />
                                    {__('action.export_csv', 'Export CSV')}
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setImportOpen(true)}
                            >
                                <UploadIcon className="mr-2 h-4 w-4" />
                                {__('action.import', 'Import')}
                            </Button>
                            <Button asChild>
                                <Link
                                    href={ProductController.create.url()}
                                    prefetch
                                    cacheFor={30}
                                >
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    {__('action.add', 'Add Product')}
                                </Link>
                            </Button>
                        </div>
                    </PageHeaderActions>
                </PageHeader>

                <ListFilters
                    activeCount={activeFilterCount}
                    description="Filter product visibility and listing state."
                    contentClassName="sm:justify-start"
                >
                    <Select
                        value={filters.is_featured ?? 'all'}
                        onValueChange={(value) => {
                            const params = Object.fromEntries(
                                new URLSearchParams(
                                    window.location.search,
                                ).entries(),
                            );
                            router.get(
                                ProductController.index.url(),
                                {
                                    ...params,
                                    is_featured:
                                        value === 'all' ? undefined : value,
                                    page: 1,
                                },
                                { replace: true, preserveState: true },
                            );
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Featured..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All products</SelectItem>
                            <SelectItem value="1">Featured only</SelectItem>
                            <SelectItem value="0">Not featured</SelectItem>
                        </SelectContent>
                    </Select>
                </ListFilters>

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
                    mobilePrimaryColumns={5}
                    mobileCardTitle={(row) => {
                        const product = row as ProductData['data'][number];

                        return (
                            <div className="min-w-0">
                                <div className="font-medium">
                                    {resolveLocalizedText(product.name)}
                                </div>
                            </div>
                        );
                    }}
                />
            </Wrapper>

            <ImportDialog
                open={importOpen}
                onClose={() => setImportOpen(false)}
            />
        </AppLayout>
    );
}
