import { Link, Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as AttributeController from '@/actions/App/Http/Controllers/Admin/Ecommerce/AttributeController';
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

const ATTRIBUTE_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean (Yes/No)' },
    { value: 'select', label: 'Select (Dropdown)' },
    { value: 'multiselect', label: 'Multi-Select' },
    { value: 'color', label: 'Color Picker' },
];

export default function Create({
    attribute,
}: {
    attribute?: {
        id: number;
        name: string;
        slug: string;
        type: string;
        is_filterable: boolean;
        is_variant_selection: boolean;
    };
}) {
    const __ = useTranslation();
    const isEditing = !!attribute;
    const formId = isEditing ? 'attribute-edit-form' : 'attribute-create-form';
    const breadcrumbs: BreadcrumbItem[] = isEditing
        ? [
              {
                  title: 'Attributes',
                  href: AttributeController.index.url(),
              },
              {
                  title: 'Edit Attribute',
                  href: AttributeController.edit.url(attribute.id),
              },
          ]
        : [
              {
                  title: 'Attributes',
                  href: AttributeController.index.url(),
              },
              {
                  title: 'Create Attribute',
                  href: AttributeController.create.url(),
              },
          ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Attribute' : 'Create Attribute'} />

            <Wrapper>
                <PageHeader
                    title={
                        isEditing
                            ? __('page.edit_attribute', 'Edit Attribute')
                            : __('page.create_attribute', 'Create Attribute')
                    }
                    description={
                        isEditing
                            ? `Update details for ${attribute.name}`
                            : __(
                                  'page.create_attribute_desc',
                                  'Create a new product attribute',
                              )
                    }
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={AttributeController.index.url()}
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
                            ? AttributeController.update.url(attribute.id)
                            : AttributeController.store.url()
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
                                    placeholder="Attribute name"
                                    defaultValue={attribute?.name}
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
                                    placeholder="attribute-slug"
                                    defaultValue={attribute?.slug}
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="type">
                                    {__('label.type', 'Type')}
                                </Label>
                                <select
                                    id="type"
                                    name="type"
                                    defaultValue={attribute?.type ?? 'text'}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {ATTRIBUTE_TYPES.map((type) => (
                                        <option
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.type} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_filterable"
                                        name="is_filterable"
                                        value="1"
                                        defaultChecked={
                                            attribute?.is_filterable ?? false
                                        }
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label
                                        htmlFor="is_filterable"
                                        className="font-normal"
                                    >
                                        {__(
                                            'label.use_as_filter',
                                            'Use as filter in storefront',
                                        )}
                                    </Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_variant_selection"
                                        name="is_variant_selection"
                                        value="1"
                                        defaultChecked={
                                            attribute?.is_variant_selection ??
                                            false
                                        }
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <Label
                                        htmlFor="is_variant_selection"
                                        className="font-normal"
                                    >
                                        {__(
                                            'label.use_for_variants',
                                            'Use for product variants',
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
                                              'action.create_attribute',
                                              'Create Attribute',
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
