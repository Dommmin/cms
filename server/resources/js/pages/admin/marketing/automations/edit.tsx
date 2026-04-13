import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, Trash2Icon } from 'lucide-react';

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
import type { EditPageProps } from './form.types';

export default function Edit({ automation, triggers }: EditPageProps) {
    const __ = useTranslation();
    const formId = 'automation-edit-form';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Marketing Automations', href: AutomationController.index.url() },
        { title: 'Edit Automation', href: AutomationController.edit.url(automation.id!) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Automation: ${automation.name}`} />

            <Wrapper>
                <PageHeader
                    title="Edit Automation"
                    description={`Update settings for "${automation.name}"`}
                >
                    <PageHeaderActions>
                        <Form
                            action={AutomationController.destroy.url(automation.id!)}
                            method="delete"
                            onBefore={() => confirm('Are you sure you want to delete this automation?')}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    size="sm"
                                    disabled={processing}
                                >
                                    <Trash2Icon className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            )}
                        </Form>

                        <Button asChild variant="outline">
                            <Link href={AutomationController.index.url()}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={AutomationController.update.url(automation.id!)}
                    method="put"
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
                                    defaultValue={automation.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="trigger">Trigger</Label>
                                <select
                                    id="trigger"
                                    name="trigger"
                                    required
                                    defaultValue={automation.trigger}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    <option value="">— Select a trigger —</option>
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
                                    defaultValue={automation.subject}
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
                                    defaultValue={automation.content}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                />
                                <InputError message={errors.content} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue={automation.status}
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
                                submitLabel={__('action.save_changes', 'Save Changes')}
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
