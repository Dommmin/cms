import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    Clock,
    ExternalLink,
    EyeIcon,
    ImageIcon,
    Search,
    Settings,
    SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as ProductController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductController';
import * as ProductVariantController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductVariantController';
import PreviewController from '@/actions/App/Http/Controllers/Admin/PreviewController';
import InputError from '@/components/input-error';
import {
    MediaPickerModal,
    type MediaItem,
    type SelectedImage,
} from '@/components/media-picker-modal';
import MetafieldEditor from '@/components/metafield-editor';
import {
    PageHeader,
    PageHeaderActions,
    PageHeaderOverflowMenu,
} from '@/components/page-header';
import { SeoPanel } from '@/components/seo-panel';
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
import { VersionHistory } from '@/components/version-history';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import { slugify } from '@/lib/slug';
import { formatDateTime } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';
import { CoreAttributesSection } from './core-attributes-section';
import {
    alignAttributeValuesToSchema,
    getCategoryAttributeSchema,
} from './core-attributes.utils';
import type {
    EditProps,
    FormData,
    FormErrors,
    ProductVariant,
    TabKey,
} from './edit.types';

const defaultVariant: ProductVariant = {
    sku: '',
    name: '',
    price: 0,
    cost_price: 0,
    compare_at_price: undefined,
    weight: 0,
    stock_quantity: 0,
    stock_threshold: 5,
    is_active: true,
    is_default: true,
    position: 0,
};

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
    metadata: [
        'seo_title',
        'seo_description',
        'meta_robots',
        'og_image',
        'sitemap_exclude',
    ],
    price_history: [],
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

function formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('pl-PL', {
        style: 'currency',
        currency: 'PLN',
    });
}

const formId = 'product-edit-form';

export default function Edit({
    categories: categoriesList,
    types,
    brands,
    flags,
    product,
    price_history,
    metafield_definitions,
}: EditProps) {
    const { frontendUrl, locales } = usePage().props as {
        frontendUrl: string;
        locales: SharedLocale[];
    };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';
    const [activeTab, setActiveTab] = useState('general');
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(
        (product.images ?? []).map((img) => ({
            id: img.media_id,
            url: img.url,
            name: img.name,
            is_thumbnail: img.is_thumbnail,
        })),
    );
    const handleMetafieldsChange = (metafields: FormData['metafields']) => {
        setFormData((prev) => ({ ...prev, metafields }));
    };

    const [formData, setFormData] = useState<FormData>({
        name: product.name ?? { [defaultLocale]: '' },
        slug: product.slug ?? { [defaultLocale]: '' },
        description: product.description ?? { [defaultLocale]: '' },
        short_description: product.short_description ?? { [defaultLocale]: '' },
        sku_prefix: product.sku_prefix ?? '',
        category_id: product.category_id,
        product_type_id: product.product_type_id,
        brand_id: product.brand_id ?? null,
        is_active: product.is_active,
        is_saleable: product.is_saleable,
        is_search_promoted: product.is_search_promoted ?? false,
        is_featured: product.is_featured ?? false,
        seo_title: product.seo_title ?? '',
        seo_description: product.seo_description ?? '',
        meta_robots: product.meta_robots ?? 'index, follow',
        og_image: product.og_image ?? null,
        sitemap_exclude: product.sitemap_exclude ?? false,
        flags: product.flag_ids ?? [],
        attribute_values: alignAttributeValuesToSchema(
            getCategoryAttributeSchema(categoriesList, product.category_id),
            product.attribute_values ?? [],
        ),
        metafields: product.metafields ?? [],
        variant: product.variant
            ? {
                  id: product.variant.id,
                  sku: product.variant.sku,
                  name: product.variant.name,
                  price: product.variant.price,
                  cost_price: product.variant.cost_price,
                  compare_at_price: product.variant.compare_at_price,
                  weight: product.variant.weight,
                  stock_quantity: product.variant.stock_quantity,
                  stock_threshold: product.variant.stock_threshold,
                  is_active: product.variant.is_active,
                  is_default: product.variant.is_default,
                  position: product.variant.position,
              }
            : { ...defaultVariant },
        categories: product.categories?.map((c) => c.id) ?? [],
    });

    const [autoGenerateSlug, setAutoGenerateSlug] = useState(
        locales.every((l) => {
            const src = product.name?.[l.code] ?? '';
            const sl = (product.slug ?? {})[l.code] ?? '';
            return src === '' || sl === slugify(src);
        }),
    );

    const handleNameChange = (value: Record<string, string>) => {
        setFormData((prev) => ({
            ...prev,
            name: value,
            slug: autoGenerateSlug
                ? Object.keys(value).reduce(
                      (acc, locale) => ({
                          ...acc,
                          [locale]: slugify(value[locale] || ''),
                      }),
                      {},
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
        value: string | number | boolean | undefined,
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
        const nextSchema = getCategoryAttributeSchema(
            categoriesList,
            categoryId,
        );

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
            <Head title="Edit Product" />

            <Wrapper>
                <PageHeader
                    title="Edit Product"
                    description={`Update details for ${product.name?.[defaultLocale] ?? ''}`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={ProductController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Back to Products
                                </span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                        </Button>

                        <div className="hidden items-center gap-2 sm:flex">
                            <Button variant="outline" asChild>
                                <a
                                    href={`${frontendUrl}/products/${product.slug?.[defaultLocale] ?? ''}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View on Site
                                </a>
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={PreviewController.url({
                                        query: {
                                            url: `${frontendUrl}/products/${product.slug?.[defaultLocale] ?? ''}`,
                                            entity_type: 'product',
                                            entity_id: String(product.id),
                                            entity_name:
                                                product.name?.[defaultLocale] ??
                                                product.slug?.[defaultLocale] ??
                                                '',
                                            admin_url:
                                                ProductController.edit.url(
                                                    product.id,
                                                ),
                                        },
                                    })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <EyeIcon className="mr-2 h-4 w-4" />
                                    Preview
                                </a>
                            </Button>
                            <Button asChild variant="outline">
                                <Link
                                    href={ProductVariantController.index.url(
                                        product.id,
                                    )}
                                    prefetch
                                    cacheFor={30}
                                >
                                    Manage Variants
                                </Link>
                            </Button>
                        </div>

                        <div className="sm:hidden">
                            <PageHeaderOverflowMenu>
                                <Button
                                    variant="outline"
                                    asChild
                                    className="w-full justify-start"
                                >
                                    <a
                                        href={`${frontendUrl}/products/${product.slug?.[defaultLocale] ?? ''}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View on Site
                                    </a>
                                </Button>
                                <Button
                                    variant="outline"
                                    asChild
                                    className="w-full justify-start"
                                >
                                    <a
                                        href={PreviewController.url({
                                            query: {
                                                url: `${frontendUrl}/products/${product.slug?.[defaultLocale] ?? ''}`,
                                                entity_type: 'product',
                                                entity_id: String(product.id),
                                                entity_name:
                                                    product.name?.[
                                                        defaultLocale
                                                    ] ??
                                                    product.slug?.[
                                                        defaultLocale
                                                    ] ??
                                                    '',
                                                admin_url:
                                                    ProductController.edit.url(
                                                        product.id,
                                                    ),
                                            },
                                        })}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <EyeIcon className="mr-2 h-4 w-4" />
                                        Preview
                                    </a>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <Link
                                        href={ProductVariantController.index.url(
                                            product.id,
                                        )}
                                        prefetch
                                        cacheFor={30}
                                    >
                                        Manage Variants
                                    </Link>
                                </Button>
                            </PageHeaderOverflowMenu>
                        </div>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={ProductController.update.url(product.id)}
                    method="put"
                    id={formId}
                    className="space-y-6"
                    onError={(errors) => {
                        setActiveTab(tabForErrors(errors as FormErrors));
                        toast.error(
                            'The form contains errors. Check the highlighted tab.',
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
                                        <TabsList className="flex h-auto w-full snap-x scrollbar-none justify-start overflow-x-auto bg-muted p-1 sm:grid sm:grid-cols-6">
                                            <TabsTrigger
                                                value="general"
                                                className="snap-align-start shrink-0"
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
                                                className="snap-align-start shrink-0"
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
                                                className="snap-align-start shrink-0"
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
                                                className="snap-align-start shrink-0"
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
                                                className="snap-align-start shrink-0"
                                            >
                                                <Search className="mr-2 h-4 w-4" />
                                                SEO
                                                {metadataErrors > 0 && (
                                                    <span className="ml-2 rounded bg-destructive px-1.5 text-xs text-destructive-foreground">
                                                        {metadataErrors}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="price_history"
                                                className="snap-align-start shrink-0"
                                            >
                                                <Clock className="mr-2 h-4 w-4" />
                                                Price History
                                            </TabsTrigger>
                                        </TabsList>

                                        {/* General Tab */}
                                        <TabsContent
                                            value="general"
                                            forceRender
                                            className="mt-6"
                                        >
                                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                                {/* Main content */}
                                                <div className="space-y-6 lg:col-span-2">
                                                    <div className="space-y-6 rounded-xl border bg-card p-6">
                                                        <LocalizedField
                                                            label="Name"
                                                            name="name"
                                                            value={
                                                                formData.name
                                                            }
                                                            onChange={
                                                                handleNameChange
                                                            }
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
                                                            value={
                                                                formData.slug
                                                            }
                                                            onChange={
                                                                handleSlugChange
                                                            }
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
                                                                        (
                                                                            prev,
                                                                        ) => {
                                                                            const updated =
                                                                                {
                                                                                    ...prev.slug,
                                                                                };
                                                                            locales.forEach(
                                                                                (
                                                                                    l,
                                                                                ) => {
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
                                                                        e.target
                                                                            .value,
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
                                                                setFormData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        short_description:
                                                                            val,
                                                                    }),
                                                                )
                                                            }
                                                            placeholder="Brief product summary"
                                                            rows={2}
                                                            errors={
                                                                errors as Record<
                                                                    string,
                                                                    string
                                                                >
                                                            }
                                                        />

                                                        <LocalizedField
                                                            label="Description"
                                                            name="description"
                                                            type="richtext"
                                                            value={
                                                                formData.description
                                                            }
                                                            onChange={(val) =>
                                                                setFormData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        description:
                                                                            val,
                                                                    }),
                                                                )
                                                            }
                                                            placeholder="Product description..."
                                                            errors={
                                                                errors as Record<
                                                                    string,
                                                                    string
                                                                >
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                {/* Sidebar */}
                                                <div className="space-y-6">
                                                    <div className="space-y-6 rounded-xl border bg-card p-6">
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
                                                                        (
                                                                            item,
                                                                        ) =>
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
                                                                items={
                                                                    typeOptions
                                                                }
                                                                value={
                                                                    typeOptions.find(
                                                                        (
                                                                            item,
                                                                        ) =>
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
                                                                        {(
                                                                            type,
                                                                        ) => (
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
                                                    </div>

                                                    <div className="space-y-4 rounded-xl border bg-card p-6">
                                                        <Label>Status</Label>
                                                        <div className="space-y-3">
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
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleFormChange(
                                                                            'is_active',
                                                                            e
                                                                                .target
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
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleFormChange(
                                                                            'is_saleable',
                                                                            e
                                                                                .target
                                                                                .checked,
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 rounded border-input"
                                                                />
                                                                <Label
                                                                    htmlFor="is_saleable"
                                                                    className="font-normal"
                                                                >
                                                                    Available
                                                                    for sale
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
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleFormChange(
                                                                            'is_search_promoted',
                                                                            e
                                                                                .target
                                                                                .checked,
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 rounded border-input"
                                                                />
                                                                <Label
                                                                    htmlFor="is_search_promoted"
                                                                    className="font-normal"
                                                                >
                                                                    Promoted in
                                                                    Search
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
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleFormChange(
                                                                            'is_featured',
                                                                            e
                                                                                .target
                                                                                .checked,
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 rounded border-input"
                                                                />
                                                                <Label
                                                                    htmlFor="is_featured"
                                                                    className="font-normal"
                                                                >
                                                                    Featured
                                                                    Product
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {flags.length > 0 && (
                                                        <div className="space-y-4 rounded-xl border bg-card p-6">
                                                            <Label>
                                                                Product Flags
                                                            </Label>
                                                            <input
                                                                type="hidden"
                                                                name="flags[]"
                                                                value=""
                                                            />
                                                            <div className="space-y-2">
                                                                {flags.map(
                                                                    (flag) => (
                                                                        <label
                                                                            key={
                                                                                flag.id
                                                                            }
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
                                                                                {
                                                                                    flag.name
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                    ),
                                                                )}
                                                            </div>
                                                            <InputError
                                                                message={
                                                                    errors.flags
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                    <VersionHistory
                                                        modelType="product"
                                                        modelId={product.id}
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="core_attributes"
                                            forceRender
                                            className="mt-6"
                                        >
                                            <CoreAttributesSection
                                                schema={selectedSchema}
                                                values={
                                                    formData.attribute_values
                                                }
                                                errors={errors as FormErrors}
                                                onChange={(attributeValues) =>
                                                    handleFormChange(
                                                        'attribute_values',
                                                        attributeValues,
                                                    )
                                                }
                                            />
                                        </TabsContent>

                                        {/* Pricing & Stock Tab */}
                                        <TabsContent
                                            value="pricing"
                                            forceRender
                                            className="mt-6"
                                        >
                                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                                <div className="space-y-6 lg:col-span-2">
                                                    <div className="space-y-6 rounded-xl border bg-card p-6">
                                                        <h3 className="text-lg font-semibold">
                                                            Default Variant
                                                        </h3>

                                                        <input
                                                            type="hidden"
                                                            name="variant[id]"
                                                            value={
                                                                formData.variant
                                                                    .id ?? ''
                                                            }
                                                        />

                                                        <div className="grid grid-cols-2 gap-4">
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
                                                                        formData
                                                                            .variant
                                                                            .sku
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleVariantChange(
                                                                            'sku',
                                                                            e
                                                                                .target
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
                                                                        formData
                                                                            .variant
                                                                            .name
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleVariantChange(
                                                                            'name',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="variant.price">
                                                                    Price (in
                                                                    PLN) *
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
                                                                        formData
                                                                            .variant
                                                                            .price
                                                                            ? formData
                                                                                  .variant
                                                                                  .price /
                                                                              100
                                                                            : ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleVariantChange(
                                                                            'price',
                                                                            e
                                                                                .target
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
                                                                        formData
                                                                            .variant
                                                                            .cost_price
                                                                            ? formData
                                                                                  .variant
                                                                                  .cost_price /
                                                                              100
                                                                            : ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleVariantChange(
                                                                            'cost_price',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="variant.stock_quantity">
                                                                    Stock
                                                                    Quantity
                                                                </Label>
                                                                <Input
                                                                    id="variant.stock_quantity"
                                                                    name="variant[stock_quantity]"
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="0"
                                                                    defaultValue={
                                                                        formData
                                                                            .variant
                                                                            .stock_quantity
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleVariantChange(
                                                                            'stock_quantity',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label htmlFor="variant.stock_threshold">
                                                                    Low Stock
                                                                    Threshold
                                                                </Label>
                                                                <Input
                                                                    id="variant.stock_threshold"
                                                                    name="variant[stock_threshold]"
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="5"
                                                                    defaultValue={
                                                                        formData
                                                                            .variant
                                                                            .stock_threshold
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleVariantChange(
                                                                            'stock_threshold',
                                                                            e
                                                                                .target
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
                                                                    formData
                                                                        .variant
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
                                                                Variant is
                                                                active
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Pricing sidebar */}
                                                <div className="space-y-6">
                                                    <div className="rounded-xl border bg-card p-6">
                                                        <h3 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                                            Summary
                                                        </h3>
                                                        <dl className="space-y-3 text-sm">
                                                            <div className="flex justify-between">
                                                                <dt className="text-muted-foreground">
                                                                    Price
                                                                </dt>
                                                                <dd className="font-medium">
                                                                    {formData
                                                                        .variant
                                                                        .price
                                                                        ? formatPrice(
                                                                              formData
                                                                                  .variant
                                                                                  .price,
                                                                          )
                                                                        : '—'}
                                                                </dd>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <dt className="text-muted-foreground">
                                                                    Cost
                                                                </dt>
                                                                <dd className="font-medium">
                                                                    {formData
                                                                        .variant
                                                                        .cost_price
                                                                        ? formatPrice(
                                                                              formData
                                                                                  .variant
                                                                                  .cost_price,
                                                                          )
                                                                        : '—'}
                                                                </dd>
                                                            </div>
                                                            <div className="flex justify-between border-t pt-3">
                                                                <dt className="text-muted-foreground">
                                                                    Margin
                                                                </dt>
                                                                <dd className="font-medium text-green-600 dark:text-green-400">
                                                                    {formData
                                                                        .variant
                                                                        .price &&
                                                                    formData
                                                                        .variant
                                                                        .cost_price
                                                                        ? formatPrice(
                                                                              formData
                                                                                  .variant
                                                                                  .price -
                                                                                  formData
                                                                                      .variant
                                                                                      .cost_price,
                                                                          )
                                                                        : '—'}
                                                                </dd>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <dt className="text-muted-foreground">
                                                                    Stock
                                                                </dt>
                                                                <dd
                                                                    className={
                                                                        formData
                                                                            .variant
                                                                            .stock_quantity ===
                                                                        0
                                                                            ? 'font-medium text-destructive'
                                                                            : formData
                                                                                    .variant
                                                                                    .stock_quantity <=
                                                                                formData
                                                                                    .variant
                                                                                    .stock_threshold
                                                                              ? 'font-medium text-amber-600 dark:text-amber-400'
                                                                              : 'font-medium text-green-600 dark:text-green-400'
                                                                    }
                                                                >
                                                                    {
                                                                        formData
                                                                            .variant
                                                                            .stock_quantity
                                                                    }{' '}
                                                                    units
                                                                </dd>
                                                            </div>
                                                        </dl>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        {/* Media Tab */}
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
                                                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
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

                                        {/* SEO Tab */}
                                        <TabsContent
                                            value="metadata"
                                            forceRender
                                            className="mt-6"
                                        >
                                            <div className="rounded-xl border bg-card p-6">
                                                <SeoPanel
                                                    data={{
                                                        seo_title:
                                                            formData.seo_title,
                                                        seo_description:
                                                            formData.seo_description,
                                                        meta_robots:
                                                            formData.meta_robots,
                                                        og_image:
                                                            formData.og_image,
                                                        sitemap_exclude:
                                                            formData.sitemap_exclude,
                                                    }}
                                                    onChange={(field, value) =>
                                                        handleFormChange(
                                                            field as keyof Omit<
                                                                typeof formData,
                                                                | 'name'
                                                                | 'slug'
                                                                | 'description'
                                                                | 'short_description'
                                                            >,
                                                            value as never,
                                                        )
                                                    }
                                                    errors={
                                                        errors as Record<
                                                            string,
                                                            string
                                                        >
                                                    }
                                                    urlPath={`products/${formData.slug?.[defaultLocale] || 'product-slug'}`}
                                                    titleFallback={
                                                        typeof formData.name ===
                                                        'object'
                                                            ? (Object.values(
                                                                  formData.name,
                                                              )[0] as string)
                                                            : String(
                                                                  formData.name,
                                                              )
                                                    }
                                                    contentLength={
                                                        (
                                                            formData
                                                                .description?.[
                                                                defaultLocale
                                                            ] || ''
                                                        )
                                                            .replace(
                                                                /<[^>]*>/g,
                                                                '',
                                                            )
                                                            .trim().length
                                                    }
                                                />
                                            </div>
                                        </TabsContent>

                                        {/* Price History Tab */}
                                        <TabsContent
                                            value="price_history"
                                            className="mt-6"
                                        >
                                            <div className="rounded-xl border bg-card">
                                                <div className="border-b px-6 py-4">
                                                    <h3 className="font-semibold">
                                                        Price History
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Historical prices for
                                                        the default variant
                                                        (recorded daily for
                                                        Omnibus Directive
                                                        compliance).
                                                    </p>
                                                </div>
                                                {price_history.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                                        <Clock className="mb-3 h-10 w-10 text-muted-foreground" />
                                                        <p className="font-medium">
                                                            No price history yet
                                                        </p>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            Price changes will
                                                            be recorded here
                                                            automatically.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b bg-muted/50 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                                <th className="px-6 py-3">
                                                                    Date
                                                                </th>
                                                                <th className="px-6 py-3 text-right">
                                                                    Price
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y">
                                                            {price_history.map(
                                                                (
                                                                    entry,
                                                                    index,
                                                                ) => {
                                                                    const prevPrice =
                                                                        index <
                                                                        price_history.length -
                                                                            1
                                                                            ? price_history[
                                                                                  index +
                                                                                      1
                                                                              ]
                                                                                  .price
                                                                            : null;
                                                                    const diff =
                                                                        prevPrice !==
                                                                        null
                                                                            ? entry.price -
                                                                              prevPrice
                                                                            : null;

                                                                    return (
                                                                        <tr
                                                                            key={
                                                                                entry.id
                                                                            }
                                                                            className="hover:bg-muted/30"
                                                                        >
                                                                            <td className="px-6 py-3 text-muted-foreground">
                                                                                {formatDateTime(
                                                                                    entry.recorded_at,
                                                                                )}
                                                                            </td>
                                                                            <td className="px-6 py-3 text-right">
                                                                                <span className="font-medium">
                                                                                    {formatPrice(
                                                                                        entry.price,
                                                                                    )}
                                                                                </span>
                                                                                {diff !==
                                                                                    null &&
                                                                                    diff !==
                                                                                        0 && (
                                                                                        <span
                                                                                            className={
                                                                                                diff >
                                                                                                0
                                                                                                    ? 'ml-2 text-xs text-red-500'
                                                                                                    : 'ml-2 text-xs text-green-600 dark:text-green-400'
                                                                                            }
                                                                                        >
                                                                                            {diff >
                                                                                            0
                                                                                                ? '+'
                                                                                                : ''}
                                                                                            {formatPrice(
                                                                                                diff,
                                                                                            )}
                                                                                        </span>
                                                                                    )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                },
                                                            )}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                );
                            })()}

                            <div className="rounded-xl border bg-card p-6">
                                <div className="mb-4 space-y-1">
                                    <h3 className="text-base font-semibold">
                                        Metafields
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Advanced extension layer. Keep core
                                        product data in the main fields above.
                                    </p>
                                </div>
                                <MetafieldEditor
                                    metafields={formData.metafields}
                                    definitions={metafield_definitions}
                                    onChange={handleMetafieldsChange}
                                    allowCustomFields={false}
                                />
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: ProductController.index.url() },
    {
        title: 'Edit Product',
        href: '',
    },
];
