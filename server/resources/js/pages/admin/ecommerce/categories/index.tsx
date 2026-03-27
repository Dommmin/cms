import { Head, Link } from '@inertiajs/react';
import * as CategoryController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CategoryController';
import { PlusIcon } from 'lucide-react';
import { useCategoryColumns } from '@/components/columns/category-columns';

import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { CategoryData } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: CategoryController.index.url() },
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
                    description={__(
                        'page.categories_desc',
                        'Manage product categories',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={CategoryController.create.url()}
                                prefetch
                                cacheFor={30}
                            >
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
                    searchPlaceholder={__(
                        'placeholder.search_categories',
                        'Search categories...',
                    )}
                    searchValue={filters?.search ?? ''}
                    baseUrl={CategoryController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
