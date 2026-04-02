import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as NewsletterSegmentController from '@/actions/App/Http/Controllers/Admin/NewsletterSegmentController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: NewsletterSegmentController.index.url() },
    { title: 'Segments', href: NewsletterSegmentController.index.url() },
    { title: 'Create', href: NewsletterSegmentController.create.url() },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Segment" />
            <Wrapper>
                <PageHeader
                    title="Create Segment"
                    description="Create a new subscriber segment"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={NewsletterSegmentController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={NewsletterSegmentController.store.url()}
                    method="post"
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="e.g., Active Subscribers"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe this segment..."
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    Active
                                </Label>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Creating...'
                                        : 'Create Segment'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
