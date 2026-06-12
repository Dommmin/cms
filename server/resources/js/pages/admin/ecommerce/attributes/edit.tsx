import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
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
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';
import type { AttributeData, EditAttributeProps } from './edit.types';

const ATTRIBUTE_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'numeric', label: 'Numeric' },
    { value: 'select', label: 'Select' },
    { value: 'multiselect', label: 'Multi-Select' },
    { value: 'color', label: 'Color' },
] as const;

function emptyValue(position: number) {
    return {
        value: '',
        slug: '',
        color_hex: '',
        position,
    };
}

export default function EditAttribute({ attribute }: EditAttributeProps) {
    const __ = useTranslation();
    const formId = 'attribute-edit-form';
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [data, setData] = useState<AttributeData>({
        ...attribute,
        unit: attribute.unit ?? '',
        values: attribute.values.map((value) => ({
            ...value,
            color_hex: value.color_hex ?? '',
        })),
    });
    const supportsValues = ['select', 'multiselect', 'color'].includes(
        data.type,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Attributes',
            href: AttributeController.index.url(),
        },
        {
            title: 'Edit Attribute',
            href: AttributeController.edit.url(attribute.id),
        },
    ];

    const updateValue = (
        index: number,
        field: 'value' | 'slug' | 'color_hex' | 'position',
        value: string | number,
    ) => {
        setData((prev) => ({
            ...prev,
            values: prev.values.map((item, currentIndex) =>
                currentIndex === index
                    ? {
                          ...item,
                          [field]: value,
                          slug:
                              field === 'value' && item.slug === ''
                                  ? slugify(String(value))
                                  : item.slug,
                      }
                    : item,
            ),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.put(AttributeController.update.url(attribute.id), data, {
            onError: (nextErrors) => setErrors(nextErrors),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Attribute" />

            <Wrapper>
                <PageHeader
                    title={__('page.edit_attribute', 'Edit Attribute')}
                    description={`Update details for ${attribute.name}`}
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

                <form
                    id={formId}
                    onSubmit={handleSubmit}
                    className="max-w-3xl space-y-6"
                >
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                {__('label.name', 'Name')}
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(event) =>
                                    setData((prev) => ({
                                        ...prev,
                                        name: event.target.value,
                                    }))
                                }
                                required
                                autoFocus
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="slug">
                                {__('label.slug', 'Slug')}
                            </Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(event) =>
                                    setData((prev) => ({
                                        ...prev,
                                        slug: slugify(event.target.value),
                                    }))
                                }
                                required
                            />
                            <InputError message={errors.slug} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">
                                {__('label.type', 'Type')}
                            </Label>
                            <select
                                id="type"
                                value={data.type}
                                onChange={(event) =>
                                    setData((prev) => ({
                                        ...prev,
                                        type: event.target
                                            .value as AttributeData['type'],
                                        values: [
                                            'select',
                                            'multiselect',
                                            'color',
                                        ].includes(event.target.value)
                                            ? prev.values
                                            : [],
                                    }))
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {ATTRIBUTE_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                                id="unit"
                                value={data.unit ?? ''}
                                onChange={(event) =>
                                    setData((prev) => ({
                                        ...prev,
                                        unit: event.target.value,
                                    }))
                                }
                            />
                            <InputError message={errors.unit} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                type="number"
                                min={0}
                                value={data.position}
                                onChange={(event) =>
                                    setData((prev) => ({
                                        ...prev,
                                        position: Number(
                                            event.target.value || 0,
                                        ),
                                    }))
                                }
                            />
                            <InputError message={errors.position} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_filterable"
                                checked={data.is_filterable}
                                onChange={(event) =>
                                    setData((prev) => ({
                                        ...prev,
                                        is_filterable: event.target.checked,
                                    }))
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
                                checked={data.is_variant_selection}
                                onChange={(event) =>
                                    setData((prev) => ({
                                        ...prev,
                                        is_variant_selection:
                                            event.target.checked,
                                    }))
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

                    {supportsValues ? (
                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-medium">
                                        Attribute values
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Existing values are updated in place to
                                        preserve variant compatibility. Release
                                        1 does not remove persisted values from
                                        this screen.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setData((prev) => ({
                                            ...prev,
                                            values: [
                                                ...prev.values,
                                                emptyValue(prev.values.length),
                                            ],
                                        }))
                                    }
                                >
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add value
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {data.values.map((value, index) => (
                                    <div
                                        key={value.id ?? `value-${index}`}
                                        className="grid gap-4 rounded-md border p-4 md:grid-cols-12"
                                    >
                                        <div className="grid gap-2 md:col-span-4">
                                            <Label>Value</Label>
                                            <Input
                                                value={value.value}
                                                onChange={(event) =>
                                                    updateValue(
                                                        index,
                                                        'value',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `values.${index}.value`
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2 md:col-span-3">
                                            <Label>Slug</Label>
                                            <Input
                                                value={value.slug}
                                                onChange={(event) =>
                                                    updateValue(
                                                        index,
                                                        'slug',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `values.${index}.slug`
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label>Position</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={value.position}
                                                onChange={(event) =>
                                                    updateValue(
                                                        index,
                                                        'position',
                                                        Number(
                                                            event.target
                                                                .value || 0,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>

                                        {data.type === 'color' ? (
                                            <div className="grid gap-2 md:col-span-2">
                                                <Label>Color hex</Label>
                                                <Input
                                                    value={
                                                        value.color_hex ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        updateValue(
                                                            index,
                                                            'color_hex',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="#ffffff"
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `values.${index}.color_hex`
                                                        ]
                                                    }
                                                />
                                            </div>
                                        ) : null}

                                        <div className="flex items-end md:col-span-1">
                                            {value.id === undefined ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            values: prev.values.filter(
                                                                (
                                                                    _item,
                                                                    currentIndex,
                                                                ) =>
                                                                    currentIndex !==
                                                                    index,
                                                            ),
                                                        }))
                                                    }
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <StickyFormActions
                        formId={formId}
                        processing={processing}
                        submitLabel={__('action.save_changes', 'Save Changes')}
                    />
                </form>
            </Wrapper>
        </AppLayout>
    );
}
