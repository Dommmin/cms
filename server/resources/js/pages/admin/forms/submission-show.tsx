import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/hooks/use-translation';
import type { BreadcrumbItem } from '@/types';

type SubmissionData = {
    id: number;
    form_id: number;
    data: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    page_url: string | null;
    created_at: string;
};

type FormData = {
    id: number;
    name: string;
    slug: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Forms', href: '/admin/forms' },
    { title: 'Submissions', href: '#' },
    { title: 'Details', href: '#' },
];

export default function SubmissionShow({
    form,
    submission,
}: {
    form: FormData;
    submission: SubmissionData;
}) {
    const __ = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Submission #${submission.id}`} />

            <Wrapper>
                <PageHeader
                    title={`Submission #${submission.id}`}
                    description={new Date(
                        submission.created_at,
                    ).toLocaleString()}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={`/admin/forms/${form.id}/submissions`} prefetch cacheFor={30}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back_to_submissions', 'Back to Submissions')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {__('misc.submitted_data', 'Submitted Data')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                {Object.entries(submission.data).map(
                                    ([key, value]) => (
                                        <div key={key}>
                                            <dt className="text-sm font-medium text-muted-foreground">
                                                {key}
                                            </dt>
                                            <dd className="mt-1 text-sm">
                                                {value === null ? (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                ) : typeof value ===
                                                  'object' ? (
                                                    <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                                                        {JSON.stringify(
                                                            value,
                                                            null,
                                                            2,
                                                        )}
                                                    </pre>
                                                ) : (
                                                    String(value)
                                                )}
                                            </dd>
                                        </div>
                                    ),
                                )}
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{__('misc.metadata', 'Metadata')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        {__('label.form', 'Form')}
                                    </dt>
                                    <dd className="mt-1 text-sm">
                                        {form.name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        {__('label.ip_address', 'IP Address')}
                                    </dt>
                                    <dd className="mt-1 font-mono text-sm">
                                        {submission.ip_address || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        {__('label.page_url', 'Page URL')}
                                    </dt>
                                    <dd className="mt-1 text-sm">
                                        {submission.page_url || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        {__('label.user_agent', 'User Agent')}
                                    </dt>
                                    <dd className="mt-1 text-xs break-all text-muted-foreground">
                                        {submission.user_agent || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        {__('label.submitted_at', 'Submitted At')}
                                    </dt>
                                    <dd className="mt-1 text-sm">
                                        {new Date(
                                            submission.created_at,
                                        ).toLocaleString()}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
