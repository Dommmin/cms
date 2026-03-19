import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    Clock,
    ExternalLink,
    EyeIcon,
    ImageIcon,
    Search,
    Settings,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { LocaleTabSwitcher } from '@/components/locale-tab-switcher';
import {
    MediaPickerModal,
    type MediaItem,
    type SelectedImage,
} from '@/components/media-picker-modal';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
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
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VersionHistory } from '@/components/version-history';
import Wrapper from '@/components/wrapper';
import { useAdminLocale } from '@/hooks/use-admin-locale';
import AppLayout from '@/layouts/app-layout';
import { slugify } from '@/lib/slug';
import { formatDateTime } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';

type Category = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
};
type ProductType = { id: number; name: string };
type Brand = { id: number; name: string };
type ProductFlag = {
    id: number;
    name: string;
    color: string;
    description?: string | null;
};
type FormErrors = Record<string, string>;
type TabKey = 'general' | 'pricing' | 'media' | 'metadata' | 'price_history';

type ProductVariant = {
    id?: number;
    sku: string;
    name: string;
    price: number;
    cost_price: number;
    compare_at_price?: number;
    weight: number;
    stock_quantity: number;
    stock_threshold: number;
    is_active: boolean;
    is_default: boolean;
    position: number;
};

type ProductImage = {
    id: number;
    media_id: number;
    url: string;
    name: string;
    is_thumbnail: boolean;
    position: number;
};

type PriceHistoryEntry = {
    id: number;
    price: number;
    recorded_at: string;
};

type FormData = {
    name: Record<string, string>;
    slug: string;
    description: Record<string, string>;
    short_description: Record<string, string>;
    sku_prefix: string;
    category_id: string | number | null;
    product_type_id: string | number | null;
    brand_id: string | number | null;
    is_active: boolean;
    is_saleable: boolean;
    seo_title: string;
    seo_description: string;
    meta_robots: string;
    og_image: string | null;
    sitemap_exclude: boolean;
    flags: number[];
    variant: ProductVariant;
    categories: number[];
};

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
    ],
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

    for (const tab of ['general', 'pricing', 'media', 'metadata'] as TabKey[]) {
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
}: {
    categories: Category[];
    types: ProductType[];
    brands: Brand[];
    flags: ProductFlag[];
    price_history: PriceHistoryEntry[];
    product: {
        id: number;
        name: Record<string, string>;
        slug: string;
        description?: Record<string, string>;
        short_description?: Record<string, string>;
        sku_prefix?: string;
        category_id: number;
        product_type_id: number;
        brand_id?: number;
        is_active: boolean;
        is_saleable: boolean;
        seo_title?: string;
        seo_description?: string;
        meta_robots?: string;
        og_image?: string | null;
        sitemap_exclude?: boolean;
        variant?: ProductVariant;
        images?: ProductImage[];
        categories?: Category[];
        flag_ids?: number[];
    };
}) {
    const { frontendUrl, locales } = usePage().props as {
        frontendUrl: string;
        locales: SharedLocale[];
    };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';
    const [activeTab, setActiveTab] = useState('general');
    const [activeLocale, setActiveLocale] = useAdminLocale(defaultLocale);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(
        (product.images ?? []).map((img) => ({
            id: img.media_id,
            url: img.url,
            name: img.name,
            is_thumbnail: img.is_thumbnail,
        })),
    );

    const [formData, setFormData] = useState<FormData>({
        name: product.name ?? { [defaultLocale]: '' },
        slug: product.slug,
        description: product.description ?? { [defaultLocale]: '' },
        short_description: product.short_description ?? { [defaultLocale]: '' },
        sku_prefix: product.sku_prefix ?? '',
        category_id: product.category_id,
        product_type_id: product.product_type_id,
        brand_id: product.brand_id ?? null,
        is_active: product.is_active,
        is_saleable: product.is_saleable,
        seo_title: product.seo_title ?? '',
        seo_description: product.seo_description ?? '',
        meta_robots: product.meta_robots ?? 'index, follow',
        og_image: product.og_image ?? null,
        sitemap_exclude: product.sitemap_exclude ?? false,
        flags: product.flag_ids ?? [],
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

    const [isSlugManual, setIsSlugManual] = useState(
        product.slug !== slugify(product.name?.[defaultLocale] ?? ''),
    );

    const handleNameChange = (locale: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            name: { ...prev.name, [locale]: value },
            slug:
                !isSlugManual && locale === defaultLocale
                    ? slugify(value)
                    : prev.slug,
        }));
    };

    const handleSlugChange = (value: string) => {
        setFormData((prev) => ({ ...prev, slug: slugify(value) }));
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

    const categoryOptions = categoriesList.map((c) => {
        const rawName = c.name;
        const label =
            typeof rawName === 'object' && rawName !== null
                ? ((rawName as Record<string, string>)[activeLocale] ??
                  (rawName as Record<string, string>)[defaultLocale] ??
                  Object.values(rawName as Record<string, string>)[0] ??
                  '')
                : (rawName as string);
        return { value: c.id, label };
    });

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Product" />

            <Wrapper>
                <PageHeader
                    title="Edit Product"
                    description={`Update details for ${product.name?.[defaultLocale] ?? ''}`}
                >
                    <PageHeaderActions>
                        <Button variant="outline" asChild>
                            <a
                                href={`${frontendUrl}/products/${product.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View on Site
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                href={`/admin/preview?${new URLSearchParams({ url: `${frontendUrl}/products/${product.slug}`, entity_type: 'product', entity_id: String(product.id), entity_name: product.name?.[defaultLocale] ?? product.slug, admin_url: `/admin/ecommerce/products/${product.id}/edit` }).toString()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <EyeIcon className="mr-2 h-4 w-4" />
                                Preview
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <Link
                                href={`/admin/ecommerce/products/${product.id}/variants`}
                                prefetch
                                cacheFor={30}
                            >
                                Manage Variants
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/ecommerce/products"
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
                    action={`/admin/ecommerce/products/${product.id}`}
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
                                        <TabsList className="grid w-full grid-cols-5">
                                            <TabsTrigger value="general">
                                                <Settings className="mr-2 h-4 w-4" />
                                                General
                                                {generalErrors > 0 && (
                                                    <span className="ml-2 rounded bg-destructive px-1.5 text-xs text-destructive-foreground">
                                                        {generalErrors}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger value="pricing">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Pricing & Stock
                                                {pricingErrors > 0 && (
                                                    <span className="ml-2 rounded bg-destructive px-1.5 text-xs text-destructive-foreground">
                                                        {pricingErrors}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger value="media">
                                                <ImageIcon className="mr-2 h-4 w-4" />
                                                Media
                                                {mediaErrors > 0 && (
                                                    <span className="ml-2 rounded bg-destructive px-1.5 text-xs text-destructive-foreground">
                                                        {mediaErrors}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger value="metadata">
                                                <Search className="mr-2 h-4 w-4" />
                                                SEO
                                                {metadataErrors > 0 && (
                                                    <span className="ml-2 rounded bg-destructive px-1.5 text-xs text-destructive-foreground">
                                                        {metadataErrors}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger value="price_history">
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
                                                        <div className="grid gap-2">
                                                            <div className="flex items-center justify-between">
                                                                <Label>
                                                                    Name *
                                                                </Label>
                                                                <LocaleTabSwitcher
                                                                    locales={
                                                                        locales
                                                                    }
                                                                    activeLocale={
                                                                        activeLocale
                                                                    }
                                                                    onLocaleChange={
                                                                        setActiveLocale
                                                                    }
                                                                />
                                                            </div>
                                                            {/* Hidden inputs for form submission */}
                                                            {locales.map(
                                                                (locale) => (
                                                                    <input
                                                                        key={`name-${locale.code}`}
                                                                        type="hidden"
                                                                        name={`name[${locale.code}]`}
                                                                        value={
                                                                            formData
                                                                                .name[
                                                                                locale
                                                                                    .code
                                                                            ] ??
                                                                            ''
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                            <Input
                                                                id="name"
                                                                autoFocus
                                                                placeholder="Product name"
                                                                value={
                                                                    formData
                                                                        .name[
                                                                        activeLocale
                                                                    ] ?? ''
                                                                }
                                                                onChange={(e) =>
                                                                    handleNameChange(
                                                                        activeLocale,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.name
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor="slug">
                                                                Slug *
                                                            </Label>
                                                            <Input
                                                                id="slug"
                                                                name="slug"
                                                                required
                                                                placeholder="product-slug"
                                                                value={
                                                                    formData.slug
                                                                }
                                                                readOnly={
                                                                    !isSlugManual
                                                                }
                                                                onChange={(e) =>
                                                                    handleSlugChange(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.slug
                                                                }
                                                            />
                                                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        isSlugManual
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const manual =
                                                                            e
                                                                                .target
                                                                                .checked;
                                                                        setIsSlugManual(
                                                                            manual,
                                                                        );
                                                                        if (
                                                                            !manual
                                                                        ) {
                                                                            setFormData(
                                                                                (
                                                                                    prev,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    slug: slugify(
                                                                                        prev
                                                                                            .name[
                                                                                            defaultLocale
                                                                                        ] ??
                                                                                            '',
                                                                                    ),
                                                                                }),
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="h-4 w-4 rounded border-input"
                                                                />
                                                                Set slug
                                                                manually
                                                            </label>
                                                        </div>

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

                                                        <div className="grid gap-2">
                                                            <Label>
                                                                Short
                                                                Description
                                                            </Label>
                                                            {locales.map(
                                                                (locale) => (
                                                                    <input
                                                                        key={`short_desc-${locale.code}`}
                                                                        type="hidden"
                                                                        name={`short_description[${locale.code}]`}
                                                                        value={
                                                                            formData
                                                                                .short_description[
                                                                                locale
                                                                                    .code
                                                                            ] ??
                                                                            ''
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                            <textarea
                                                                id="short_description"
                                                                rows={2}
                                                                placeholder="Brief product summary"
                                                                value={
                                                                    formData
                                                                        .short_description[
                                                                        activeLocale
                                                                    ] ?? ''
                                                                }
                                                                onChange={(e) =>
                                                                    setFormData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            short_description:
                                                                                {
                                                                                    ...prev.short_description,
                                                                                    [activeLocale]:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                        }),
                                                                    )
                                                                }
                                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.short_description
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label>
                                                                Description
                                                            </Label>
                                                            {locales.map(
                                                                (locale) => (
                                                                    <input
                                                                        key={`desc-${locale.code}`}
                                                                        type="hidden"
                                                                        name={`description[${locale.code}]`}
                                                                        value={
                                                                            formData
                                                                                .description[
                                                                                locale
                                                                                    .code
                                                                            ] ??
                                                                            ''
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                            <RichTextEditor
                                                                key={`desc-editor-${activeLocale}`}
                                                                value={
                                                                    formData
                                                                        .description[
                                                                        activeLocale
                                                                    ] ?? ''
                                                                }
                                                                onChange={(
                                                                    val,
                                                                ) =>
                                                                    setFormData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            description:
                                                                                {
                                                                                    ...prev.description,
                                                                                    [activeLocale]:
                                                                                        val,
                                                                                },
                                                                        }),
                                                                    )
                                                                }
                                                                placeholder="Product description..."
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.description
                                                                }
                                                            />
                                                        </div>
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
                                                                    handleFormChange(
                                                                        'category_id',
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
                                                    urlPath={`products/${formData.slug || 'product-slug'}`}
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
                multiple
            />
        </AppLayout>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/admin/ecommerce/products' },
    {
        title: 'Edit Product',
        href: '/admin/ecommerce/products/:id/edit',
    },
];
