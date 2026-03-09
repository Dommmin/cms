import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Submission {
    id: number;
    form_id: number;
    payload: Record<string, unknown>;
    status: string | null;
    ip: string | null;
    user_agent: string | null;
    page_url: string | null;
    created_at: string;
    form: {
        id: number;
        name: string;
    };
}

interface PaginationData {
    data: Submission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface IndexProps {
    submissions: PaginationData;
    filters: {
        search?: string;
        form_id?: string;
        date_from?: string;
        date_to?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Forms', href: '/admin/forms' },
    { title: 'All Submissions', href: '/admin/form-submissions' },
];

function payloadPreview(payload: Record<string, unknown>): string {
    return Object.entries(payload)
        .slice(0, 2)
        .map(([k, v]) => `${k}: ${String(v).slice(0, 30)}`)
        .join(', ') || 'No data';
}

export default function FormSubmissionsIndex({ submissions, filters }: IndexProps) {
    const columns: ColumnDef<Submission>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => (
                <span className="font-mono text-xs">#{row.original.id}</span>
            ),
        },
        {
            accessorKey: 'form',
            header: 'Form',
            cell: ({ row }) => (
                <span className="font-medium">{row.original.form?.name ?? `#${row.original.form_id}`}</span>
            ),
        },
        {
            accessorKey: 'payload',
            header: 'Data',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {payloadPreview(row.original.payload)}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) =>
                row.original.status ? (
                    <Badge variant="secondary">{row.original.status}</Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'ip',
            header: 'IP',
            cell: ({ row }) => (
                <span className="font-mono text-xs text-muted-foreground">
                    {row.original.ip ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            router.visit(
                                `/admin/forms/${row.original.form_id}/submissions/${row.original.id}`,
                            )
                        }
                    >
                        <EyeIcon className="mr-1 h-3 w-3" />
                        View
                    </Button>
                    <ConfirmButton
                        variant="destructive"
                        size="sm"
                        title="Delete Submission"
                        description="Are you sure you want to delete this submission?"
                        onConfirm={() => {
                            router.delete(
                                `/admin/forms/${row.original.form_id}/submissions/${row.original.id}`,
                                {
                                    onSuccess: () => toast.success('Submission deleted'),
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
                    title="Form Submissions"
                    description={`${submissions.total} total submissions`}
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
                    searchPlaceholder="Search submissions..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/form-submissions"
                />
            </Wrapper>
        </AppLayout>
    );
}
