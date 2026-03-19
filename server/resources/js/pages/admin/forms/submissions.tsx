import { Link, Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/hooks/use-translation';
import type { BreadcrumbItem } from '@/types';

type Submission = {
    id: number;
    form_id: number;
    data: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
};

type SubmissionsData = {
    data: Submission[];
    prev_page_url: string | null;
    next_page_url: string | null;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type FormData = {
    id: number;
    name: string;
    slug: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Forms', href: '/admin/forms' },
    { title: 'Submissions', href: '#' },
];

export default function SubmissionsIndex({
    form,
    submissions,
}: {
    form: FormData;
    submissions: SubmissionsData;
}) {
    const __ = useTranslation();

    const columns: ColumnDef<Submission>[] = [
        {
            accessorKey: 'id',
            header: __('column.id', 'ID'),
            cell: ({ row }) => (
                <span className="font-mono">#{row.original.id}</span>
            ),
        },
        {
            accessorKey: 'data',
            header: __('column.data', 'Data'),
            cell: ({ row }) => {
                const data = row.original.data;
                const preview = Object.entries(data)
                    .slice(0, 2)
                    .map(([k, v]) => `${k}: ${String(v).slice(0, 30)}`)
                    .join(', ');
                return (
                    <span className="text-sm text-muted-foreground">
                        {preview || 'No data'}
                    </span>
                );
            },
        },
        {
            accessorKey: 'ip_address',
            header: __('column.ip', 'IP'),
            cell: ({ row }) => (
                <span className="font-mono text-xs text-muted-foreground">
                    {row.original.ip_address || '-'}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: __('column.date', 'Date'),
            cell: ({ row }) =>
                new Date(row.original.created_at).toLocaleString(),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/forms/${form.id}/submissions/${row.original.id}`} prefetch cacheFor={60}>
                            <EyeIcon className="mr-1 h-3 w-3" />
                            {__('action.view', 'View')}
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Submission')}
                        description={__('dialog.are_you_sure', 'Are you sure you want to delete this submission?')}
                        onConfirm={() => {
                            router.delete(
                                `/admin/forms/${form.id}/submissions/${row.original.id}`,
                                {
                                    onSuccess: () =>
                                        toast.success('Submission deleted'),
                                },
                            );
                        }}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Submissions: ${form.name}`} />

            <Wrapper>
                <PageHeader
                    title={`Submissions: ${form.name}`}
                    description={`${submissions.total} total submissions`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={`/admin/forms/${form.id}/edit`} prefetch cacheFor={30}>
                                {__('action.edit_form', 'Edit Form')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={submissions.data}
                    pagination={{
                        current_page: submissions.current_page,
                        last_page: submissions.last_page,
                        per_page: submissions.per_page,
                        total: submissions.total,
                        prev_page_url: submissions.prev_page_url ?? null,
                        next_page_url: submissions.next_page_url ?? null,
                    }}
                />
            </Wrapper>
        </AppLayout>
    );
}
