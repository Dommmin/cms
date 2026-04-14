import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

import * as AutomationController from '@/actions/App/Http/Controllers/Admin/Marketing/AutomationController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { CreatePageProps } from './form.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Marketing Automations', href: AutomationController.index.url() },
    { title: 'Create Automation', href: AutomationController.create.url() },
];

export default function Create({ triggers }: CreatePageProps) {
    const __ = useTranslation();
    const formId = 'automation-create-form';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Automation" />

            <Wrapper>
                <PageHeader
                    title="Create Automation"
                    description="Set up an automated email triggered by customer behavior"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={AutomationController.index.url()}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={AutomationController.store.url()}
                    method="post"
                    id={formId}
                    className="max-w-xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    autoFocus
                                    placeholder="e.g. Welcome Email"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="trigger">Trigger</Label>
                                <select
                                    id="trigger"
                                    name="trigger"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    <option value="">
                                        — Select a trigger —
                                    </option>
                                    {triggers.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.trigger} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="subject">Email Subject</Label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    required
                                    placeholder="e.g. Welcome to our store!"
                                />
                                <InputError message={errors.subject} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content">Content</Label>
                                <textarea
                                    id="content"
                                    name="content"
                                    required
                                    rows={8}
                                    placeholder="Email body (HTML allowed)"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                />
                                <InputError message={errors.content} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue="draft"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="ready">Ready</option>
                                </select>
                                <InputError message={errors.status} />
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel={__(
                                    'action.create',
                                    'Create Automation',
                                )}
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
