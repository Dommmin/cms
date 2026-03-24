import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Faq, FaqsData, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'FAQ', href: '/admin/faqs' }];

export default function FaqsIndex({
    faqs,
    filters,
    categories: _categories,
}: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<Faq>[] = [
        {
            accessorKey: 'question',
            header: __('column.question', 'Question'),
            cell: ({ row }) => (
                <div className="max-w-md">
                    <p className="line-clamp-2 font-medium">
                        {row.original.question}
                    </p>
                    {row.original.category && (
                        <Badge variant="outline" className="mt-1 text-xs">
                            {row.original.category}
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
            accessorKey: 'position',
            header: __('column.position', 'Position'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.position}</span>
            ),
        },
        {
            accessorKey: 'views_count',
            header: __('column.views', 'Views'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.views_count}</span>
            ),
        },
        {
            accessorKey: 'helpful_count',
            header: __('column.helpful', 'Helpful'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.helpful_count}</span>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={`/admin/faqs/${row.original.id}/edit`}
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
                        title={__('dialog.delete_title', 'Delete FAQ')}
                        description={__(
                            'dialog.cannot_be_undone',
                            'Are you sure you want to delete this FAQ? This action cannot be undone.',
                        )}
                        onConfirm={() => {
                            router.delete(`/admin/faqs/${row.original.id}`, {
                                onSuccess: () => toast.success('FAQ deleted'),
                            });
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
            <Head title="FAQ" />
            <Wrapper>
                <PageHeader
                    title={__('page.faqs', 'FAQ')}
                    description={__(
                        'page.faqs_desc',
                        'Manage frequently asked questions',
                    )}
                >
                    <PageHeaderActions>
                        <Link href="/admin/faqs/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.add', 'Add FAQ')}
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={faqs.data}
                    pagination={{
                        current_page: faqs.current_page,
                        last_page: faqs.last_page,
                        per_page: faqs.per_page,
                        total: faqs.total,
                        prev_page_url: faqs.prev_page_url ?? null,
                        next_page_url: faqs.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search questions...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/faqs"
                />
            </Wrapper>
        </AppLayout>
    );
}
