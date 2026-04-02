import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import * as FormController from '@/actions/App/Http/Controllers/Admin/FormController';
import * as FormSubmissionController from '@/actions/App/Http/Controllers/Admin/FormSubmissionController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps, Submission } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Forms', href: FormController.index.url() },
    { title: 'All Submissions', href: FormSubmissionController.index.url(0) },
];

function payloadPreview(payload: Record<string, unknown>): string {
    return (
        Object.entries(payload)
            .slice(0, 2)
            .map(([k, v]) => `${k}: ${String(v).slice(0, 30)}`)
            .join(', ') || 'No data'
    );
}

export default function FormSubmissionsIndex({
    submissions,
    filters,
}: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<Submission>[] = [
        {
            accessorKey: 'id',
            header: __('column.id', 'ID'),
            cell: ({ row }) => (
                <span className="font-mono text-xs">#{row.original.id}</span>
            ),
        },
        {
            accessorKey: 'form',
            header: __('column.form', 'Form'),
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.form?.name ?? `#${row.original.form_id}`}
                </span>
            ),
        },
        {
            accessorKey: 'payload',
            header: __('column.data', 'Data'),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {payloadPreview(row.original.payload)}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: __('column.status', 'Status'),
            cell: ({ row }) =>
                row.original.status ? (
                    <Badge variant="secondary">{row.original.status}</Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'ip',
            header: __('column.ip', 'IP'),
            cell: ({ row }) => (
                <span className="font-mono text-xs text-muted-foreground">
                    {row.original.ip ?? '—'}
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
                        <Link
                            href={FormSubmissionController.show.url({
                                form: row.original.form_id,
                                submission: row.original.id,
                            })}
                            prefetch
                            cacheFor={60}
                        >
                            <EyeIcon className="mr-1 h-3 w-3" />
                            {__('action.show', 'View')}
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Submission')}
                        description={__(
                            'dialog.cannot_be_undone',
                            'Are you sure you want to delete this submission?',
                        )}
                        onConfirm={() => {
                            router.delete(
                                FormSubmissionController.destroy.url({
                                    form: row.original.form_id,
                                    submission: row.original.id,
                                }),
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
            <Head title="Form Submissions" />

            <Wrapper>
                <PageHeader
                    title={__('page.form_submissions', 'Form Submissions')}
                    description={`${submissions.total} ${__('misc.total_submissions', 'total submissions')}`}
                />

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
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search submissions...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={FormSubmissionController.index.url(0)}
                />
            </Wrapper>
        </AppLayout>
    );
}
