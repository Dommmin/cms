import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as BrandController from '@/actions/App/Http/Controllers/Admin/Ecommerce/BrandController';
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
    brand,
}: {
    brand?: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        is_active: boolean;
    };
}) {
    const __ = useTranslation();
    const isEditing = !!brand;
    const formId = isEditing ? 'brand-edit-form' : 'brand-create-form';
    const breadcrumbs: BreadcrumbItem[] = isEditing
        ? [
              {
                  title: 'Brands',
                  href: BrandController.index.url(),
              },
              {
                  title: 'Edit Brand',
                  href: BrandController.edit.url(brand.id),
              },
          ]
        : [
              {
                  title: 'Brands',
                  href: BrandController.index.url(),
              },
              {
                  title: 'Create Brand',
                  href: BrandController.create.url(),
              },
          ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Brand' : 'Create Brand'} />

            <Wrapper>
                <PageHeader
                    title={
                        isEditing
                            ? __('page.edit_brand', 'Edit Brand')
                            : __('page.create_brand', 'Create Brand')
                    }
                    description={
                        isEditing
                            ? `Update details for ${brand.name}`
                            : __('page.create_brand_desc', 'Create a new brand')
                    }
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={BrandController.index.url()}
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
                            ? BrandController.update.url(brand.id)
                            : BrandController.store.url()
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
                                    placeholder="Brand name"
                                    defaultValue={brand?.name}
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
                                    placeholder="brand-slug"
                                    defaultValue={brand?.slug}
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">
                                    {__('label.description', 'Description')}
                                </Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    placeholder="Brand description (optional)"
                                    defaultValue={brand?.description}
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
                                    defaultChecked={brand?.is_active ?? true}
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
                                submitLabel={
                                    isEditing
                                        ? __(
                                              'action.save_changes',
                                              'Save Changes',
                                          )
                                        : __(
                                              'action.create_brand',
                                              'Create Brand',
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
