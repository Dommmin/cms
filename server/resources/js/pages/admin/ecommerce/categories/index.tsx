import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import * as CategoryController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CategoryController';
import { useCategoryColumns } from '@/components/columns/category-columns';
import DataTable from '@/components/data-table';
import ListFilters from '@/components/list-filters';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
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
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';
import type { CategoryData, CategoryFilters } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categories', href: CategoryController.index.url() },
];

export default function CategoriesIndex({
    categories,
    filters,
}: {
    categories: CategoryData;
    filters: CategoryFilters;
}) {
    const __ = useTranslation();
    const categoryColumns = useCategoryColumns();
    const activeFilterCount = [filters.is_active].filter(Boolean).length;

    const updateFilters = (
        nextFilters: Partial<Pick<CategoryFilters, 'is_active'>>,
    ) => {
        router.get(
            CategoryController.index.url(),
            { ...filters, ...nextFilters },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

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
                    <PageHeaderActions compact>
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

                <ListFilters
                    activeCount={activeFilterCount}
                    description={__(
                        'page.categories_filters_desc',
                        'Filter categories by active status.',
                    )}
                    contentClassName="sm:max-w-xs"
                >
                    <div className="space-y-2">
                        <Label htmlFor="category-status-filter">
                            {__('column.status', 'Status')}
                        </Label>
                        <Select
                            value={filters.is_active || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    is_active: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="category-status-filter"
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
                                <SelectItem value="1">
                                    {__('status.active', 'Active')}
                                </SelectItem>
                                <SelectItem value="0">
                                    {__('status.inactive', 'Inactive')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </ListFilters>

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
                    mobilePrimaryColumns={4}
                    mobileCardTitle={(row) => resolveLocalizedText(row.name)}
                />
            </Wrapper>
        </AppLayout>
    );
}
