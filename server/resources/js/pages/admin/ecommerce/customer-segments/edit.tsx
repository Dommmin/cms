import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'lucide-react';
import * as CustomerSegmentController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CustomerSegmentController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FormProps, SegmentRule } from './form.types';

const RULE_FIELDS = [
    { value: 'total_spent', label: 'Total Spent' },
    { value: 'order_count', label: 'Order Count' },
    { value: 'average_order_value', label: 'Average Order Value' },
    { value: 'last_order_date', label: 'Last Order Date (days ago)' },
    { value: 'customer_age_days', label: 'Customer Age (days)' },
    { value: 'has_tag', label: 'Has Tag' },
];

const RULE_OPERATORS = [
    { value: '>', label: 'Greater than (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '=', label: 'Equals (=)' },
    { value: '>=', label: 'Greater or equal (>=)' },
    { value: '<=', label: 'Less or equal (<=)' },
];

export default function Edit({ segment }: Required<FormProps>) {
    const __ = useTranslation();
    const formId = 'segment-edit-form';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Customer Segments',
            href: CustomerSegmentController.index.url(),
        },
        {
            title: 'Edit Segment',
            href: CustomerSegmentController.edit.url(segment.id),
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: segment.name,
        description: segment.description ?? '',
        type: segment.type,
        rules: (segment.rules ?? []) as unknown as SegmentRule[],
        is_active: segment.is_active,
    });

    function addRule() {
        setData('rules', [
            ...data.rules,
            { field: 'total_spent', operator: '>', value: '' },
        ]);
    }

    function removeRule(index: number) {
        setData(
            'rules',
            data.rules.filter((_, i) => i !== index),
        );
    }

    function updateRule(
        index: number,
        field: keyof SegmentRule,
        value: string,
    ) {
        const updated = data.rules.map((rule, i) =>
            i === index ? { ...rule, [field]: value } : rule,
        );
        setData('rules', updated);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(CustomerSegmentController.update.url(segment.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Segment" />

            <Wrapper>
                <PageHeader
                    title="Edit Customer Segment"
                    description={`Update details for ${segment.name}`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={CustomerSegmentController.index.url()}
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
                    onSubmit={submit}
                    className="max-w-2xl space-y-6"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="name">{__('label.name', 'Name')}</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            autoFocus
                            placeholder="VIP Customers"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            Description (optional)
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe this segment..."
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type">{__('label.type', 'Type')}</Label>
                        <Select
                            value={data.type}
                            onValueChange={(val) =>
                                setData('type', val as 'manual' | 'dynamic')
                            }
                        >
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select segment type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manual">
                                    Manual — assign customers manually
                                </SelectItem>
                                <SelectItem value="dynamic">
                                    Dynamic — auto-match by rules
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" name="type" value={data.type} />
                        <InputError message={errors.type} />
                    </div>

                    {data.type === 'dynamic' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Rules</Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={addRule}
                                >
                                    <PlusIcon className="mr-1 h-3 w-3" />
                                    Add Rule
                                </Button>
                            </div>

                            {data.rules.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No rules yet. Add a rule to filter customers
                                    automatically.
                                </p>
                            )}

                            {data.rules.map((rule, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 rounded-md border p-4"
                                >
                                    <div className="grid flex-1 grid-cols-3 gap-2">
                                        <div>
                                            <Label className="mb-1 text-xs">
                                                Field
                                            </Label>
                                            <Select
                                                value={rule.field}
                                                onValueChange={(val) =>
                                                    updateRule(
                                                        index,
                                                        'field',
                                                        val,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select field" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {RULE_FIELDS.map((f) => (
                                                        <SelectItem
                                                            key={f.value}
                                                            value={f.value}
                                                        >
                                                            {f.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <input
                                                type="hidden"
                                                name={`rules[${index}][field]`}
                                                value={rule.field}
                                            />
                                        </div>
                                        <div>
                                            <Label className="mb-1 text-xs">
                                                Operator
                                            </Label>
                                            <Select
                                                value={rule.operator}
                                                onValueChange={(val) =>
                                                    updateRule(
                                                        index,
                                                        'operator',
                                                        val,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select operator" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {RULE_OPERATORS.map(
                                                        (op) => (
                                                            <SelectItem
                                                                key={op.value}
                                                                value={op.value}
                                                            >
                                                                {op.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <input
                                                type="hidden"
                                                name={`rules[${index}][operator]`}
                                                value={rule.operator}
                                            />
                                        </div>
                                        <div>
                                            <Label className="mb-1 text-xs">
                                                Value
                                            </Label>
                                            <Input
                                                value={rule.value}
                                                placeholder="e.g. 1000"
                                                onChange={(e) =>
                                                    updateRule(
                                                        index,
                                                        'value',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="mt-5 text-destructive hover:text-destructive"
                                        onClick={() => removeRule(index)}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked)
                            }
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            {__('label.is_active', 'Active')}
                        </Label>
                    </div>

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
