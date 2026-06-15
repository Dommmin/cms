import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, EyeIcon } from 'lucide-react';
import { useState } from 'react';
import * as CategoryController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CategoryController';
import PreviewController from '@/actions/App/Http/Controllers/Admin/PreviewController';
import InputError from '@/components/input-error';
import MetafieldEditor from '@/components/metafield-editor';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { SeoPanel } from '@/components/seo-panel';
import { SmartCollectionBuilder } from '@/components/smart-collection-builder';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { LocalizedField } from '@/components/ui/localized-field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VersionHistory } from '@/components/version-history';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { slugify } from '@/lib/slug';
import type { BreadcrumbItem } from '@/types';
import type { SharedLocale } from '@/types/global';
import type { Category, CollectionRule, EditProps } from './edit.types';

export default function Edit({
    category,
    categories = [],
    smart_product_count = 0,
    metafield_definitions,
    metafields: initialMetafields,
}: EditProps) {
    const { locales, frontendUrl } = usePage().props as {
        locales: SharedLocale[];
        frontendUrl: string;
    };
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';

    const normalizedCategories: Category[] = Array.isArray(categories)
        ? categories
        : (Object.values(categories) as Category[]);

    const __ = useTranslation();
    const [nameValues, setNameValues] = useState<Record<string, string>>(
        category.name ?? {},
    );
    const [descValues, setDescValues] = useState<Record<string, string>>(
        category.description ?? {},
    );
    const [slug, setSlug] = useState(category.slug);
    const [isSlugManual, setIsSlugManual] = useState(
        category.slug !== slugify(category.name?.[defaultLocale] ?? ''),
    );
    const [parentId, setParentId] = useState(category.parent_id ? category.parent_id.toString() : '');
    const [collectionType, setCollectionType] = useState<'manual' | 'smart'>(
        category.collection_type ?? 'manual',
    );
    const [rules, setRules] = useState<CollectionRule[]>(category.rules ?? []);
    const [rulesMatch, setRulesMatch] = useState<'all' | 'any'>(
        category.rules_match ?? 'all',
    );
    const [metafields, setMetafields] = useState(initialMetafields ?? []);
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

    const handleNameChange = (newNames: Record<string, string>) => {
        setNameValues(newNames);
        if (!isSlugManual) {
            setSlug(slugify(newNames[defaultLocale] ?? ''));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const form = e.currentTarget;
        const parentIdValue = parentId ? Number(parentId) : null;
        const isActive = (
            form.elements.namedItem('is_active') as HTMLInputElement
        )?.checked;

        router.put(
            CategoryController.update.url(category.id),
            {
                name: nameValues,
                description: descValues,
                slug,
                parent_id: parentIdValue,
                is_active: isActive,
                collection_type: collectionType,
                rules: collectionType === 'smart' ? rules : [],
                rules_match: rulesMatch,
                metafields: metafields as unknown as Record<
                    string,
                    string | number | boolean | null | undefined
                >[],
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
                            <LocalizedField
                                label={__('label.name', 'Name')}
                                name="name"
                                value={nameValues}
                                onChange={handleNameChange}
                                required
                                placeholder="Category name"
                            />

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
                                <Select value={parentId || 'none'} onValueChange={(v) => setParentId(v === 'none' ? '' : v)}>
                                    <SelectTrigger id="parent_id">
                                        <SelectValue placeholder="None (Top level)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Top level)</SelectItem>
                                        {parentCategories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.parent_id} />
                            </div>

                            <LocalizedField
                                label={__('label.description', 'Description')}
                                type="textarea"
                                name="description"
                                value={descValues}
                                onChange={setDescValues}
                                placeholder="Category description (optional)"
                                rows={3}
                            />

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
                                contentLength={
                                    (descValues[defaultLocale] || '')
                                        .replace(/<[^>]*>/g, '')
                                        .trim().length
                                }
                            />
                        </TabsContent>
                    </Tabs>

                    <div className="rounded-lg border bg-card p-4">
                        <div className="mb-4 space-y-1">
                            <h3 className="text-base font-semibold">
                                Metafields
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Advanced extension layer. Keep category
                                membership, rules, and SEO in their dedicated
                                fields.
                            </p>
                        </div>
                        <MetafieldEditor
                            metafields={metafields}
                            definitions={metafield_definitions}
                            onChange={setMetafields}
                            allowCustomFields={false}
                        />
                    </div>

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
