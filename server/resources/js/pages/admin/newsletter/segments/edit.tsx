import { Link, Form, Head } from '@inertiajs/react';
import * as NewsletterSegmentController from '@/actions/App/Http/Controllers/Admin/NewsletterSegmentController';
import { ArrowLeftIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { EditProps } from './edit.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: NewsletterSegmentController.index.url() },
    { title: 'Segments', href: NewsletterSegmentController.index.url() },
    { title: 'Edit', href: '' },
];

export default function Edit({ segment }: EditProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${segment.name}`} />
            <Wrapper>
                <PageHeader
                    title="Edit Segment"
                    description="Update segment settings"
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

                <div className="mb-4 flex items-center gap-2">
                    <Badge
                        variant={segment.is_active ? 'default' : 'secondary'}
                    >
                        {segment.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        Used by {segment.campaigns_count} campaigns
                    </span>
                </div>

                <Form
                    action={NewsletterSegmentController.update.url(segment.id)}
                    method="post"
                    className="max-w-2xl space-y-6"
                    children={({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="PUT" />

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={segment.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={segment.description ?? ''}
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
                                    defaultChecked={segment.is_active}
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
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </>
                    )}
                />
            </Wrapper>
        </AppLayout>
    );
}
