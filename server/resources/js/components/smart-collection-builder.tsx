import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type CollectionRule = {
    field: string;
    condition: string;
    value: string;
};

type FieldOption = {
    value: string;
    label: string;
    conditions: { value: string; label: string }[];
    valueType: 'text' | 'number' | 'date' | 'boolean';
};

const FIELD_OPTIONS: FieldOption[] = [
    {
        value: 'price',
        label: 'Price (cents)',
        conditions: [
            { value: 'less_than', label: 'Less than' },
            { value: 'greater_than', label: 'Greater than' },
        ],
        valueType: 'number',
    },
    {
        value: 'brand_id',
        label: 'Brand ID',
        conditions: [
            { value: 'equals', label: 'Equals' },
            { value: 'not_equals', label: 'Does not equal' },
        ],
        valueType: 'number',
    },
    {
        value: 'product_type_id',
        label: 'Product Type ID',
        conditions: [
            { value: 'equals', label: 'Equals' },
            { value: 'not_equals', label: 'Does not equal' },
        ],
        valueType: 'number',
    },
    {
        value: 'tag',
        label: 'Tag',
        conditions: [
            { value: 'equals', label: 'Has tag' },
            { value: 'not_equals', label: 'Does not have tag' },
        ],
        valueType: 'text',
    },
    {
        value: 'is_active',
        label: 'Is Active',
        conditions: [{ value: 'equals', label: 'Equals' }],
        valueType: 'boolean',
    },
    {
        value: 'created_at',
        label: 'Created At',
        conditions: [
            { value: 'after', label: 'After' },
            { value: 'before', label: 'Before' },
        ],
        valueType: 'date',
    },
];

const SELECT_CLASS =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

type Props = {
    rules: CollectionRule[];
    rulesMatch: 'all' | 'any';
    smartProductCount?: number;
    onRulesChange: (rules: CollectionRule[]) => void;
    onRulesMatchChange: (match: 'all' | 'any') => void;
};

export function SmartCollectionBuilder({
    rules,
    rulesMatch,
    smartProductCount,
    onRulesChange,
    onRulesMatchChange,
}: Props) {
    const addRule = () => {
        onRulesChange([
            ...rules,
            { field: 'price', condition: 'less_than', value: '' },
        ]);
    };

    const removeRule = (index: number) => {
        onRulesChange(rules.filter((_, i) => i !== index));
    };

    const updateRule = (
        index: number,
        key: keyof CollectionRule,
        value: string,
    ) => {
        const updated = rules.map((rule, i) => {
            if (i !== index) {
                return rule;
            }
            const newRule = { ...rule, [key]: value };
            // Reset condition when field changes
            if (key === 'field') {
                const fieldOption = FIELD_OPTIONS.find(
                    (f) => f.value === value,
                );
                newRule.condition = fieldOption?.conditions[0]?.value ?? '';
                newRule.value = '';
            }
            return newRule;
        });
        onRulesChange(updated);
    };

    const getFieldOption = (field: string) =>
        FIELD_OPTIONS.find((f) => f.value === field) ?? FIELD_OPTIONS[0];

    return (
        <div className="space-y-4 rounded-md border border-input p-4">
            <div className="flex items-center gap-4">
                <Label className="shrink-0 font-medium">
                    Products must match
                </Label>
                <select
                    value={rulesMatch}
                    onChange={(e) =>
                        onRulesMatchChange(e.target.value as 'all' | 'any')
                    }
                    className={SELECT_CLASS + ' w-auto'}
                >
                    <option value="all">all rules (AND)</option>
                    <option value="any">any rule (OR)</option>
                </select>
            </div>

            {rules.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No rules defined. Add a rule to start filtering products
                    automatically.
                </p>
            )}

            <div className="space-y-3">
                {rules.map((rule, index) => {
                    const fieldOption = getFieldOption(rule.field);
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-2 rounded-md bg-muted/30 p-3"
                        >
                            <select
                                value={rule.field}
                                onChange={(e) =>
                                    updateRule(index, 'field', e.target.value)
                                }
                                className={SELECT_CLASS}
                            >
                                {FIELD_OPTIONS.map((f) => (
                                    <option key={f.value} value={f.value}>
                                        {f.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={rule.condition}
                                onChange={(e) =>
                                    updateRule(
                                        index,
                                        'condition',
                                        e.target.value,
                                    )
                                }
                                className={SELECT_CLASS}
                            >
                                {fieldOption.conditions.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>

                            {fieldOption.valueType === 'boolean' ? (
                                <select
                                    value={rule.value}
                                    onChange={(e) =>
                                        updateRule(
                                            index,
                                            'value',
                                            e.target.value,
                                        )
                                    }
                                    className={SELECT_CLASS}
                                >
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            ) : (
                                <Input
                                    type={
                                        fieldOption.valueType === 'number'
                                            ? 'number'
                                            : fieldOption.valueType === 'date'
                                              ? 'date'
                                              : 'text'
                                    }
                                    placeholder="Value"
                                    value={rule.value}
                                    onChange={(e) =>
                                        updateRule(
                                            index,
                                            'value',
                                            e.target.value,
                                        )
                                    }
                                />
                            )}

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRule(index)}
                                className="shrink-0 text-destructive hover:text-destructive"
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRule}
                >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Rule
                </Button>

                {smartProductCount !== undefined && (
                    <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                            {smartProductCount}
                        </span>{' '}
                        {smartProductCount === 1 ? 'product' : 'products'} match
                    </p>
                )}
            </div>
        </div>
    );
}
