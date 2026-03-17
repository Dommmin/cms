import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    PlusIcon,
    EyeIcon,
    TrashIcon,
    RefreshCwIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Customer = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
};

type AppNotification = {
    id: number;
    type: string;
    channel: string;
    status: string;
    customer?: Customer | null;
    sent_at: string | null;
    failed_at: string | null;
    created_at: string;
};

type NotificationsData = {
    data: AppNotification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    notifications: NotificationsData;
    filters: {
        search?: string;
        type?: string;
        status?: string;
        channel?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifications', href: '/admin/notifications' },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
};

const channelIcons: Record<string, string> = {
    email: '📧',
    sms: '📱',
    push: '🔔',
    in_app: '🔵',
};

export default function NotificationsIndex({ notifications, filters }: Props) {
    const columns: ColumnDef<AppNotification>[] = [
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: 'channel',
            header: 'Channel',
            cell: ({ row }) => (
                <span>
                    {channelIcons[row.original.channel] || '📨'}{' '}
                    {row.original.channel}
                </span>
            ),
        },
        {
            accessorKey: 'customer',
            header: 'Customer',
            cell: ({ row }) =>
                row.original.customer ? (
                    <div>
                        <div className="font-medium">
                            {row.original.customer.first_name}{' '}
                            {row.original.customer.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {row.original.customer.email}
                        </div>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    className={
                        statusColors[row.original.status] ||
                        'bg-gray-100 text-gray-800'
                    }
                >
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'sent_at',
            header: 'Sent',
            cell: ({ row }) =>
                row.original.sent_at ? (
                    <span className="text-sm">
                        {new Date(row.original.sent_at).toLocaleString()}
                    </span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => (
                <span className="text-sm">
                    {new Date(row.original.created_at).toLocaleString()}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/notifications/${row.original.id}`} prefetch cacheFor={60}>
                            <EyeIcon className="mr-1 h-3 w-3" />
                            View
                        </Link>
                    </Button>
                    {row.original.status === 'failed' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                router.post(
                                    `/admin/notifications/${row.original.id}/resend`,
                                    {},
                                    {
                                        onSuccess: () =>
                                            toast.success(
                                                'Notification queued for resend',
                                            ),
                                    },
                                );
                            }}
                        >
                            <RefreshCwIcon className="mr-1 h-3 w-3" />
                            Resend
                        </Button>
                    )}
                    <ConfirmButton
                        variant="destructive"
                        size="sm"
                        title="Delete Notification"
                        description="Are you sure you want to delete this notification?"
                        onConfirm={() => {
                            router.delete(
                                `/admin/notifications/${row.original.id}`,
                                {
                                    onSuccess: () =>
                                        toast.success('Notification deleted'),
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
            <Head title="Notifications" />
            <Wrapper>
                <PageHeader
                    title="Notifications"
                    description="Manage system notifications"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/notifications/create" prefetch cacheFor={30}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Notification
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={notifications.data}
                    pagination={{
                        current_page: notifications.current_page,
                        last_page: notifications.last_page,
                        per_page: notifications.per_page,
                        total: notifications.total,
                        prev_page_url: notifications.prev_page_url ?? null,
                        next_page_url: notifications.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search notifications..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/notifications"
                />
            </Wrapper>
        </AppLayout>
    );
}
