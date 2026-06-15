import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as MetafieldDefinitionController from '@/actions/App/Http/Controllers/Admin/MetafieldDefinitionController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { CreateProps } from './create.types';

const OWNER_TYPE_LABELS: Record<string, string> = {
    'App\\Models\\Product': 'Product',
    'App\\Models\\BlogPost': 'Blog Post',
    'App\\Models\\Page': 'Page',
    'App\\Models\\Category': 'Category',
};

const TYPE_OPTIONS = [
    { value: 'string', label: 'String', description: 'Plain text value' },
    { value: 'integer', label: 'Integer', description: 'Whole number' },
    { value: 'float', label: 'Float', description: 'Decimal number' },
    {
        value: 'boolean',
        label: 'Boolean',
        description: 'True or false value',
    },
    { value: 'json', label: 'JSON', description: 'JSON-encoded data' },
    { value: 'date', label: 'Date', description: 'Date (YYYY-MM-DD)' },
    {
        value: 'datetime',
        label: 'Datetime',
        description: 'Date and time value',
    },
    { value: 'url', label: 'URL', description: 'Web address' },
    { value: 'color', label: 'Color', description: 'Hex color value' },
    { value: 'image', label: 'Image', description: 'Image URL or path' },
    {
        value: 'rich_text',
        label: 'Rich Text',
        description: 'Formatted HTML content',
    },
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Metafield Definitions',
        href: MetafieldDefinitionController.index.url(),
    },
    { title: 'Create', href: MetafieldDefinitionController.create.url() },
];

export default function CreateMetafieldDefinition({ ownerTypes }: CreateProps) {
    const __ = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('metafields.definitions_title', 'Metafield Definitions'),
            href: MetafieldDefinitionController.index.url(),
        },
        { title: __('action.create', 'Create'), href: MetafieldDefinitionController.create.url() },
    ];

    const [data, setData] = useState({
        owner_type: '',
        namespace: '',
        key: '',
        name: '',
        type: 'string',
        visibility: 'admin_only',
        storefront_exposed: false,
        description: '',
        pinned: false,
        position: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(MetafieldDefinitionController.store.url(), data, {
            onSuccess: () =>
                toast.success(__('metafields.definition_created', 'Metafield definition created successfully')),
            onError: (errs) => {
                setErrors(errs);
                toast.error(__('common.fix_errors', 'Please fix the errors below'));
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('metafields.create_title', 'Create Metafield Definition')} />
            <Wrapper>
                <PageHeader
                    title={__('metafields.create_title', 'Create Metafield Definition')}
                    description={__('metafields.create_description', 'Add a new metafield definition for a content type')}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={MetafieldDefinitionController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="owner_type">{__('metafields.owner_type_required', 'Owner Type *')}</Label>
                        <Select
                            value={data.owner_type}
                            onValueChange={(val) =>
                                setData((prev) => ({
                                    ...prev,
                                    owner_type: val,
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={__('metafields.select_content_type', 'Select content type')} />
                            </SelectTrigger>
                            <SelectContent>
                                {ownerTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {OWNER_TYPE_LABELS[type] ? __(OWNER_TYPE_LABELS[type]) : type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.owner_type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="namespace">
                            {__('metafields.namespace_required', 'Namespace *')}{' '}
                            <span className="text-xs text-muted-foreground">
                                ({__('metafields.lowercase_underscores_only', 'lowercase, underscores only')})
                            </span>
                        </Label>
                        <Input
                            id="namespace"
                            value={data.namespace}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    namespace: e.target.value,
                                }))
                            }
                            placeholder="e.g. specs, shipping"
                            required
                        />
                        <InputError message={errors.namespace} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="key">
                            {__('metafields.key_required', 'Key *')}{' '}
                            <span className="text-xs text-muted-foreground">
                                ({__('metafields.lowercase_underscores_only', 'lowercase, underscores only')})
                            </span>
                        </Label>
                        <Input
                            id="key"
                            value={data.key}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    key: e.target.value,
                                }))
                            }
                            placeholder="e.g. weight, color_hex"
                            required
                        />
                        <InputError message={errors.key} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">{__('metafields.name_required', 'Name *')}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            placeholder={__('metafields.name_placeholder', 'Human-readable label')}
                            required
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type">{__('metafields.type_required', 'Type *')}</Label>
                        <Select
                            value={data.type}
                            onValueChange={(val) =>
                                setData((prev) => ({ ...prev, type: val }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TYPE_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        <span className="font-medium">
                                            {__(opt.label)}
                                        </span>{' '}
                                        <span className="text-xs text-muted-foreground">
                                            — {__(opt.description)}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="visibility">{__('metafields.visibility_required', 'Visibility *')}</Label>
                        <Select
                            value={data.visibility}
                            onValueChange={(val) =>
                                setData((prev) => ({
                                    ...prev,
                                    visibility: val,
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="private">{__('metafields.visibility_private', 'Private')}</SelectItem>
                                <SelectItem value="admin_only">
                                    {__('metafields.visibility_admin_only', 'Admin only')}
                                </SelectItem>
                                <SelectItem value="storefront">
                                    {__('metafields.visibility_storefront', 'Storefront')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.visibility} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="storefront_exposed"
                            checked={data.storefront_exposed}
                            onCheckedChange={(checked) =>
                                setData((prev) => ({
                                    ...prev,
                                    storefront_exposed: checked === true,
                                }))
                            }
                        />
                        <Label
                            htmlFor="storefront_exposed"
                            className="font-normal"
                        >
                            {__('metafields.expose_storefront', 'Expose on storefront API')}
                        </Label>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">{__('metafields.description', 'Description')}</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            placeholder={__('metafields.description_placeholder', 'Brief description of this metafield')}
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="position">{__('metafields.position', 'Position')}</Label>
                        <Input
                            id="position"
                            type="number"
                            min="0"
                            value={data.position}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    position: parseInt(e.target.value) || 0,
                                }))
                            }
                        />
                        <InputError message={errors.position} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="pinned"
                            checked={data.pinned}
                            onCheckedChange={(checked) =>
                                setData((prev) => ({
                                    ...prev,
                                    pinned: checked === true,
                                }))
                            }
                        />
                        <Label htmlFor="pinned" className="font-normal">
                            {__('metafields.pinned_description', 'Pinned (show at the top of the metafields list)')}
                        </Label>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            type="submit"
                            disabled={processing}
                        >
                            {processing
                                ? __('common.creating', 'Creating...')
                                : __('metafields.create_button', 'Create Metafield Definition')}
                        </Button>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
