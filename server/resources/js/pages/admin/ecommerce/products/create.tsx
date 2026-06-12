import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    ImageIcon,
    Search,
    Settings,
    SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as ProductController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductController';
import InputError from '@/components/input-error';
import {
    MediaPickerModal,
    type MediaItem,
    type SelectedImage,
} from '@/components/media-picker-modal';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalizedField } from '@/components/ui/localized-field';
import { SlugField } from '@/components/ui/slug-field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';
import { CoreAttributesSection } from './core-attributes-section';
import {
    alignAttributeValuesToSchema,
    getCategoryAttributeSchema,
} from './core-attributes.utils';
import type {
    Brand,
    Category,
    FormData,
    FormErrors,
    ProductFlag,
    ProductType,
    TabKey,
} from './create.types';

const formId = 'product-create-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: ProductController.index.url() },
    { title: 'Create Product', href: ProductController.create.url() },
];

const defaultFormData = (defaultLocale: string): FormData => ({
    name: { [defaultLocale]: '' },
    slug: { [defaultLocale]: '' },
    description: { [defaultLocale]: '' },
    short_description: { [defaultLocale]: '' },
    sku_prefix: '',
    category_id: null,
    product_type_id: null,
    brand_id: null,
    is_active: true,
    is_saleable: true,
    is_search_promoted: false,
    is_featured: false,
    seo_title: '',
    seo_description: '',
    flags: [],
    attribute_values: [],
    variant: {
        sku: '',
        name: '',
        price: '',
        cost_price: '',
        compare_at_price: '',
        weight: '',
        stock_quantity: '',
        stock_threshold: '5',
        is_active: true,
    },
    categories: [],
});

const tabFieldMap: Record<TabKey, string[]> = {
    general: [
        'name',
        'slug',
        'description',
        'short_description',
        'sku_prefix',
        'category_id',
        'product_type_id',
        'brand_id',
        'flags',
        'is_active',
        'is_saleable',
        'is_search_promoted',
        'is_featured',
    ],
    core_attributes: ['attribute_values'],
    pricing: [
        'variant',
        'variant.sku',
        'variant.name',
        'variant.price',
        'variant.cost_price',
        'variant.compare_at_price',
        'variant.stock_quantity',
        'variant.stock_threshold',
        'variant.is_active',
    ],
    media: ['images'],
    metadata: ['seo_title', 'seo_description'],
};

function tabForErrors(errors: FormErrors): TabKey {
    const entries = Object.keys(errors);

    for (const tab of [
        'general',
        'core_attributes',
        'pricing',
        'media',
        'metadata',
    ] as TabKey[]) {
        if (
            entries.some((field) =>
                tabFieldMap[tab].some(
                    (prefix) =>
                        field === prefix || field.startsWith(`${prefix}.`),
                ),
            )
        ) {
            return tab;
        }
    }

    return 'general';
}

function errorCountForTab(errors: FormErrors, tab: TabKey): number {
    return Object.keys(errors).filter((field) =>
        tabFieldMap[tab].some(
            (prefix) => field === prefix || field.startsWith(`${prefix}.`),
        ),
    ).length;
}

export default function Create({
    categories: categoriesList,
    types,
    brands,
    flags,
}: {
    categories: Category[];
    types: ProductType[];
    brands: Brand[];
    flags: ProductFlag[];
}) {
    const { locales } = usePage().props as { locales: SharedLocale[] };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';
    const [activeTab, setActiveTab] = useState('general');
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
    const [formData, setFormData] = useState<FormData>(
        defaultFormData(locales.find((l) => l.is_default)?.code ?? 'en'),
    );
    const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

    const handleNameChange = (value: Record<string, string>) => {
        setFormData((prev) => ({
            ...prev,
            name: value,
            slug: autoGenerateSlug
                ? Object.keys(value).reduce(
                      (acc, locale) => {
                          acc[locale] = slugify(value[locale] || '');
                          return acc;
                      },
                      {} as Record<string, string>,
                  )
                : prev.slug,
        }));
    };

    const handleSlugChange = (value: Record<string, string>) => {
        setFormData((prev) => ({ ...prev, slug: value }));
    };

    const handleFormChange = <
        K extends keyof Omit<
            FormData,
            'name' | 'slug' | 'description' | 'short_description'
        >,
    >(
        field: K,
        value: FormData[K],
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleVariantChange = (
        field: keyof FormData['variant'],
        value: string | boolean,
    ) => {
        setFormData((prev) => ({
            ...prev,
            variant: { ...prev.variant, [field]: value },
        }));
    };

    const handleMediaSelect = (media: MediaItem) => {
        const newImage = {
            id: media.id,
            url: media.url,
            name: media.name,
            is_thumbnail: selectedImages.length === 0,
        };
        setSelectedImages([...selectedImages, newImage]);
    };

    const handleMediaReorder = (images: SelectedImage[]) => {
        setSelectedImages(images);
    };

    const handleMediaRemove = (id: number) => {
        const filtered = selectedImages
            .filter((img) => img.id !== id)
            .map((img, index) => ({
                ...img,
                is_thumbnail: index === 0,
            }));
        setSelectedImages(filtered);
    };

    const handleMediaSetThumbnail = (id: number) => {
        const updated = selectedImages.map((img) => ({
            ...img,
            is_thumbnail: img.id === id,
        }));
        setSelectedImages(updated);
    };

    const categoryOptions = categoriesList.map((c) => ({
        value: c.id,
        label: resolveLocalizedText(c.name, defaultLocale),
    }));

    const typeOptions = types.map((t) => ({
        value: t.id,
        label: t.name,
    }));
    const brandOptions = brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
    }));

    const toggleFlag = (flagId: number, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            flags: checked
                ? [...prev.flags, flagId]
                : prev.flags.filter((id) => id !== flagId),
        }));
    };

    const selectedSchema = getCategoryAttributeSchema(
        categoriesList,
        formData.category_id,
    );

    const handleCategoryChange = (categoryId: string | null) => {
        const nextSchema = getCategoryAttributeSchema(categoriesList, categoryId);

        setFormData((prev) => ({
            ...prev,
            category_id: categoryId,
            attribute_values: alignAttributeValuesToSchema(
                nextSchema,
                prev.attribute_values,
            ),
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />

            <Wrapper>
                <PageHeader
                    title="Create Product"
                    description="Create a new product"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={ProductController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Products
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={ProductController.store.url()}
                    method="post"
                    id={formId}
                    className="space-y-6"
                    onError={(errors) => {
                        setActiveTab(tabForErrors(errors as FormErrors));
                        toast.error(
                            'Formularz zawiera błędy. Sprawdź zaznaczoną zakładkę.',
                        );
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            {(() => {
                                const generalErrors = errorCountForTab(
                                    errors as FormErrors,
                                    'general',
                                );
                                const pricingErrors = errorCountForTab(
                                    errors as FormErrors,
                                    'pricing',
                                );
                                const coreAttributeErrors = errorCountForTab(
                                    errors as FormErrors,
                                    'core_attributes',
                                );
                                const mediaErrors = errorCountForTab(
                                    errors as FormErrors,
                                    'media',
                                );
                                const metadataErrors = errorCountForTab(
                                    errors as FormErrors,
                                    'metadata',
                                );

                                return (
                                    <Tabs
                                        value={activeTab}
                                        onValueChange={setActiveTab}
                                    >
                                        <TabsList className="flex w-full min-w-0 flex-nowrap gap-1 p-1">
                                            <TabsTrigger
                                                value="general"
                                                className="min-w-[8.5rem] flex-none"
                                            >
                                                <Settings className="mr-2 h-4 w-4" />
                                                General
                                                {generalErrors > 0 && (
                                                    <span className="ml-2 rounded bg-destructive px-1.5 text-xs text-destructive-foreground">
                                                        {generalErrors}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="core_attributes"
                                                className="min-w-[10rem] flex-none"
                                            >
                                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                                Core Attributes
                                                {coreAttributeErrors > 0 && (
                                                    <span className="ml-2 rounded bg-destructive px-1.5 text-xs text-destructive-foreground">
                                                        {coreAttributeErrors}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="pricing"
                                                className="min-w-[10.5rem] flex-none"
                                            >
                                                <Settings className="mr-2 h-4 w-4" />
                                                Pricing & Stock
                                                {pricingErrors > 0 && (
                                                    <span className="ml-2 rounded bg-destructive px-1.5 text-xs text-destructive-foreground">
                                                        {pricingErrors}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="media"
                                                className="min-w-[8rem] flex-none"
                                            >
                                                <ImageIcon className="mr-2 h-4 w-4" />
                                                Media
                                                {mediaErrors > 0 && (
                                                    <span className="ml-2 rounded bg-destructive px-1.5 text-xs text-destructive-foreground">
                                                        {mediaErrors}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="metadata"
                                                className="min-w-[7rem] flex-none"
                                            >
                                                <Search className="mr-2 h-4 w-4" />
                                                SEO
                                                {metadataErrors > 0 && (
                                                    <span className="ml-2 rounded bg-destructive px-1.5 text-xs text-destructive-foreground">
                                                        {metadataErrors}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent
                                            value="general"
                                            forceRender
                                            className="mt-6 space-y-6"
                                        >
                                            <div className="space-y-6 rounded-xl border bg-card p-6">
                                                <LocalizedField
                                                    label="Name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleNameChange}
                                                    errors={
                                                        errors as Record<
                                                            string,
                                                            string
                                                        >
                                                    }
                                                    required
                                                    placeholder="Product name"
                                                />

                                                <SlugField
                                                    label="Slug"
                                                    name="slug"
                                                    value={formData.slug}
                                                    onChange={handleSlugChange}
                                                    autoGenerate={
                                                        autoGenerateSlug
                                                    }
                                                    onAutoGenerateChange={(
                                                        auto,
                                                    ) => {
                                                        setAutoGenerateSlug(
                                                            auto,
                                                        );
                                                        if (auto) {
                                                            setFormData(
                                                                (prev) => {
                                                                    const updated =
                                                                        {
                                                                            ...prev.slug,
                                                                        };
                                                                    locales.forEach(
                                                                        (l) => {
                                                                            updated[
                                                                                l.code
                                                                            ] =
                                                                                slugify(
                                                                                    prev
                                                                                        .name[
                                                                                        l
                                                                                            .code
                                                                                    ] ??
                                                                                        '',
                                                                                );
                                                                        },
                                                                    );
                                                                    return {
                                                                        ...prev,
                                                                        slug: updated,
                                                                    };
                                                                },
                                                            );
                                                        }
                                                    }}
                                                    locales={locales}
                                                    errors={
                                                        errors as Record<
                                                            string,
                                                            string
                                                        >
                                                    }
                                                    required
                                                />

                                                <div className="grid gap-2">
                                                    <Label htmlFor="sku_prefix">
                                                        SKU Prefix
                                                    </Label>
                                                    <Input
                                                        id="sku_prefix"
                                                        name="sku_prefix"
                                                        placeholder="e.g. SKU-"
                                                        defaultValue={
                                                            formData.sku_prefix
                                                        }
                                                        onChange={(e) =>
                                                            handleFormChange(
                                                                'sku_prefix',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.sku_prefix
                                                        }
                                                    />
                                                </div>

                                                <LocalizedField
                                                    label="Short Description"
                                                    name="short_description"
                                                    type="textarea"
                                                    value={
                                                        formData.short_description
                                                    }
                                                    onChange={(val) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            short_description:
                                                                val,
                                                        }))
                                                    }
                                                    placeholder="Brief product summary"
                                                    rows={2}
                                                    errors={
                                                        errors as Record<
                                                            string,
                                                            string
                                                        >
                                                    }
                                                    localeSwitcherClassName="sm:justify-end"
                                                />

                                                <LocalizedField
                                                    label="Description"
                                                    name="description"
                                                    type="richtext"
                                                    value={formData.description}
                                                    onChange={(val) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            description: val,
                                                        }))
                                                    }
                                                    placeholder="Product description..."
                                                    errors={
                                                        errors as Record<
                                                            string,
                                                            string
                                                        >
                                                    }
                                                    localeSwitcherClassName="sm:justify-end"
                                                />

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="category_id">
                                                            Category *
                                                        </Label>
                                                        <Combobox
                                                            items={
                                                                categoryOptions
                                                            }
                                                            value={
                                                                categoryOptions.find(
                                                                    (item) =>
                                                                        item.value.toString() ===
                                                                        formData.category_id?.toString(),
                                                                ) ?? null
                                                            }
                                                            onValueChange={(
                                                                item: {
                                                                    value: number;
                                                                    label: string;
                                                                } | null,
                                                            ) =>
                                                                handleCategoryChange(
                                                                    item?.value.toString() ??
                                                                        null,
                                                                )
                                                            }
                                                            itemToStringValue={(
                                                                item,
                                                            ) =>
                                                                item?.label ??
                                                                ''
                                                            }
                                                        >
                                                            <ComboboxInput placeholder="Select category..." />
                                                            <ComboboxContent>
                                                                <ComboboxEmpty>
                                                                    No
                                                                    categories
                                                                    found.
                                                                </ComboboxEmpty>
                                                                <ComboboxList>
                                                                    {(
                                                                        category,
                                                                    ) => (
                                                                        <ComboboxItem
                                                                            key={
                                                                                category.value
                                                                            }
                                                                            value={
                                                                                category
                                                                            }
                                                                        >
                                                                            {
                                                                                category.label
                                                                            }
                                                                        </ComboboxItem>
                                                                    )}
                                                                </ComboboxList>
                                                            </ComboboxContent>
                                                        </Combobox>
                                                        <input
                                                            type="hidden"
                                                            name="category_id"
                                                            value={
                                                                formData.category_id ??
                                                                ''
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="product_type_id">
                                                            Product Type *
                                                        </Label>
                                                        <Combobox
                                                            items={typeOptions}
                                                            value={
                                                                typeOptions.find(
                                                                    (item) =>
                                                                        item.value.toString() ===
                                                                        formData.product_type_id?.toString(),
                                                                ) ?? null
                                                            }
                                                            onValueChange={(
                                                                item: {
                                                                    value: number;
                                                                    label: string;
                                                                } | null,
                                                            ) =>
                                                                handleFormChange(
                                                                    'product_type_id',
                                                                    item?.value.toString() ??
                                                                        null,
                                                                )
                                                            }
                                                            itemToStringValue={(
                                                                item,
                                                            ) =>
                                                                item?.label ??
                                                                ''
                                                            }
                                                        >
                                                            <ComboboxInput placeholder="Select type..." />
                                                            <ComboboxContent>
                                                                <ComboboxEmpty>
                                                                    No types
                                                                    found.
                                                                </ComboboxEmpty>
                                                                <ComboboxList>
                                                                    {(type) => (
                                                                        <ComboboxItem
                                                                            key={
                                                                                type.value
                                                                            }
                                                                            value={
                                                                                type
                                                                            }
                                                                        >
                                                                            {
                                                                                type.label
                                                                            }
                                                                        </ComboboxItem>
                                                                    )}
                                                                </ComboboxList>
                                                            </ComboboxContent>
                                                        </Combobox>
                                                        <input
                                                            type="hidden"
                                                            name="product_type_id"
                                                            value={
                                                                formData.product_type_id ??
                                                                ''
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="brand_id">
                                                        Brand
                                                    </Label>
                                                    <select
                                                        id="brand_id"
                                                        name="brand_id"
                                                        value={
                                                            formData.brand_id ??
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            handleFormChange(
                                                                'brand_id',
                                                                e.target
                                                                    .value ||
                                                                    null,
                                                            )
                                                        }
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                                    >
                                                        <option value="">
                                                            No brand
                                                        </option>
                                                        {brandOptions.map(
                                                            (brand) => (
                                                                <option
                                                                    key={
                                                                        brand.value
                                                                    }
                                                                    value={
                                                                        brand.value
                                                                    }
                                                                >
                                                                    {
                                                                        brand.label
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <InputError
                                                        message={
                                                            errors.brand_id
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-3">
                                                    <Label>Product Flags</Label>
                                                    <input
                                                        type="hidden"
                                                        name="flags[]"
                                                        value=""
                                                    />
                                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                        {flags.map((flag) => (
                                                            <label
                                                                key={flag.id}
                                                                className="flex items-center gap-2 rounded-md border px-3 py-2"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    name="flags[]"
                                                                    value={
                                                                        flag.id
                                                                    }
                                                                    checked={formData.flags.includes(
                                                                        flag.id,
                                                                    )}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        toggleFlag(
                                                                            flag.id,
                                                                            e
                                                                                .target
                                                                                .checked,
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 rounded border-input"
                                                                />
                                                                <span
                                                                    className="inline-block h-2.5 w-2.5 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            flag.color,
                                                                    }}
                                                                />
                                                                <span className="text-sm">
                                                                    {flag.name}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <InputError
                                                        message={errors.flags}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="hidden"
                                                            name="is_active"
                                                            value="0"
                                                        />
                                                        <input
                                                            type="checkbox"
                                                            id="is_active"
                                                            name="is_active"
                                                            value="1"
                                                            checked={
                                                                formData.is_active
                                                            }
                                                            onChange={(e) =>
                                                                handleFormChange(
                                                                    'is_active',
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-input"
                                                        />
                                                        <Label
                                                            htmlFor="is_active"
                                                            className="font-normal"
                                                        >
                                                            Active
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="hidden"
                                                            name="is_saleable"
                                                            value="0"
                                                        />
                                                        <input
                                                            type="checkbox"
                                                            id="is_saleable"
                                                            name="is_saleable"
                                                            value="1"
                                                            checked={
                                                                formData.is_saleable
                                                            }
                                                            onChange={(e) =>
                                                                handleFormChange(
                                                                    'is_saleable',
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-input"
                                                        />
                                                        <Label
                                                            htmlFor="is_saleable"
                                                            className="font-normal"
                                                        >
                                                            Available for sale
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="hidden"
                                                            name="is_search_promoted"
                                                            value="0"
                                                        />
                                                        <input
                                                            type="checkbox"
                                                            id="is_search_promoted"
                                                            name="is_search_promoted"
                                                            value="1"
                                                            checked={
                                                                formData.is_search_promoted
                                                            }
                                                            onChange={(e) =>
                                                                handleFormChange(
                                                                    'is_search_promoted',
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-input"
                                                        />
                                                        <Label
                                                            htmlFor="is_search_promoted"
                                                            className="font-normal"
                                                        >
                                                            Promoted in Search
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="hidden"
                                                            name="is_featured"
                                                            value="0"
                                                        />
                                                        <input
                                                            type="checkbox"
                                                            id="is_featured"
                                                            name="is_featured"
                                                            value="1"
                                                            checked={
                                                                formData.is_featured
                                                            }
                                                            onChange={(e) =>
                                                                handleFormChange(
                                                                    'is_featured',
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-input"
                                                        />
                                                        <Label
                                                            htmlFor="is_featured"
                                                            className="font-normal"
                                                        >
                                                            Featured Product
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="core_attributes"
                                            forceRender
                                            className="mt-6 space-y-6"
                                        >
                                            <CoreAttributesSection
                                                schema={selectedSchema}
                                                values={formData.attribute_values}
                                                errors={errors as FormErrors}
                                                onChange={(attributeValues) =>
                                                    handleFormChange(
                                                        'attribute_values',
                                                        attributeValues,
                                                    )
                                                }
                                            />
                                        </TabsContent>

                                        <TabsContent
                                            value="pricing"
                                            forceRender
                                            className="mt-6 space-y-6"
                                        >
                                            <div className="space-y-6 rounded-xl border bg-card p-6">
                                                <h3 className="text-lg font-semibold">
                                                    Default Variant
                                                </h3>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="variant.sku">
                                                            SKU *
                                                        </Label>
                                                        <Input
                                                            id="variant.sku"
                                                            name="variant[sku]"
                                                            required
                                                            placeholder="SKU-001"
                                                            defaultValue={
                                                                formData.variant
                                                                    .sku
                                                            }
                                                            onChange={(e) =>
                                                                handleVariantChange(
                                                                    'sku',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    'variant.sku'
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="variant.name">
                                                            Variant Name
                                                        </Label>
                                                        <Input
                                                            id="variant.name"
                                                            name="variant[name]"
                                                            placeholder="Default"
                                                            defaultValue={
                                                                formData.variant
                                                                    .name
                                                            }
                                                            onChange={(e) =>
                                                                handleVariantChange(
                                                                    'name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="variant.price">
                                                            Price (in PLN) *
                                                        </Label>
                                                        <Input
                                                            id="variant.price"
                                                            name="variant[price]"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            required
                                                            placeholder="99.99"
                                                            defaultValue={
                                                                formData.variant
                                                                    .price
                                                            }
                                                            onChange={(e) =>
                                                                handleVariantChange(
                                                                    'price',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    'variant.price'
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="variant.cost_price">
                                                            Cost Price
                                                        </Label>
                                                        <Input
                                                            id="variant.cost_price"
                                                            name="variant[cost_price]"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="0.00"
                                                            defaultValue={
                                                                formData.variant
                                                                    .cost_price
                                                            }
                                                            onChange={(e) =>
                                                                handleVariantChange(
                                                                    'cost_price',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="variant.stock_quantity">
                                                            Stock Quantity
                                                        </Label>
                                                        <Input
                                                            id="variant.stock_quantity"
                                                            name="variant[stock_quantity]"
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            defaultValue={
                                                                formData.variant
                                                                    .stock_quantity
                                                            }
                                                            onChange={(e) =>
                                                                handleVariantChange(
                                                                    'stock_quantity',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="variant.stock_threshold">
                                                            Low Stock Threshold
                                                        </Label>
                                                        <Input
                                                            id="variant.stock_threshold"
                                                            name="variant[stock_threshold]"
                                                            type="number"
                                                            min="0"
                                                            placeholder="5"
                                                            defaultValue={
                                                                formData.variant
                                                                    .stock_threshold
                                                            }
                                                            onChange={(e) =>
                                                                handleVariantChange(
                                                                    'stock_threshold',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="hidden"
                                                        name="variant[is_active]"
                                                        value="0"
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        id="variant.is_active"
                                                        name="variant[is_active]"
                                                        value="1"
                                                        checked={
                                                            formData.variant
                                                                .is_active
                                                        }
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                'is_active',
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-input"
                                                    />
                                                    <Label
                                                        htmlFor="variant.is_active"
                                                        className="font-normal"
                                                    >
                                                        Variant is active
                                                    </Label>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="media"
                                            forceRender
                                            className="mt-6"
                                        >
                                            <div className="space-y-4 rounded-xl border bg-card p-6">
                                                <div
                                                    className="cursor-pointer rounded-lg border border-dashed p-4 transition-colors hover:bg-muted/50"
                                                    onClick={() =>
                                                        setShowMediaPicker(true)
                                                    }
                                                >
                                                    {selectedImages.length ===
                                                    0 ? (
                                                        <div className="py-8 text-center">
                                                            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                                            <h3 className="mt-2 text-sm font-semibold">
                                                                Product Images
                                                            </h3>
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                Click to select
                                                                images from
                                                                library
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <span className="text-sm font-medium">
                                                                {
                                                                    selectedImages.length
                                                                }{' '}
                                                                image(s)
                                                                selected
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                (click to add
                                                                more)
                                                            </span>
                                                        </div>
                                                    )}

                                                    {selectedImages.length >
                                                        0 && (
                                                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                                                            {selectedImages.map(
                                                                (image) => (
                                                                    <div
                                                                        key={
                                                                            image.id
                                                                        }
                                                                        className="group relative aspect-square overflow-hidden rounded-lg border"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                image.url
                                                                            }
                                                                            alt={
                                                                                image.name
                                                                            }
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                        {image.is_thumbnail && (
                                                                            <span className="absolute top-1 left-1 rounded bg-primary px-1 text-xs text-primary-foreground">
                                                                                Thumbnail
                                                                            </span>
                                                                        )}
                                                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                                            <button
                                                                                type="button"
                                                                                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
                                                                                onClick={(
                                                                                    e,
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    handleMediaSetThumbnail(
                                                                                        image.id,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    className="h-4 w-4"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="2"
                                                                                >
                                                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="rounded-full bg-white/20 p-2 text-white hover:bg-red-500"
                                                                                onClick={(
                                                                                    e,
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    handleMediaRemove(
                                                                                        image.id,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    className="h-4 w-4"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="2"
                                                                                >
                                                                                    <line
                                                                                        x1="18"
                                                                                        y1="6"
                                                                                        x2="6"
                                                                                        y2="18"
                                                                                    />
                                                                                    <line
                                                                                        x1="6"
                                                                                        y1="6"
                                                                                        x2="18"
                                                                                        y2="18"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {selectedImages.map(
                                                    (image, index) => (
                                                        <input
                                                            key={image.id}
                                                            type="hidden"
                                                            name={`images[${index}][media_id]`}
                                                            value={image.id}
                                                        />
                                                    ),
                                                )}
                                                {selectedImages.map(
                                                    (image, index) => (
                                                        <input
                                                            key={`thumb-${image.id}`}
                                                            type="hidden"
                                                            name={`images[${index}][is_thumbnail]`}
                                                            value={
                                                                image.is_thumbnail
                                                                    ? '1'
                                                                    : '0'
                                                            }
                                                        />
                                                    ),
                                                )}
                                                {selectedImages.map(
                                                    (_, index) => (
                                                        <input
                                                            key={`pos-${index}`}
                                                            type="hidden"
                                                            name={`images[${index}][position]`}
                                                            value={index}
                                                        />
                                                    ),
                                                )}
                                                <InputError
                                                    message={
                                                        errors.images ||
                                                        errors[
                                                            'images.0.media_id'
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="metadata"
                                            forceRender
                                            className="mt-6"
                                        >
                                            <div className="space-y-6 rounded-xl border bg-card p-6">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="seo_title">
                                                        SEO Title
                                                    </Label>
                                                    <Input
                                                        id="seo_title"
                                                        name="seo_title"
                                                        placeholder="SEO title"
                                                        defaultValue={
                                                            formData.seo_title
                                                        }
                                                        onChange={(e) =>
                                                            handleFormChange(
                                                                'seo_title',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.seo_title
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="seo_description">
                                                        SEO Description
                                                    </Label>
                                                    <textarea
                                                        id="seo_description"
                                                        name="seo_description"
                                                        rows={3}
                                                        placeholder="SEO description"
                                                        defaultValue={
                                                            formData.seo_description
                                                        }
                                                        onChange={(e) =>
                                                            handleFormChange(
                                                                'seo_description',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.seo_description
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                );
                            })()}

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel="Create Product"
                                secondaryActions={
                                    <Button asChild variant="outline">
                                        <Link
                                            href={ProductController.index.url()}
                                            prefetch
                                            cacheFor={30}
                                        >
                                            Cancel
                                        </Link>
                                    </Button>
                                }
                            />
                        </>
                    )}
                </Form>
            </Wrapper>

            <MediaPickerModal
                open={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={handleMediaSelect}
                onReorder={handleMediaReorder}
                onRemove={handleMediaRemove}
                onSetThumbnail={handleMediaSetThumbnail}
                selectedImages={selectedImages}
                mode="gallery"
                multiple
            />
        </AppLayout>
    );
}
