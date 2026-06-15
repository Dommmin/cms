import InputError from '@/components/input-error';
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
import type {
    CoreAttributeSchemaItem,
    ProductAttributeFormValue,
} from './core-attributes.types';

type FormErrors = Record<string, string>;

type Props = {
    errors: FormErrors;
    schema: CoreAttributeSchemaItem[];
    values: ProductAttributeFormValue[];
    onChange: (values: ProductAttributeFormValue[]) => void;
};

function fieldError(
    errors: FormErrors,
    index: number,
    suffix: 'value' | 'option_id' | 'option_ids',
): string | undefined {
    return errors[`attribute_values.${index}.${suffix}`];
}

export function CoreAttributesSection({
    errors,
    schema,
    values,
    onChange,
}: Props) {
    const updateValue = (
        attributeId: number,
        nextValue: Partial<ProductAttributeFormValue>,
    ) => {
        onChange(
            values.map((value) =>
                value.attribute_id === attributeId
                    ? { ...value, ...nextValue }
                    : value,
            ),
        );
    };

    if (schema.length === 0) {
        return (
            <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                Select a category with a configured attribute schema to manage
                core product attributes. Variant options remain managed
                separately.
            </div>
        );
    }

    return (
        <div className="space-y-6 rounded-xl border bg-card p-6">
            <div className="space-y-1">
                <h3 className="text-base font-semibold">Core Attributes</h3>
                <p className="text-sm text-muted-foreground">
                    Product-level catalog specs defined by the selected category
                    schema. These values do not replace variant options.
                </p>
            </div>

            {schema.map((attribute, index) => {
                const currentValue = values[index] ?? {
                    attribute_id: attribute.attribute_id,
                    value: '',
                    option_id: null,
                    option_ids: [],
                };

                return (
                    <div
                        key={attribute.attribute_id}
                        className="space-y-3 rounded-lg border p-4"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <Label className="text-sm font-medium">
                                {attribute.name}
                            </Label>
                            {attribute.is_required && (
                                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                                    Required
                                </span>
                            )}
                            {attribute.unit && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                    {attribute.unit}
                                </span>
                            )}
                            {attribute.is_inherited && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                    Inherited
                                </span>
                            )}
                        </div>

                        <input
                            type="hidden"
                            name={`attribute_values[${index}][attribute_id]`}
                            value={currentValue.attribute_id}
                        />

                        {attribute.type === 'text' && (
                            <>
                                <Input
                                    value={currentValue.value}
                                    onChange={(event) =>
                                        updateValue(attribute.attribute_id, {
                                            value: event.target.value,
                                        })
                                    }
                                    placeholder={attribute.name}
                                />
                                <input
                                    type="hidden"
                                    name={`attribute_values[${index}][value]`}
                                    value={currentValue.value}
                                />
                                <InputError
                                    message={fieldError(errors, index, 'value')}
                                />
                            </>
                        )}

                        {attribute.type === 'numeric' && (
                            <>
                                <Input
                                    type="number"
                                    step="0.0001"
                                    value={currentValue.value}
                                    onChange={(event) =>
                                        updateValue(attribute.attribute_id, {
                                            value: event.target.value,
                                        })
                                    }
                                    placeholder="0"
                                />
                                <input
                                    type="hidden"
                                    name={`attribute_values[${index}][value]`}
                                    value={currentValue.value}
                                />
                                <InputError
                                    message={fieldError(errors, index, 'value')}
                                />
                            </>
                        )}

                        {attribute.type === 'boolean' && (
                            <>
                                <Select
                                    value={currentValue.value || 'none'}
                                    onValueChange={(v) =>
                                        updateValue(attribute.attribute_id, {
                                            value: v === 'none' ? '' : v,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Not set" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Not set</SelectItem>
                                        <SelectItem value="1">Yes</SelectItem>
                                        <SelectItem value="0">No</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    name={`attribute_values[${index}][value]`}
                                    value={currentValue.value}
                                />
                                <InputError
                                    message={fieldError(errors, index, 'value')}
                                />
                            </>
                        )}

                        {attribute.type === 'color' && (
                            <>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="color"
                                        value={currentValue.value || '#000000'}
                                        onChange={(event) =>
                                            updateValue(
                                                attribute.attribute_id,
                                                {
                                                    value: event.target.value,
                                                },
                                            )
                                        }
                                        className="h-10 w-16 p-1"
                                    />
                                    <Input
                                        value={currentValue.value}
                                        onChange={(event) =>
                                            updateValue(
                                                attribute.attribute_id,
                                                {
                                                    value: event.target.value,
                                                },
                                            )
                                        }
                                        placeholder="#000000"
                                    />
                                </div>
                                <input
                                    type="hidden"
                                    name={`attribute_values[${index}][value]`}
                                    value={currentValue.value}
                                />
                                <InputError
                                    message={fieldError(errors, index, 'value')}
                                />
                            </>
                        )}

                        {attribute.type === 'date' && (
                            <>
                                <Input
                                    type="date"
                                    value={currentValue.value}
                                    onChange={(event) =>
                                        updateValue(attribute.attribute_id, {
                                            value: event.target.value,
                                        })
                                    }
                                />
                                <input
                                    type="hidden"
                                    name={`attribute_values[${index}][value]`}
                                    value={currentValue.value}
                                />
                                <InputError
                                    message={fieldError(errors, index, 'value')}
                                />
                            </>
                        )}

                        {attribute.type === 'select' && (
                            <>
                                <Select
                                    value={currentValue.option_id ? currentValue.option_id.toString() : 'none'}
                                    onValueChange={(v) =>
                                        updateValue(attribute.attribute_id, {
                                            option_id: v === 'none' ? null : Number(v),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Select an option</SelectItem>
                                        {attribute.options.map((option) => (
                                            <SelectItem
                                                key={option.id}
                                                value={option.id.toString()}
                                            >
                                                {option.value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    name={`attribute_values[${index}][option_id]`}
                                    value={currentValue.option_id ?? ''}
                                />
                                <InputError
                                    message={fieldError(
                                        errors,
                                        index,
                                        'option_id',
                                    )}
                                />
                            </>
                        )}

                        {attribute.type === 'multiselect' && (
                            <>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {attribute.options.map((option) => {
                                        const checked =
                                            currentValue.option_ids.includes(
                                                option.id,
                                            );

                                        return (
                                            <label
                                                key={option.id}
                                                className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(
                                                        nextChecked,
                                                    ) =>
                                                        updateValue(
                                                            attribute.attribute_id,
                                                            {
                                                                option_ids:
                                                                    nextChecked
                                                                        ? [
                                                                              ...currentValue.option_ids,
                                                                              option.id,
                                                                          ]
                                                                        : currentValue.option_ids.filter(
                                                                              (
                                                                                  selectedId,
                                                                              ) =>
                                                                                  selectedId !==
                                                                                  option.id,
                                                                          ),
                                                            },
                                                        )
                                                    }
                                                />
                                                <span className="flex items-center gap-2">
                                                    {option.color_hex && (
                                                        <span
                                                            className="inline-block h-3 w-3 rounded-full border"
                                                            style={{
                                                                backgroundColor:
                                                                    option.color_hex,
                                                            }}
                                                        />
                                                    )}
                                                    {option.value}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {currentValue.option_ids.map(
                                    (optionId, optionIndex) => (
                                        <input
                                            key={optionId}
                                            type="hidden"
                                            name={`attribute_values[${index}][option_ids][${optionIndex}]`}
                                            value={optionId}
                                        />
                                    ),
                                )}
                                <InputError
                                    message={fieldError(
                                        errors,
                                        index,
                                        'option_ids',
                                    )}
                                />
                            </>
                        )}
                    </div>
                );
            })}

            <InputError message={errors.attribute_values} />
        </div>
    );
}
