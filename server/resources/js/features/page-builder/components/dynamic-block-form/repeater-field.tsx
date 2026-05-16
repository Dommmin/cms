import { PlusIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import type { ArraySchemaProperty } from '../../types';
import type { RepeaterFieldProps } from '../dynamic-block-form.types';

export function RepeaterField({
    fieldKey,
    schema,
    value,
    onChange,
    renderField,
}: RepeaterFieldProps) {
    const __ = useTranslation();
    const s = schema as ArraySchemaProperty;
    const items = (value as Record<string, unknown>[] | undefined) ?? [];
    const subProperties = s.items?.properties ?? {};

    const addItem = () => {
        const newItem: Record<string, unknown> = {};

        Object.entries(subProperties).forEach(([key, sub]) => {
            if ('default' in sub && sub.default !== undefined) {
                newItem[key] = sub.default;
            }
        });

        onChange([...items, newItem]);
    };

    const removeItem = (idx: number) => {
        onChange(items.filter((_, i) => i !== idx));
    };

    const updateItem = (idx: number, subKey: string, subValue: unknown) => {
        const updated = items.map((item, i) =>
            i === idx ? { ...item, [subKey]: subValue } : item,
        );

        onChange(updated);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label>{s.label ?? fieldKey}</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                >
                    <PlusIcon className="mr-1 h-3.5 w-3.5" />
                    {__('builder.add_item', 'Add item')}
                </Button>
            </div>

            {items.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {__(
                        'builder.no_items_yet',
                        'No items yet. Click "Add item" to get started.',
                    )}
                </div>
            )}

            {items.map((item, idx) => (
                <div key={idx} className="rounded-lg border bg-muted/20 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {__('builder.item', 'Item')} {idx + 1}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeItem(idx)}
                        >
                            <TrashIcon className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(subProperties).map(
                            ([subKey, subSchema]) =>
                                renderField({
                                    fieldKey: `${fieldKey}.${idx}.${subKey}`,
                                    schema: subSchema,
                                    value: item[subKey],
                                    onChange: (v) => updateItem(idx, subKey, v),
                                }),
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
