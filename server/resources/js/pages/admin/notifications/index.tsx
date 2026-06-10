import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, PlusIcon, RefreshCwIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import * as AppNotificationController from '@/actions/App/Http/Controllers/Admin/AppNotificationController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import ListFilters from '@/components/list-filters';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { AppNotification, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifications', href: AppNotificationController.index.url() },
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

export default function NotificationsIndex({
    notifications,
    filters,
    types,
    channels,
    statuses,
}: IndexProps) {
    const __ = useTranslation();
    const activeFilterCount = [
        filters.type,
        filters.channel,
        filters.status,
    ].filter(Boolean).length;

    const updateFilters = (
        nextFilters: Partial<
            Pick<IndexProps['filters'], 'type' | 'channel' | 'status'>
        >,
    ) => {
        router.get(
            AppNotificationController.index.url(),
            { ...filters, ...nextFilters },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const columns: ColumnDef<AppNotification>[] = [
        {
            accessorKey: 'type',
            header: __('column.type', 'Type'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: 'channel',
            header: __('column.channel', 'Channel'),
            cell: ({ row }) => (
                <span>
                    {channelIcons[row.original.channel] || '📨'}{' '}
                    {row.original.channel}
                </span>
            ),
        },
        {
            accessorKey: 'customer',
            header: __('column.customer', 'Customer'),
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
            header: __('column.status', 'Status'),
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
            header: __('column.sent', 'Sent'),
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
            header: __('column.created_at', 'Created'),
            cell: ({ row }) => (
                <span className="text-sm">
                    {new Date(row.original.created_at).toLocaleString()}
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
                            href={AppNotificationController.show.url(
                                row.original.id,
                            )}
                            prefetch
                            cacheFor={60}
                        >
                            <EyeIcon className="mr-1 h-3 w-3" />
                            {__('action.show', 'View')}
                        </Link>
                    </Button>
                    {row.original.status === 'failed' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                router.post(
                                    AppNotificationController.resend.url(
                                        row.original.id,
                                    ),
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
                            {__('action.resend', 'Resend')}
                        </Button>
                    )}
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Notification')}
                        description={__('dialog.delete_confirm', {
                            name:
                                row.original.type ||
                                `Notification #${row.original.id}`,
                        })}
                        onConfirm={() => {
                            router.delete(
                                AppNotificationController.destroy.url(
                                    row.original.id,
                                ),
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
                    title={__('page.notifications', 'Notifications')}
                    description={__(
                        'page.notifications_desc',
                        'Manage system notifications',
                    )}
                >
                    <PageHeaderActions compact>
                        <Button asChild variant="outline">
                            <Link
                                href={AppNotificationController.create.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'Create Notification')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <ListFilters
                    activeCount={activeFilterCount}
                    description={__(
                        'page.notifications_filters_desc',
                        'Narrow notifications by type, channel, and delivery status.',
                    )}
                    contentClassName="sm:grid sm:grid-cols-3 sm:items-end sm:gap-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="notification-type-filter">
                            {__('column.type', 'Type')}
                        </Label>
                        <Select
                            value={filters.type || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    type: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="notification-type-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__('column.type', 'Type')}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                {types.map((type) => (
                                    <SelectItem
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notification-channel-filter">
                            {__('column.channel', 'Channel')}
                        </Label>
                        <Select
                            value={filters.channel || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    channel: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="notification-channel-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__(
                                        'column.channel',
                                        'Channel',
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                {channels.map((channel) => (
                                    <SelectItem
                                        key={channel.value}
                                        value={channel.value}
                                    >
                                        {channel.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notification-status-filter">
                            {__('column.status', 'Status')}
                        </Label>
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) =>
                                updateFilters({
                                    status: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id="notification-status-filter"
                                className="w-full"
                            >
                                <SelectValue
                                    placeholder={__('column.status', 'Status')}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {__('misc.all', 'All')}
                                </SelectItem>
                                {statuses.map((status) => (
                                    <SelectItem
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </ListFilters>

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
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search notifications...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={AppNotificationController.index.url()}
                    mobilePrimaryColumns={4}
                    mobileCardTitle={(row) => row.type}
                />
            </Wrapper>
        </AppLayout>
    );
}
