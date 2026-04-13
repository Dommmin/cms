import { Form, Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PlusIcon, PowerIcon, Trash2Icon } from 'lucide-react';

import * as AutomationController from '@/actions/App/Http/Controllers/Admin/Marketing/AutomationController';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { AutomationCampaign, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: '/admin/newsletter/campaigns' },
    { title: 'Marketing Automations', href: AutomationController.index.url() },
];

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    ready: 'bg-green-100 text-green-800',
    sending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
};

const TRIGGER_DESCRIPTIONS: Record<string, string> = {
    on_subscribe: 'Sends when a new subscriber signs up',
    on_first_order: "Sends after a customer's first purchase",
    on_birthday: 'Sends on customer birthday (runs daily)',
    after_purchase: 'Sends after a purchase with optional delay',
    cart_abandonment: 'Sends when a cart is abandoned',
    product_review_request: 'Requests a product review after delivery',
    wishlist_back_in_stock: 'Notifies when a wishlisted product is back',
    loyalty_points_earned: 'Sends when loyalty points are earned',
    category_purchased: 'Sends after a purchase from a specific category',
    customer_inactive: 'Sends after 30+ days of inactivity',
    product_purchased: 'Sends after a specific product is purchased',
};

function TriggerCell({ trigger, triggerLabel }: { trigger: string | null; triggerLabel: string | null }) {
    if (!trigger) {
        return <span className="text-muted-foreground text-sm">—</span>;
    }

    const description = TRIGGER_DESCRIPTIONS[trigger];

    return (
        <div>
            <span className="text-sm font-medium">{triggerLabel ?? trigger}</span>
            {description && (
                <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
            )}
        </div>
    );
}

export default function AutomationsIndex({ campaigns }: IndexProps) {
    const columns: ColumnDef<AutomationCampaign>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            accessorKey: 'trigger',
            header: 'Trigger',
            cell: ({ row }) => (
                <TriggerCell
                    trigger={row.original.trigger}
                    triggerLabel={row.original.trigger_label}
                />
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    className={
                        statusColors[row.original.status] ??
                        'bg-gray-100 text-gray-800'
                    }
                >
                    {row.original.status_label}
                </Badge>
            ),
        },
        {
            accessorKey: 'total_sent',
            header: 'Emails Sent',
            cell: ({ row }) => (
                <span className="text-sm">{row.original.total_sent.toLocaleString()}</span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {new Date(row.original.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={AutomationController.edit.url(row.original.id)}>
                            Edit
                        </Link>
                    </Button>

                    <Form
                        action={AutomationController.toggle.url(row.original.id)}
                        method="post"
                    >
                        {({ processing }) => (
                            <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                disabled={processing}
                                title={row.original.status === 'ready' ? 'Set to Draft' : 'Set to Ready'}
                            >
                                <PowerIcon className="h-4 w-4" />
                            </Button>
                        )}
                    </Form>

                    <Form
                        action={AutomationController.destroy.url(row.original.id)}
                        method="delete"
                        onBefore={() => confirm('Delete this automation?')}
                    >
                        {({ processing }) => (
                            <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                disabled={processing}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </Button>
                        )}
                    </Form>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Marketing Automations" />
            <Wrapper>
                <PageHeader
                    title="Marketing Automations"
                    description="Automated campaigns triggered by customer behavior"
                >
                    <PageHeaderActions>
                        <Button asChild>
                            <Link href={AutomationController.create.url()}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                New Automation
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    data={campaigns}
                    columns={columns}
                    emptyMessage="No automated campaigns yet. Create one to get started."
                />
            </Wrapper>
        </AppLayout>
    );
}
