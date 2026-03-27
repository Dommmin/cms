import { Link, Form, Head } from '@inertiajs/react';
import * as ProductFlagController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductFlagController';
import { ArrowLeftIcon } from 'lucide-react';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Flags', href: ProductFlagController.index.url() },
    { title: 'Create Flag', href: ProductFlagController.create.url() },
];

export default function Create() {
    const __ = useTranslation();
    const formId = 'product-flag-create-form';
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product Flag" />

            <Wrapper>
                <PageHeader
                    title={__(
                        'page.create_product_flag',
                        'Create Product Flag',
                    )}
                    description={__(
                        'page.create_product_flag_desc',
                        'Add a new label flag for your products',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={ProductFlagController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={ProductFlagController.store.url()}
                    method="post"
                    id={formId}
                    className="max-w-xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {__('label.name', 'Name')}
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    autoFocus
                                    placeholder="e.g. New, Sale, Best Seller"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">
                                    {__('label.slug', 'Slug')}
                                </Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    required
                                    placeholder="e.g. new, sale, best-seller"
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="color">
                                    {__('label.color', 'Color')}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="color-picker"
                                        type="color"
                                        name="color"
                                        defaultValue="#ef4444"
                                        className="h-9 w-14 cursor-pointer rounded-md border bg-background p-1"
                                    />
                                    <Input
                                        id="color"
                                        name="color"
                                        placeholder="#ef4444"
                                        defaultValue="#ef4444"
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
                                <Label htmlFor="description">
                                    {__('label.description', 'Description')}
                                </Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    placeholder="Optional description"
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
                                    defaultChecked
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    {__('label.is_active', 'Active')}
                                </Label>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel={__(
                                    'action.create_flag',
                                    'Create Flag',
                                )}
                                processingLabel="Creating..."
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
