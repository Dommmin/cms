import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DownloadIcon, EyeIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import * as CustomReportController from '@/actions/App/Http/Controllers/Admin/CustomReportController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { CustomReport, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: CustomReportController.index.url() },
];

const DATA_SOURCE_LABELS: Record<string, string> = {
    orders: 'Orders',
    products: 'Products',
    customers: 'Customers',
};

const CHART_TYPE_LABELS: Record<string, string> = {
    table: 'Table',
    line: 'Line',
    bar: 'Bar',
    pie: 'Pie',
};

export default function ReportsIndex({ reports }: IndexProps) {
    const columns: ColumnDef<CustomReport>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    {row.original.description && (
                        <p className="text-xs text-muted-foreground">
                            {row.original.description}
                        </p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'data_source',
            header: 'Data Source',
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {DATA_SOURCE_LABELS[row.original.data_source] ??
                        row.original.data_source}
                </Badge>
            ),
        },
        {
            accessorKey: 'chart_type',
            header: 'Chart Type',
            cell: ({ row }) =>
                row.original.chart_type ? (
                    <Badge variant="outline">
                        {CHART_TYPE_LABELS[row.original.chart_type] ??
                            row.original.chart_type}
                    </Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'is_public',
            header: 'Public',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_public ? 'default' : 'secondary'}
                >
                    {row.original.is_public ? 'Public' : 'Private'}
                </Badge>
            ),
        },
        {
            accessorKey: 'user',
            header: 'Created By',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.user?.name ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={CustomReportController.show.url(
                                row.original.id,
                            )}
                        >
                            <EyeIcon className="mr-1 h-3 w-3" />
                            View
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={CustomReportController.edit.url(
                                row.original.id,
                            )}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            Edit
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <a
                            href={CustomReportController.exportMethod.url(
                                row.original.id,
                            )}
                        >
                            <DownloadIcon className="mr-1 h-3 w-3" />
                            CSV
                        </a>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title="Delete Report"
                        description="Delete this report? This cannot be undone."
                        onConfirm={() =>
                            router.delete(
                                CustomReportController.destroy.url(
                                    row.original.id,
                                ),
                                {
                                    onSuccess: () =>
                                        toast.success('Report deleted'),
                                },
                            )
                        }
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                        Delete
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Custom Reports" />
            <Wrapper>
                <PageHeader
                    title="Custom Reports"
                    description="Build and run ad-hoc reports on your data."
                >
                    <PageHeaderActions>
                        <Button asChild>
                            <Link href={CustomReportController.create.url()}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                New Report
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable columns={columns} data={reports} />
            </Wrapper>
        </AppLayout>
    );
}
