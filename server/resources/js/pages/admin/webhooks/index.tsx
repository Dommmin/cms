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
    const handleTest = (webhook: Webhook) => {
        router.post(
            WebhookController.test.url(webhook.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Test webhook sent'),
                onError: () => toast.error('Failed to send test webhook'),
            },
        );
    };

    const columns: ColumnDef<Webhook>[] = [
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
            accessorKey: 'url',
            header: 'URL',
            cell: ({ row }) => (
                <span
                    className="max-w-[200px] truncate text-sm font-mono text-muted-foreground"
                    title={row.original.url}
                >
                    {row.original.url}
                </span>
            ),
        },
        {
            accessorKey: 'events',
            header: 'Events',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.events.slice(0, 3).map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
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
            header: 'Active',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            accessorKey: 'last_triggered_at',
            header: 'Last Triggered',
            cell: ({ row }) =>
                row.original.last_triggered_at ? (
                    <span className="text-xs text-muted-foreground">
                        {new Date(row.original.last_triggered_at).toLocaleString()}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">Never</span>
                ),
        },
        {
            accessorKey: 'failure_count',
            header: 'Failures',
            cell: ({ row }) =>
                row.original.failure_count > 0 ? (
                    <Badge variant="destructive">{row.original.failure_count}</Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">0</span>
                ),
        },
        {
            accessorKey: 'last_delivery_status',
            header: 'Last Delivery',
            cell: ({ row }) => (
                <StatusBadge status={row.original.last_delivery_status} />
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={WebhookController.edit.url(row.original.id)}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            Edit
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={WebhookController.deliveries.url(
                                row.original.id,
                            )}
                        >
                            <ActivityIcon className="mr-1 h-3 w-3" />
                            Deliveries
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(row.original)}
                    >
                        <FlaskConicalIcon className="mr-1 h-3 w-3" />
                        Test
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title="Delete Webhook"
                        description="Are you sure you want to delete this webhook? This action cannot be undone."
                        onConfirm={() =>
                            router.delete(
                                WebhookController.destroy.url(row.original.id),
                                {
                                    onSuccess: () =>
                                        toast.success('Webhook deleted'),
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
            <Head title="Webhooks" />
            <Wrapper>
                <PageHeader
                    title="Outgoing Webhooks"
                    description="Manage webhooks that notify external systems about events."
                >
                    <PageHeaderActions>
                        <Button asChild>
                            <Link href={WebhookController.create.url()}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                New Webhook
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable columns={columns} data={webhooks} />
            </Wrapper>
        </AppLayout>
    );
}
