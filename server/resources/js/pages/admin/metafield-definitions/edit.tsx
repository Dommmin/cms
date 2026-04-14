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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { EditProps } from './edit.types';

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

export default function EditMetafieldDefinition({
    definition,
    ownerTypes,
}: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Metafield Definitions',
            href: MetafieldDefinitionController.index.url(),
        },
        {
            title: definition.name,
            href: MetafieldDefinitionController.edit.url(definition.id),
        },
    ];

    const [data, setData] = useState({
        owner_type: definition.owner_type,
        namespace: definition.namespace,
        key: definition.key,
        name: definition.name,
        type: definition.type,
        description: definition.description ?? '',
        pinned: definition.pinned,
        position: definition.position,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.put(
            MetafieldDefinitionController.update.url(definition.id),
            data,
            {
                onSuccess: () =>
                    toast.success('Metafield definition updated successfully'),
                onError: (errs) => {
                    setErrors(errs);
                    toast.error('Please fix the errors below');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${definition.name}`} />
            <Wrapper>
                <PageHeader
                    title={`Edit: ${definition.name}`}
                    description="Update this metafield definition"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={MetafieldDefinitionController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="owner_type">Owner Type *</Label>
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
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ownerTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {OWNER_TYPE_LABELS[type] ?? type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.owner_type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="namespace">
                            Namespace *{' '}
                            <span className="text-xs text-muted-foreground">
                                (lowercase, underscores only)
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
                            required
                        />
                        <InputError message={errors.namespace} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="key">
                            Key *{' '}
                            <span className="text-xs text-muted-foreground">
                                (lowercase, underscores only)
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
                            required
                        />
                        <InputError message={errors.key} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            required
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type">Type *</Label>
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
                                            {opt.label}
                                        </span>{' '}
                                        <span className="text-xs text-muted-foreground">
                                            — {opt.description}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="position">Position</Label>
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
                            Pinned (show at the top of the metafields list)
                        </Label>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            type="submit"
                            disabled={processing}
                        >
                            {processing
                                ? 'Saving...'
                                : 'Save Metafield Definition'}
                        </Button>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
