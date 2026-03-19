import { Head, Link, router } from '@inertiajs/react';
import { Folder, PlusIcon } from 'lucide-react';
import {
    useCategoryColumns,
    type CategoryRow,
} from '@/components/columns/category-columns';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/hooks/use-translation';
import type { BreadcrumbItem } from '@/types';

type CategoryData = {
    data: CategoryRow[];
    prev_page_url?: string;
    next_page_url?: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: '/admin/ecommerce/categories' },
];

export default function CategoriesIndex({
    categories,
    filters,
}: {
    categories: CategoryData;
    filters: { search?: string };
}) {
    const __ = useTranslation();
    const categoryColumns = useCategoryColumns();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <Wrapper>
                <PageHeader
                    title={__('page.categories', 'Categories')}
                    description={__('page.categories_desc', 'Manage product categories')}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/ecommerce/categories/create" prefetch cacheFor={30}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add', 'Add Category')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={categoryColumns}
                    data={categories.data}
                    pagination={{
                        current_page: categories.current_page,
                        last_page: categories.last_page,
                        per_page: categories.per_page,
                        total: categories.total,
                        prev_page_url: categories.prev_page_url ?? null,
                        next_page_url: categories.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__('placeholder.search_categories', 'Search categories...')}
                    searchValue={filters?.search ?? ''}
                    baseUrl="/admin/ecommerce/categories"
                />
            </Wrapper>
        </AppLayout>
    );
}
