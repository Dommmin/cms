import { Link, Head, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Customer = {
    id: number;
    first_name: string | null;
    last_name: string | null;
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
    error_message: string | null;
    metadata?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
};

type Props = {
    notification: AppNotification;
};

export default function ShowNotification({ notification }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Notifications', href: '/admin/notifications' },
        {
            title: `#${notification.id}`,
            href: `/admin/notifications/${notification.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Notification #${notification.id}`} />
            <Wrapper>
                <PageHeader
                    title={`Notification #${notification.id}`}
                    description="Notification details"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                <Link href='/admin/notifications' prefetch cacheFor={30}>
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Notifications
                        
                </Link>
            </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="space-y-6 rounded-xl border bg-card p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Type</p>
                            <p className="font-medium">{notification.type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Channel</p>
                            <p className="font-medium">{notification.channel}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant="outline">{notification.status}</Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Customer</p>
                            <p className="font-medium">
                                {notification.customer
                                    ? `${[notification.customer.first_name, notification.customer.last_name]
                                          .filter(Boolean)
                                          .join(' ') || notification.customer.email} (${notification.customer.email})`
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Created</p>
                            <p className="font-medium">{new Date(notification.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Sent</p>
                            <p className="font-medium">
                                {notification.sent_at
                                    ? new Date(notification.sent_at).toLocaleString()
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Failed At</p>
                            <p className="font-medium">
                                {notification.failed_at
                                    ? new Date(notification.failed_at).toLocaleString()
                                    : '—'}
                            </p>
                        </div>
                    </div>

                    {notification.error_message && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                            <p className="font-medium">Error Message</p>
                            <p>{notification.error_message}</p>
                        </div>
                    )}

                    {notification.metadata && (
                        <div>
                            <p className="mb-2 text-sm text-muted-foreground">Metadata</p>
                            <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-xs">
                                {JSON.stringify(notification.metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </Wrapper>
        </AppLayout>
    );
}
