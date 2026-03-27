import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import * as BlogCategoryController from '@/actions/App/Http/Controllers/Admin/BlogCategoryController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';
import type { BlogCategory, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blog Categories', href: BlogCategoryController.index.url() },
];

export default function BlogCategoriesIndex({
    categories,
    filters,
}: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<BlogCategory>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">
                        {resolveLocalizedText(row.original.name)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.slug}
                    </p>
                    {row.original.parent && (
                        <Badge variant="outline" className="mt-1 text-xs">
                            {resolveLocalizedText(row.original.parent.name)}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'is_active',
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active
                        ? __('status.active', 'Active')
                        : __('status.inactive', 'Inactive')}
                </Badge>
            ),
        },
        {
            accessorKey: 'posts_count',
            header: __('column.submissions', 'Posts'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.posts_count}</span>
            ),
        },
        {
            accessorKey: 'position',
            header: __('column.position', 'Position'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.position}</span>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={BlogCategoryController.edit.url(
                                row.original.id,
                            )}
                            prefetch
                            cacheFor={30}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Category')}
                        description={`${__('dialog.are_you_sure', 'Are you sure?')} ${__('dialog.cannot_be_undone', 'This action cannot be undone.')}`}
                        onConfirm={() => {
                            router.delete(
                                BlogCategoryController.destroy.url(
                                    row.original.id,
                                ),
                                {
                                    onSuccess: () =>
                                        toast.success('Category deleted'),
                                },
                            );
                        }}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                        {__('action.delete', 'Delete')}
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Blog Categories" />
            <Wrapper>
                <PageHeader
                    title={__('page.blog_categories', 'Blog Categories')}
                    description={__(
                        'page.blog_categories_desc',
                        'Organize blog posts into categories',
                    )}
                >
                    <PageHeaderActions>
                        <Link href={BlogCategoryController.create.url()}>
                            <Button variant="outline">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'New Category')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
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
                    searchValue={filters.search ?? ''}
                    baseUrl={BlogCategoryController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
