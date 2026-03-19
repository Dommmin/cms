import { Link, Form, Head } from '@inertiajs/react';
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

export default function Create({
    productType,
}: {
    productType?: {
        id: number;
        name: string;
        slug: string;
        has_variants: boolean;
        is_shippable: boolean;
    };
}) {
    const __ = useTranslation();
    const isEditing = !!productType;
    const formId = isEditing
        ? 'product-type-edit-form'
        : 'product-type-create-form';
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Product Types',
            href: '/admin/ecommerce/product-types',
        },
        isEditing
            ? {
                  title: 'Edit Product Type',
                  href: `/admin/ecommerce/product-types/${productType.id}/edit`,
              }
            : {
                  title: 'Create Product Type',
                  href: '/admin/ecommerce/product-types/create',
              },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={isEditing ? 'Edit Product Type' : 'Create Product Type'}
            />

            <Wrapper>
                <PageHeader
                    title={
                        isEditing
                            ? __('page.edit_product_type', 'Edit Product Type')
                            : __(
                                  'page.create_product_type',
                                  'Create Product Type',
                              )
                    }
                    description={
                        isEditing
                            ? `Update details for ${productType.name}`
                            : __(
                                  'page.create_product_type_desc',
                                  'Create a new product type',
                              )
                    }
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/ecommerce/product-types"
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
                    action={
                        isEditing
                            ? `/admin/ecommerce/product-types/${productType.id}`
                            : '/admin/ecommerce/product-types'
                    }
                    method={isEditing ? 'put' : 'post'}
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
                                    placeholder="Product type name"
                                    defaultValue={productType?.name}
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
                                    placeholder="product-type-slug"
                                    defaultValue={productType?.slug}
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
                                            productType?.has_variants ?? false
                                        }
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label
                                        htmlFor="has_variants"
                                        className="font-normal"
                                    >
                                        {__(
                                            'label.has_variants',
                                            'Has variants (e.g., size, color)',
                                        )}
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
                                            productType?.is_shippable ?? true
                                        }
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label
                                        htmlFor="is_shippable"
                                        className="font-normal"
                                    >
                                        {__(
                                            'label.is_shippable',
                                            'Is shippable',
                                        )}
                                    </Label>
                                </div>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel={
                                    isEditing
                                        ? __(
                                              'action.save_changes',
                                              'Save Changes',
                                          )
                                        : __(
                                              'action.create_product_type',
                                              'Create Product Type',
                                          )
                                }
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
