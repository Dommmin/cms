import { Link, router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    GripVerticalIcon,
    PlusIcon,
    TrashIcon,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
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
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const FIELD_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'tel', label: 'Phone' },
    { value: 'url', label: 'URL' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select (dropdown)' },
    { value: 'radio', label: 'Radio buttons' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'file', label: 'File upload' },
    { value: 'date', label: 'Date' },
];

const HAS_OPTIONS = ['select', 'radio'];

type FieldData = {
    id?: number;
    label: string;
    name: string;
    type: string;
    placeholder: string;
    is_required: boolean;
    options: string[];
};

type FormData = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    notify_emails: string[];
    is_active: boolean;
    fields: Array<{
        id: number;
        label: string;
        name: string;
        type: string;
        placeholder?: string | null;
        is_required: boolean;
        options: string[] | null;
        settings: { placeholder?: string | null } | null;
    }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Forms', href: '/admin/forms' },
    { title: 'Edit', href: '#' },
];

function slugify(str: string) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

function emptyField(): FieldData {
    return { label: '', name: '', type: 'text', placeholder: '', is_required: false, options: [] };
}

function FieldEditor({
    field,
    onChange,
    onDelete,
    errors,
    index,
}: {
    field: FieldData;
    onChange: (patch: Partial<FieldData>) => void;
    onDelete: () => void;
    errors: Record<string, string>;
    index: number;
}) {
    const showOptions = HAS_OPTIONS.includes(field.type);

    const addOption = () => onChange({ options: [...field.options, ''] });
    const updateOption = (i: number, val: string) => {
        const opts = field.options.map((o, idx) => (idx === i ? val : o));
        onChange({ options: opts });
    };
    const removeOption = (i: number) => onChange({ options: field.options.filter((_, idx) => idx !== i) });

    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
                <GripVerticalIcon className="mt-2 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />

                <div className="min-w-0 flex-1 space-y-3">
                    {/* Row 1: label + type */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Label *</Label>
                            <Input
                                value={field.label}
                                onChange={(e) => {
                                    onChange({
                                        label: e.target.value,
                                        name: slugify(e.target.value),
                                    });
                                }}
                                placeholder="e.g., Full Name"
                            />
                            <InputError message={errors[`fields.${index}.label`]} />
                        </div>
                        <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Type *</Label>
                            <Select
                                value={field.type}
                                onValueChange={(v) => onChange({ type: v, options: HAS_OPTIONS.includes(v) ? field.options : [] })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FIELD_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: field name + placeholder */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Field name (slug) *</Label>
                            <Input
                                value={field.name}
                                onChange={(e) => onChange({ name: slugify(e.target.value) })}
                                placeholder="e.g., full_name"
                            />
                            <InputError message={errors[`fields.${index}.name`]} />
                        </div>
                        {field.type !== 'checkbox' && field.type !== 'file' && !showOptions && (
                            <div className="grid gap-1">
                                <Label className="text-xs text-muted-foreground">Placeholder</Label>
                                <Input
                                    value={field.placeholder}
                                    onChange={(e) => onChange({ placeholder: e.target.value })}
                                    placeholder="e.g., Enter your name"
                                />
                            </div>
                        )}
                    </div>

                    {/* Options for select/radio */}
                    {showOptions && (
                        <div className="grid gap-2">
                            <Label className="text-xs text-muted-foreground">Options</Label>
                            <div className="space-y-2">
                                {field.options.map((opt, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input
                                            value={opt}
                                            onChange={(e) => updateOption(i, e.target.value)}
                                            placeholder={`Option ${i + 1}`}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeOption(i)}
                                            className="text-destructive"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addOption}
                                >
                                    <PlusIcon className="mr-1 h-3 w-3" />
                                    Add option
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Required */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`req-${index}`}
                            checked={field.is_required}
                            onChange={(e) => onChange({ is_required: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor={`req-${index}`} className="text-sm font-normal">
                            Required field
                        </Label>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onDelete}
                    className="shrink-0 text-destructive"
                >
                    <TrashIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default function Edit({ form }: { form: FormData }) {
    const [name, setName] = useState(form.name);
    const [slug, setSlug] = useState(form.slug);
    const [description, setDescription] = useState(form.description ?? '');
    const [notifyEmails, setNotifyEmails] = useState((form.notify_emails ?? []).join('\n'));
    const [isActive, setIsActive] = useState(form.is_active);
    const [fields, setFields] = useState<FieldData[]>(
        (form.fields ?? []).map((f) => ({
            id: f.id,
            label: f.label,
            name: f.name,
            type: f.type,
            placeholder: f.settings?.placeholder ?? f.placeholder ?? '',
            is_required: f.is_required,
            options: f.options ?? [],
        })),
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const addField = () => setFields((prev) => [...prev, emptyField()]);

    const updateField = (index: number, patch: Partial<FieldData>) => {
        setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
    };

    const deleteField = (index: number) => {
        setFields((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        setProcessing(true);
        router.put(
            `/admin/forms/${form.id}`,
            {
                name,
                slug,
                description: description || null,
                notify_emails: notifyEmails
                    .split('\n')
                    .map((e) => e.trim())
                    .filter(Boolean),
                is_active: isActive,
                fields: fields.map((f) => ({
                    label: f.label,
                    name: f.name,
                    type: f.type,
                    placeholder: f.placeholder || null,
                    is_required: f.is_required,
                    options: HAS_OPTIONS.includes(f.type) ? f.options.filter(Boolean) : [],
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Form saved');
                    setErrors({});
                },
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    toast.error('Please fix the errors below');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${form.name}`} />

            <Wrapper>
                <PageHeader title={form.name} description="Edit form settings and fields">
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                <Link href='/admin/forms' prefetch cacheFor={30}>
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Forms
                        
                </Link>
            </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="space-y-6">
                    {/* Settings */}
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="mb-4 font-medium">Form Settings</h3>
                        <div className="grid max-w-2xl gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Form description..."
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notify_emails">
                                    Notify Emails{' '}
                                    <span className="font-normal text-muted-foreground">(one per line)</span>
                                </Label>
                                <Textarea
                                    id="notify_emails"
                                    value={notifyEmails}
                                    onChange={(e) => setNotifyEmails(e.target.value)}
                                    placeholder={'admin@example.com\nsupport@example.com'}
                                    rows={3}
                                />
                                <InputError message={errors.notify_emails} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="is_active" className="font-normal">Active</Label>
                            </div>
                        </div>
                    </div>

                    {/* Field Builder */}
                    <div className="rounded-lg border bg-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Form Fields</h3>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Define the fields users will fill in.
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addField}>
                                <PlusIcon className="mr-1 h-4 w-4" />
                                Add Field
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <FieldEditor
                                    key={index}
                                    field={field}
                                    index={index}
                                    errors={errors}
                                    onChange={(patch) => updateField(index, patch)}
                                    onDelete={() => deleteField(index)}
                                />
                            ))}

                            {fields.length === 0 && (
                                <div className="rounded-lg border border-dashed p-8 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No fields yet. Click "Add Field" to start building your form.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button onClick={handleSave} disabled={processing}>
                            {processing ? 'Saving...' : 'Save Form'}
                        </Button>
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
