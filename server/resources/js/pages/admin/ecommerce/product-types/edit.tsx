import { Link, Form, Head, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/hooks/use-translation';
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
    const __ = useTranslation();
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
                    title={__('page.edit_product_type', 'Edit Product Type')}
                    description={`Update details for ${productType.name}`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                <Link href='/admin/ecommerce/product-types' prefetch cacheFor={30}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
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
                                <Label htmlFor="name">{__('label.name', 'Name')}</Label>
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
                                <Label htmlFor="slug">{__('label.slug', 'Slug')}</Label>
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
                                        {__('label.has_variants', 'Has variants (e.g., size, color)')}
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
                                        {__('label.is_shippable', 'Is shippable')}
                                    </Label>
                                </div>
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
