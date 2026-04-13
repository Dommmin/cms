import { Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeftIcon } from 'lucide-react';
import * as WebhookController from '@/actions/App/Http/Controllers/Admin/WebhookController';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
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

export default function WebhookDeliveries({ webhook, deliveries }: DeliveriesProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Webhooks', href: WebhookController.index.url() },
        { title: webhook.name, href: WebhookController.edit.url(webhook.id) },
        { title: 'Deliveries', href: '' },
    ];

    const columns: ColumnDef<WebhookDelivery>[] = [
        {
            accessorKey: 'event',
            header: 'Event',
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono text-xs">
                    {row.original.event}
                </Badge>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            accessorKey: 'attempt',
            header: 'Attempt',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    #{row.original.attempt}
                </span>
            ),
        },
        {
            accessorKey: 'response_status',
            header: 'Response',
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
            header: 'Duration',
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
            header: 'Delivered At',
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
            header: 'Created',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleString()}
                </span>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Deliveries — ${webhook.name}`} />
            <Wrapper>
                <PageHeader
                    title={`Deliveries: ${webhook.name}`}
                    description={`Showing ${deliveries.total} delivery records for this webhook.`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={WebhookController.index.url()}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Webhooks
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable columns={columns} data={deliveries.data} />
            </Wrapper>
        </AppLayout>
    );
}
