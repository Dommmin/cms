import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    ClipboardListIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/hooks/use-translation';
import type { BreadcrumbItem } from '@/types';
import type { FormsData } from '@/types/forms';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Forms', href: '/admin/forms' },
];

export default function Index({
    forms,
    filters,
}: {
    forms: FormsData;
    filters: { search?: string };
}) {
    const __ = useTranslation();
    const columns: ColumnDef<FormsData['data'][0]>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <ClipboardListIcon className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.slug}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'description',
            header: __('column.description', 'Description'),
            cell: ({ row }) => (
                <span className="line-clamp-1 text-sm text-muted-foreground">
                    {row.original.description || '-'}
                </span>
            ),
        },
        {
            accessorKey: 'submissions_count',
            header: __('column.submissions', 'Submissions'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {row.original.submissions_count}
                </Badge>
            ),
        },
        {
            accessorKey: 'is_active',
            header: __('column.status', 'Status'),
            cell: ({ row }) =>
                row.original.is_active ? (
                    <Badge variant="default" className="bg-green-600 text-xs">
                        {__('status.active', 'Active')}
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="text-xs">
                        {__('status.inactive', 'Inactive')}
                    </Badge>
                ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/forms/${row.original.id}/submissions`} prefetch cacheFor={30}>
                            <EyeIcon className="mr-1 h-3 w-3" />
                            Submissions
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/forms/${row.original.id}/edit`} prefetch cacheFor={30}>
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Form')}
                        description={`${__('dialog.are_you_sure', 'Are you sure?')} ${__('dialog.cannot_be_undone', 'This action cannot be undone.')}`}
                        onConfirm={() => {
                            router.delete(`/admin/forms/${row.original.id}`, {
                                onSuccess: () => toast.success('Form deleted'),
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
            <Head title="Forms" />

            <Wrapper>
                <PageHeader
                    title={__('page.forms', 'Forms')}
                    description={__('page.forms_desc', 'Manage contact forms and surveys')}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/forms/create" prefetch cacheFor={30}>
                                <ClipboardListIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'Create Form')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={forms.data}
                    pagination={{
                        current_page: forms.current_page,
                        last_page: forms.last_page,
                        per_page: forms.per_page,
                        total: forms.total,
                        prev_page_url: forms.prev_page_url ?? null,
                        next_page_url: forms.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search forms..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/forms"
                />
            </Wrapper>
        </AppLayout>
    );
}
