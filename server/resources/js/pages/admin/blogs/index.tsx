import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import * as BlogController from '@/actions/App/Http/Controllers/Admin/BlogController';
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
import type { Blog, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Blogs', href: BlogController.index.url() },
];

export default function BlogsIndex({ blogs, filters }: IndexProps) {
    const __ = useTranslation();

    const columns: ColumnDef<Blog>[] = [
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
                </div>
            ),
        },
        {
            accessorKey: 'layout',
            header: __('column.layout', 'Layout'),
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.layout}</Badge>
            ),
        },
        {
            accessorKey: 'posts_count',
            header: __('column.posts', 'Posts'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.posts_count}</span>
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
                            href={BlogController.edit.url(row.original.id)}
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
                        title={__('dialog.delete_title', 'Delete Blog')}
                        description={`${__('dialog.are_you_sure', 'Are you sure?')} ${__('dialog.cannot_be_undone', 'This action cannot be undone.')}`}
                        onConfirm={() => {
                            router.delete(
                                BlogController.destroy.url(row.original.id),
                                {
                                    onSuccess: () =>
                                        toast.success('Blog deleted'),
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
            <Head title="Blogs" />
            <Wrapper>
                <PageHeader
                    title={__('page.blogs', 'Blogs')}
                    description={__(
                        'page.blogs_desc',
                        'Manage blog containers for your posts',
                    )}
                >
                    <PageHeaderActions>
                        <Link href={BlogController.create.url()}>
                            <Button variant="outline">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'New Blog')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={blogs.data}
                    pagination={{
                        current_page: blogs.current_page,
                        last_page: blogs.last_page,
                        per_page: blogs.per_page,
                        total: blogs.total,
                        prev_page_url: blogs.prev_page_url ?? null,
                        next_page_url: blogs.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search_blogs',
                        'Search blogs...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={BlogController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
