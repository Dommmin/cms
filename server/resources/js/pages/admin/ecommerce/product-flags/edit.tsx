import { Form, Head, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface ProductFlag {
    id: number;
    name: string;
    slug: string;
    color: string;
    description: string | null;
    is_active: boolean;
    position: number;
}

export default function Edit({ flag }: { flag: ProductFlag }) {
    const formId = 'product-flag-edit-form';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Product Flags', href: '/admin/ecommerce/product-flags' },
        {
            title: 'Edit Flag',
            href: `/admin/ecommerce/product-flags/${flag.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Product Flag" />

            <Wrapper>
                <PageHeader
                    title="Edit Product Flag"
                    description={`Update details for "${flag.name}"`}
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() => router.visit('/admin/ecommerce/product-flags')}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Flags
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={`/admin/ecommerce/product-flags/${flag.id}`}
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
                                    placeholder="e.g. New, Sale, Best Seller"
                                    defaultValue={flag.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    required
                                    placeholder="e.g. new, sale, best-seller"
                                    defaultValue={flag.slug}
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="color">Color</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="color-picker"
                                        type="color"
                                        name="color"
                                        defaultValue={flag.color}
                                        className="h-9 w-14 cursor-pointer rounded-md border bg-background p-1"
                                    />
                                    <Input
                                        id="color"
                                        name="color"
                                        placeholder="#ef4444"
                                        defaultValue={flag.color}
                                        className="flex-1 font-mono text-sm"
                                        maxLength={7}
                                        readOnly
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Use the color picker to choose a flag color.
                                </p>
                                <InputError message={errors.color} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    placeholder="Optional description"
                                    defaultValue={flag.description ?? ''}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={flag.is_active}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label htmlFor="is_active" className="font-normal">
                                    Active
                                </Label>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel="Save Changes"
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
