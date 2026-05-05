import { Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeftIcon } from 'lucide-react';
import * as WebhookController from '@/actions/App/Http/Controllers/Admin/WebhookController';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { DeliveriesProps, WebhookDelivery } from './deliveries.types';

function StatusBadge({ status }: { status: 'pending' | 'success' | 'failed' }) {
    const variants = {
        success: 'default',
        failed: 'destructive',
        pending: 'secondary',
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
}

export default function WebhookDeliveries({
    webhook,
    deliveries,
}: DeliveriesProps) {
    const __ = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Webhooks', href: WebhookController.index.url() },
        { title: webhook.name, href: WebhookController.edit.url(webhook.id) },
        { title: 'Deliveries', href: '' },
    ];

    const columns: ColumnDef<WebhookDelivery>[] = [
        {
            accessorKey: 'event',
            header: __('webhook.event', 'Event'),
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono text-xs">
                    {row.original.event}
                </Badge>
            ),
        },
        {
            accessorKey: 'status',
            header: __('table.status', 'Status'),
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            accessorKey: 'attempt',
            header: __('webhook.attempt', 'Attempt'),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    #{row.original.attempt}
                </span>
            ),
        },
        {
            accessorKey: 'response_status',
            header: __('webhook.response', 'Response'),
            cell: ({ row }) =>
                row.original.response_status ? (
                    <Badge
                        variant={
                            row.original.response_status >= 200 &&
                            row.original.response_status < 300
                                ? 'default'
                                : 'destructive'
                        }
                    >
                        HTTP {row.original.response_status}
                    </Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'duration_ms',
            header: __('webhook.duration', 'Duration'),
            cell: ({ row }) =>
                row.original.duration_ms != null ? (
                    <span className="text-sm text-muted-foreground">
                        {row.original.duration_ms}ms
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'delivered_at',
            header: __('webhook.delivered_at', 'Delivered At'),
            cell: ({ row }) =>
                row.original.delivered_at ? (
                    <span className="text-xs text-muted-foreground">
                        {new Date(row.original.delivered_at).toLocaleString()}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'created_at',
            header: __('table.created_at', 'Created'),
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleString()}
                </span>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${__('webhook.deliveries', 'Deliveries')} — ${webhook.name}`}
            />
            <Wrapper>
                <PageHeader
                    title={`${__('webhook.deliveries', 'Deliveries')}: ${webhook.name}`}
                    description={`${__('webhook.deliveries_count', 'Showing')} ${deliveries.total} ${__('webhook.deliveries_suffix', 'delivery records for this webhook.')}`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={WebhookController.index.url()}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__(
                                    'webhook.back_to_webhooks',
                                    'Back to Webhooks',
                                )}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable columns={columns} data={deliveries.data} />
            </Wrapper>
        </AppLayout>
    );
}
