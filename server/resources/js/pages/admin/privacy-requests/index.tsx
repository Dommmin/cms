import { Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon } from 'lucide-react';
import * as PrivacyRequestController from '@/actions/App/Http/Controllers/Admin/PrivacyRequestController';
import DataTable from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps, PrivacyRequest } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Privacy Requests', href: PrivacyRequestController.index.url() },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

export default function PrivacyRequestsIndex({
    privacyRequests,
    filters,
    stats,
}: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<PrivacyRequest>[] = [
        {
            accessorKey: 'type',
            header: __('column.type', 'Type'),
            cell: ({ row }) => (
                <span className="font-medium">{row.original.type}</span>
            ),
        },
        {
            id: 'customer',
            header: __('column.customer', 'Customer'),
            cell: ({ row }) => {
                const user = row.original.user;

                if (!user) {
                    return (
                        <span className="text-muted-foreground">
                            {row.original.email ?? __('misc.guest', 'Guest')}
                        </span>
                    );
                }

                return (
                    <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    className={
                        statusColors[row.original.status] ??
                        'bg-gray-100 text-gray-800'
                    }
                >
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'requested_at',
            header: __('column.requested_at', 'Requested'),
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.requested_at
                        ? new Date(row.original.requested_at).toLocaleString()
                        : '—'}
                </span>
            ),
        },
        {
            accessorKey: 'resolved_at',
            header: __('column.resolved_at', 'Resolved'),
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.resolved_at
                        ? new Date(row.original.resolved_at).toLocaleString()
                        : '—'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <Button asChild variant="outline" size="sm">
                    <Link
                        href={PrivacyRequestController.show.url(
                            row.original.id,
                        )}
                        prefetch
                        cacheFor={30}
                    >
                        <EyeIcon className="mr-1 h-3 w-3" />
                        {__('action.show', 'View')}
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Privacy Requests" />
            <Wrapper>
                <PageHeader
                    title={__('page.privacy_requests', 'Privacy Requests')}
                    description={__(
                        'page.privacy_requests_desc',
                        'Review GDPR exports, processing restrictions, and account deletion logs.',
                    )}
                />

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-sm text-muted-foreground">
                            {__('misc.total', 'Total')}
                        </div>
                        <div className="text-2xl font-bold">
                            {stats.total_requests}
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-sm text-muted-foreground">
                            {__('status.completed', 'Completed')}
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.completed_requests}
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-sm text-muted-foreground">
                            {__('status.pending', 'Pending')}
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {stats.pending_requests}
                        </div>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={privacyRequests.data}
                    pagination={{
                        current_page: privacyRequests.current_page,
                        last_page: privacyRequests.last_page,
                        per_page: privacyRequests.per_page,
                        total: privacyRequests.total,
                        prev_page_url: privacyRequests.prev_page_url ?? null,
                        next_page_url: privacyRequests.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search privacy requests...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={PrivacyRequestController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
