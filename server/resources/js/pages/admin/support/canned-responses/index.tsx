import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
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
import type { CannedResponse, CannedResponsesData, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Support', href: '/admin/support' },
    { title: 'Canned Responses', href: '/admin/support/canned-responses' },
];

export default function CannedResponsesIndex({ canned_responses }: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<CannedResponse>[] = [
        {
            accessorKey: 'title',
            header: __('column.title', 'Title'),
            cell: ({ row }) => (
                <span className="font-medium">{row.original.title}</span>
            ),
        },
        {
            accessorKey: 'shortcut',
            header: __('column.shortcut', 'Shortcut'),
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono text-xs">
                    #{row.original.shortcut}
                </Badge>
            ),
        },
        {
            accessorKey: 'body',
            header: __('column.preview', 'Preview'),
            cell: ({ row }) => (
                <span className="line-clamp-1 max-w-xs text-sm text-muted-foreground">
                    {row.original.body}
                </span>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={`/admin/support/canned-responses/${row.original.id}/edit`}
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
                        title={__('dialog.delete_title', 'Delete Response')}
                        description={__(
                            'dialog.cannot_be_undone',
                            'Are you sure you want to delete this canned response?',
                        )}
                        onConfirm={() => {
                            router.delete(
                                `/admin/support/canned-responses/${row.original.id}`,
                                {
                                    onSuccess: () =>
                                        toast.success(
                                            'Canned response deleted',
                                        ),
                                },
                            );
                        }}
                    >
                        <TrashIcon className="h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Canned Responses" />
            <Wrapper>
                <PageHeader
                    title={__('page.canned_responses', 'Canned Responses')}
                    description={__(
                        'page.canned_responses_desc',
                        'Predefined replies for common questions',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild>
                            <Link
                                href="/admin/support/canned-responses/create"
                                prefetch
                                cacheFor={30}
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'New Response')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={canned_responses.data}
                    pagination={{
                        current_page: canned_responses.current_page,
                        last_page: canned_responses.last_page,
                        per_page: canned_responses.per_page,
                        total: canned_responses.total,
                        prev_page_url: canned_responses.prev_page_url ?? null,
                        next_page_url: canned_responses.next_page_url ?? null,
                    }}
                    baseUrl="/admin/support/canned-responses"
                />
            </Wrapper>
        </AppLayout>
    );
}
