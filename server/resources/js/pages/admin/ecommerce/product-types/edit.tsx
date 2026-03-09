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

export default function Edit({
    productType,
}: {
    productType: {
        id: number;
        name: string;
        slug: string;
        has_variants: boolean;
        is_shippable: boolean;
    };
}) {
    const formId = 'product-type-edit-form';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Product Types',
            href: '/admin/ecommerce/product-types',
        },
        {
            title: 'Edit Product Type',
            href: `/admin/ecommerce/product-types/${productType.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Product Type" />

            <Wrapper>
                <PageHeader
                    title="Edit Product Type"
                    description={`Update details for ${productType.name}`}
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit('/admin/ecommerce/product-types')
                            }
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Product Types
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={`/admin/ecommerce/product-types/${productType.id}`}
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
                                    placeholder="Product type name"
                                    defaultValue={productType.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    required
                                    placeholder="product-type-slug"
                                    defaultValue={productType.slug}
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="hidden"
                                        name="has_variants"
                                        value="0"
                                    />
                                    <input
                                        type="checkbox"
                                        id="has_variants"
                                        name="has_variants"
                                        value="1"
                                        defaultChecked={
                                            productType.has_variants
                                        }
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label
                                        htmlFor="has_variants"
                                        className="font-normal"
                                    >
                                        Has variants (e.g., size, color)
                                    </Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="hidden"
                                        name="is_shippable"
                                        value="0"
                                    />
                                    <input
                                        type="checkbox"
                                        id="is_shippable"
                                        name="is_shippable"
                                        value="1"
                                        defaultChecked={
                                            productType.is_shippable
                                        }
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label
                                        htmlFor="is_shippable"
                                        className="font-normal"
                                    >
                                        Is shippable
                                    </Label>
                                </div>
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
