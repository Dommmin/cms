import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    ActivityIcon,
    FlaskConicalIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as WebhookController from '@/actions/App/Http/Controllers/Admin/WebhookController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps, Webhook } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Webhooks', href: WebhookController.index.url() },
];

function StatusBadge({
    status,
}: {
    status: 'success' | 'failed' | 'pending' | null;
}) {
    if (!status) {
        return <span className="text-xs text-muted-foreground">—</span>;
    }
    const variants = {
        success: 'default',
        failed: 'destructive',
        pending: 'secondary',
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
}

export default function WebhooksIndex({ webhooks }: IndexProps) {
    const __ = useTranslation();

    const handleTest = (webhook: Webhook) => {
        router.post(
            WebhookController.test.url(webhook.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(__('webhook.test_sent', 'Test webhook sent')),
                onError: () =>
                    toast.error(
                        __(
                            'webhook.test_failed',
                            'Failed to send test webhook',
                        ),
                    ),
            },
        );
    };

    const columns: ColumnDef<Webhook>[] = [
        {
            accessorKey: 'name',
            header: __('table.name', 'Name'),
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
            accessorKey: 'url',
            header: __('table.url', 'URL'),
            cell: ({ row }) => (
                <span
                    className="max-w-[200px] truncate font-mono text-sm text-muted-foreground"
                    title={row.original.url}
                >
                    {row.original.url}
                </span>
            ),
        },
        {
            accessorKey: 'events',
            header: __('webhook.events', 'Events'),
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.events.slice(0, 3).map((event) => (
                        <Badge
                            key={event}
                            variant="outline"
                            className="text-xs"
                        >
                            {event}
                        </Badge>
                    ))}
                    {row.original.events.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                            +{row.original.events.length - 3}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'is_active',
            header: __('webhook.active', 'Active'),
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
            accessorKey: 'last_triggered_at',
            header: __('webhook.last_triggered', 'Last Triggered'),
            cell: ({ row }) =>
                row.original.last_triggered_at ? (
                    <span className="text-xs text-muted-foreground">
                        {new Date(
                            row.original.last_triggered_at,
                        ).toLocaleString()}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        {__('webhook.never', 'Never')}
                    </span>
                ),
        },
        {
            accessorKey: 'failure_count',
            header: __('webhook.failures', 'Failures'),
            cell: ({ row }) =>
                row.original.failure_count > 0 ? (
                    <Badge variant="destructive">
                        {row.original.failure_count}
                    </Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">0</span>
                ),
        },
        {
            accessorKey: 'last_delivery_status',
            header: __('webhook.last_delivery', 'Last Delivery'),
            cell: ({ row }) => (
                <StatusBadge status={row.original.last_delivery_status} />
            ),
        },
        {
            id: 'actions',
            header: __('table.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={WebhookController.edit.url(row.original.id)}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={WebhookController.deliveries.url(
                                row.original.id,
                            )}
                        >
                            <ActivityIcon className="mr-1 h-3 w-3" />
                            {__('webhook.deliveries', 'Deliveries')}
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(row.original)}
                    >
                        <FlaskConicalIcon className="mr-1 h-3 w-3" />
                        {__('webhook.test', 'Test')}
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('webhook.delete_title', 'Delete Webhook')}
                        description={__(
                            'webhook.delete_description',
                            'Are you sure you want to delete this webhook? This action cannot be undone.',
                        )}
                        onConfirm={() =>
                            router.delete(
                                WebhookController.destroy.url(row.original.id),
                                {
                                    onSuccess: () =>
                                        toast.success(
                                            __(
                                                'webhook.deleted',
                                                'Webhook deleted',
                                            ),
                                        ),
                                },
                            )
                        }
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
            <Head title={__('webhook.page_title', 'Webhooks')} />
            <Wrapper>
                <PageHeader
                    title={__('webhook.heading', 'Outgoing Webhooks')}
                    description={__(
                        'webhook.description',
                        'Manage webhooks that notify external systems about events.',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild>
                            <Link href={WebhookController.create.url()}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('webhook.new', 'New Webhook')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable columns={columns} data={webhooks} />
            </Wrapper>
        </AppLayout>
    );
}
