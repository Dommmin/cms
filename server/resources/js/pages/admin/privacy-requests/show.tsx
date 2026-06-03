import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as PrivacyRequestController from '@/actions/App/Http/Controllers/Admin/PrivacyRequestController';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ShowProps } from './show.types';

export default function ShowPrivacyRequest({ privacyRequest }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Privacy Requests',
            href: PrivacyRequestController.index.url(),
        },
        {
            title: `#${privacyRequest.id}`,
            href: PrivacyRequestController.show.url(privacyRequest.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Privacy Request #${privacyRequest.id}`} />
            <Wrapper>
                <PageHeader
                    title={`Privacy Request #${privacyRequest.id}`}
                    description="GDPR request details"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={PrivacyRequestController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Privacy Requests
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="space-y-6 rounded-xl border bg-card p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Type
                            </p>
                            <p className="font-medium">{privacyRequest.type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Status
                            </p>
                            <Badge variant="outline">
                                {privacyRequest.status}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                User
                            </p>
                            <p className="font-medium">
                                {privacyRequest.user
                                    ? `${privacyRequest.user.name} (${privacyRequest.user.email})`
                                    : (privacyRequest.email ?? '—')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Processed By
                            </p>
                            <p className="font-medium">
                                {privacyRequest.processed_by_user
                                    ? `${privacyRequest.processed_by_user.name} (${privacyRequest.processed_by_user.email})`
                                    : 'Self-service workflow'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Requested At
                            </p>
                            <p className="font-medium">
                                {privacyRequest.requested_at
                                    ? new Date(
                                          privacyRequest.requested_at,
                                      ).toLocaleString()
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Resolved At
                            </p>
                            <p className="font-medium">
                                {privacyRequest.resolved_at
                                    ? new Date(
                                          privacyRequest.resolved_at,
                                      ).toLocaleString()
                                    : '—'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-sm text-muted-foreground">
                            Resolution Note
                        </p>
                        <div className="rounded-md border bg-muted/30 p-3 text-sm">
                            {privacyRequest.resolution_note ?? '—'}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-sm text-muted-foreground">
                            Payload
                        </p>
                        <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-xs">
                            {JSON.stringify(
                                privacyRequest.payload ?? {},
                                null,
                                2,
                            )}
                        </pre>
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
