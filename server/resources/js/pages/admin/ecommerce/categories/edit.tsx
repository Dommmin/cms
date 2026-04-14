import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, EyeIcon } from 'lucide-react';
import { useState } from 'react';
import * as CategoryController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CategoryController';
import PreviewController from '@/actions/App/Http/Controllers/Admin/PreviewController';
import InputError from '@/components/input-error';
import { LocaleTabSwitcher } from '@/components/locale-tab-switcher';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { SeoPanel } from '@/components/seo-panel';
import { SmartCollectionBuilder } from '@/components/smart-collection-builder';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VersionHistory } from '@/components/version-history';
import Wrapper from '@/components/wrapper';
import { useAdminLocale } from '@/hooks/use-admin-locale';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';
import type { Category, CategoryEditProps, CollectionRule } from './edit.types';

export default function Edit({
    category,
    categories = [],
    smart_product_count = 0,
}: {
    category: CategoryEditProps;
    categories?: Category[];
    smart_product_count?: number;
}) {
    const { locales, frontendUrl } = usePage().props as {
        locales: SharedLocale[];
        frontendUrl: string;
    };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';

    const normalizedCategories: Category[] = Array.isArray(categories)
        ? categories
        : (Object.values(categories) as Category[]);

    const __ = useTranslation();
    const [activeLocale, setActiveLocale] = useAdminLocale(defaultLocale);
    const [nameValues, setNameValues] = useState<Record<string, string>>(
        category.name ?? { [defaultLocale]: '' },
    );
    const [descValues, setDescValues] = useState<Record<string, string>>(
        category.description ?? { [defaultLocale]: '' },
    );
    const [slug, setSlug] = useState(category.slug);
    const [isSlugManual, setIsSlugManual] = useState(
        category.slug !== slugify(category.name?.[defaultLocale] ?? ''),
    );
    const [collectionType, setCollectionType] = useState<'manual' | 'smart'>(
        category.collection_type ?? 'manual',
    );
    const [rules, setRules] = useState<CollectionRule[]>(category.rules ?? []);
    const [rulesMatch, setRulesMatch] = useState<'all' | 'any'>(
        category.rules_match ?? 'all',
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [seoData, setSeoData] = useState({
        seo_title: category.seo_title ?? '',
        seo_description: category.seo_description ?? '',
        meta_robots: category.meta_robots ?? 'index, follow',
        og_image: category.og_image ?? null,
        sitemap_exclude: category.sitemap_exclude ?? false,
    });

    const parentCategories = normalizedCategories.filter(
        (cat) => cat.id !== category.id,
    );

    const handleNameChange = (locale: string, value: string) => {
        const updated = { ...nameValues, [locale]: value };
        setNameValues(updated);
        if (!isSlugManual && locale === defaultLocale) {
            setSlug(slugify(value));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const form = e.currentTarget;
        const parentId =
            (form.elements.namedItem('parent_id') as HTMLSelectElement)
                ?.value || null;
        const isActive = (
            form.elements.namedItem('is_active') as HTMLInputElement
        )?.checked;

        router.put(
            CategoryController.update.url(category.id),
            {
                name: nameValues,
                description: descValues,
                slug,
                parent_id: parentId,
                is_active: isActive,
                collection_type: collectionType,
                rules: collectionType === 'smart' ? rules : [],
                rules_match: rulesMatch,
                ...seoData,
            },
            {
                onSuccess: () => router.visit(CategoryController.index.url()),
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Categories', href: CategoryController.index.url() },
        {
            title: 'Edit Category',
            href: CategoryController.edit.url(category.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Category" />

            <Wrapper>
                <PageHeader
                    title="Edit Category"
                    description={`Update details for ${nameValues[defaultLocale] ?? ''}`}
                >
                    <PageHeaderActions>
                        <Button variant="outline" asChild>
                            <a
                                href={PreviewController.url({
                                    query: {
                                        url: `${frontendUrl}/products?category=${category.slug}`,
                                        entity_type: 'category',
                                        entity_id: String(category.id),
                                        entity_name:
                                            nameValues[defaultLocale] ??
                                            category.slug,
                                        admin_url: CategoryController.edit.url(
                                            category.id,
                                        ),
                                    },
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <EyeIcon className="mr-2 h-4 w-4" />
                                {__('action.preview', 'Preview')}
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <Link
                                href={CategoryController.index.url()}
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
                    id="category-edit-form"
                    onSubmit={handleSubmit}
                    className="max-w-xl"
                >
                    <Tabs defaultValue="general" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="general">
                                {__('tab.general', 'General')}
                            </TabsTrigger>
                            <TabsTrigger value="seo">
                                {__('tab.seo', 'SEO')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-6">
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label>{__('label.name', 'Name')}</Label>
                                    <LocaleTabSwitcher
                                        locales={locales}
                                        activeLocale={activeLocale}
                                        onLocaleChange={setActiveLocale}
                                    />
                                </div>
                                {locales.length > 0 ? (
                                    locales.map((locale) => (
                                        <div
                                            key={locale.code}
                                            className={
                                                locale.code !== activeLocale
                                                    ? 'hidden'
                                                    : undefined
                                            }
                                        >
                                            <Input
                                                required={
                                                    locale.code ===
                                                    defaultLocale
                                                }
                                                autoFocus={
                                                    locale.code ===
                                                    defaultLocale
                                                }
                                                placeholder="Category name"
                                                value={
                                                    nameValues[locale.code] ??
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    handleNameChange(
                                                        locale.code,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <Input
                                        required
                                        autoFocus
                                        placeholder="Category name"
                                        value={nameValues[defaultLocale] ?? ''}
                                        onChange={(e) =>
                                            handleNameChange(
                                                defaultLocale,
                                                e.target.value,
                                            )
                                        }
                                    />
                                )}
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">
                                    {__('label.slug', 'Slug')}
                                </Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    readOnly={!isSlugManual}
                                    onChange={(e) =>
                                        setSlug(slugify(e.target.value))
                                    }
                                />
                                <InputError message={errors.slug} />
                                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <input
                                        type="checkbox"
                                        checked={isSlugManual}
                                        onChange={(e) => {
                                            const manual = e.target.checked;
                                            setIsSlugManual(manual);
                                            if (!manual) {
                                                setSlug(
                                                    slugify(
                                                        nameValues[
                                                            defaultLocale
                                                        ] ?? '',
                                                    ),
                                                );
                                            }
                                        }}
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    {__(
                                        'misc.slug_auto_hint',
                                        'Set slug manually',
                                    )}
                                </label>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="parent_id">
                                    {__('label.category', 'Parent Category')}
                                </Label>
                                <select
                                    id="parent_id"
                                    name="parent_id"
                                    defaultValue={category.parent_id ?? ''}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">None (Top level)</option>
                                    {parentCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.parent_id} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label>
                                        {__('label.description', 'Description')}
                                    </Label>
                                    <LocaleTabSwitcher
                                        locales={locales}
                                        activeLocale={activeLocale}
                                        onLocaleChange={setActiveLocale}
                                    />
                                </div>
                                {locales.length > 0 ? (
                                    locales.map((locale) => (
                                        <div
                                            key={locale.code}
                                            className={
                                                locale.code !== activeLocale
                                                    ? 'hidden'
                                                    : undefined
                                            }
                                        >
                                            <textarea
                                                rows={3}
                                                placeholder="Category description (optional)"
                                                value={
                                                    descValues[locale.code] ??
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setDescValues((prev) => ({
                                                        ...prev,
                                                        [locale.code]:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <textarea
                                        rows={3}
                                        placeholder="Category description (optional)"
                                        value={descValues[defaultLocale] ?? ''}
                                        onChange={(e) =>
                                            setDescValues((prev) => ({
                                                ...prev,
                                                [defaultLocale]: e.target.value,
                                            }))
                                        }
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                )}
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    defaultChecked={category.is_active}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    {__('label.is_active', 'Active')}
                                </Label>
                            </div>

                            <div className="grid gap-2">
                                <Label>Collection Type</Label>
                                <div className="flex gap-4">
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="collection_type"
                                            value="manual"
                                            checked={
                                                collectionType === 'manual'
                                            }
                                            onChange={() =>
                                                setCollectionType('manual')
                                            }
                                            className="h-4 w-4"
                                        />
                                        Manual
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="collection_type"
                                            value="smart"
                                            checked={collectionType === 'smart'}
                                            onChange={() =>
                                                setCollectionType('smart')
                                            }
                                            className="h-4 w-4"
                                        />
                                        Smart (auto-rule based)
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {collectionType === 'smart'
                                        ? 'Products are automatically included based on rules below.'
                                        : 'Products are manually assigned to this category.'}
                                </p>
                            </div>

                            {collectionType === 'smart' && (
                                <div className="grid gap-2">
                                    <Label>Rules</Label>
                                    <SmartCollectionBuilder
                                        rules={rules}
                                        rulesMatch={rulesMatch}
                                        smartProductCount={smart_product_count}
                                        onRulesChange={setRules}
                                        onRulesMatchChange={setRulesMatch}
                                    />
                                    <InputError message={errors.rules} />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="seo" className="space-y-6">
                            <SeoPanel
                                data={seoData}
                                onChange={(field, value) =>
                                    setSeoData((prev) => ({
                                        ...prev,
                                        [field]: value,
                                    }))
                                }
                                errors={errors}
                                urlPath={`products?category=${slug}`}
                                titleFallback={nameValues[defaultLocale] ?? ''}
                            />
                        </TabsContent>
                    </Tabs>

                    <StickyFormActions
                        formId="category-edit-form"
                        processing={processing}
                        submitLabel={__('action.save_changes', 'Save Changes')}
                    />

                    <VersionHistory
                        modelType="category"
                        modelId={category.id}
                    />
                </form>
            </Wrapper>
        </AppLayout>
    );
}
