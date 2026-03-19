/**
 * Dynamic Block Form
 * Renders form fields from a block's JSON schema (config/blocks.php).
 * Developers define a block in config – no frontend changes needed.
 */

import { PlusIcon, TrashIcon } from 'lucide-react';
import {
    BlockRelationManager,
    type Relation,
    type RelationConfig as BRMRelationConfig,
} from '@/components/admin/block-relation-manager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type {
    ArraySchemaProperty,
    Block,
    BlockTypeConfig,
    SchemaProperty,
    StringSchemaProperty,
} from '../types';

// ─── Field renderers ──────────────────────────────────────────────────────────

type FieldProps = {
    fieldKey: string;
    schema: SchemaProperty;
    value: unknown;
    onChange: (value: unknown) => void;
};

function StringField({ fieldKey, schema, value, onChange }: FieldProps) {
    const s = schema as StringSchemaProperty;
    const str = (value as string | undefined) ?? '';
    const label = s.label ?? fieldKey;

    if (s.enum && s.enum.length > 0) {
        return (
            <div className="space-y-1.5">
                <Label htmlFor={fieldKey}>{label}</Label>
                {s.description && (
                    <p className="text-xs text-muted-foreground">
                        {s.description}
                    </p>
                )}
                <Select value={str} onValueChange={onChange}>
                    <SelectTrigger id={fieldKey}>
                        <SelectValue
                            placeholder={`Select ${label.toLowerCase()}…`}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {s.enum.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    if (s.format === 'richtext') {
        return (
            <div className="space-y-1.5">
                <Label>{label}</Label>
                {s.description && (
                    <p className="text-xs text-muted-foreground">
                        {s.description}
                    </p>
                )}
                <RichTextEditor value={str} onChange={onChange} />
            </div>
        );
    }

    if (s.format === 'textarea') {
        return (
            <div className="space-y-1.5">
                <Label htmlFor={fieldKey}>{label}</Label>
                {s.description && (
                    <p className="text-xs text-muted-foreground">
                        {s.description}
                    </p>
                )}
                <Textarea
                    id={fieldKey}
                    value={str}
                    placeholder={s.placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    rows={3}
                />
            </div>
        );
    }

    if (s.format === 'color') {
        return (
            <div className="space-y-1.5">
                <Label htmlFor={fieldKey}>{label}</Label>
                {s.description && (
                    <p className="text-xs text-muted-foreground">
                        {s.description}
                    </p>
                )}
                <div className="flex items-center gap-2">
                    <input
                        id={fieldKey}
                        type="color"
                        value={str || '#000000'}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-9 w-14 cursor-pointer rounded-md border bg-background p-1"
                    />
                    <Input
                        value={str}
                        placeholder="#000000"
                        onChange={(e) => onChange(e.target.value)}
                        className="flex-1 font-mono text-sm"
                        maxLength={7}
                    />
                </div>
            </div>
        );
    }

    if (s.format === 'code') {
        return (
            <div className="space-y-1.5">
                <Label htmlFor={fieldKey}>{label}</Label>
                {s.description && (
                    <p className="text-xs text-muted-foreground">
                        {s.description}
                    </p>
                )}
                <Textarea
                    id={fieldKey}
                    value={str}
                    placeholder={s.placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                />
            </div>
        );
    }

    // Default: plain text / URL input
    return (
        <div className="space-y-1.5">
            <Label htmlFor={fieldKey}>{label}</Label>
            {s.description && (
                <p className="text-xs text-muted-foreground">{s.description}</p>
            )}
            <Input
                id={fieldKey}
                type={s.format === 'url' ? 'url' : 'text'}
                value={str}
                placeholder={s.placeholder}
                maxLength={s.maxLength}
                onChange={(e) => onChange(e.target.value)}
            />
            {s.maxLength && (
                <p className="text-right text-xs text-muted-foreground">
                    {str.length}/{s.maxLength}
                </p>
            )}
        </div>
    );
}

function NumberField({ fieldKey, schema, value, onChange }: FieldProps) {
    const s = schema as Extract<SchemaProperty, { type: 'integer' | 'number' }>;
    const num = (value as number | undefined) ?? s.default ?? 0;

    return (
        <div className="space-y-1.5">
            <Label htmlFor={fieldKey}>{s.label ?? fieldKey}</Label>
            {s.description && (
                <p className="text-xs text-muted-foreground">{s.description}</p>
            )}
            <Input
                id={fieldKey}
                type="number"
                value={num as number}
                min={s.min}
                max={s.max}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </div>
    );
}

function BooleanField({ fieldKey, schema, value, onChange }: FieldProps) {
    const s = schema as Extract<SchemaProperty, { type: 'boolean' }>;
    const bool =
        (value as boolean | undefined) ??
        (s.default as boolean | undefined) ??
        false;

    return (
        <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
                <p className="text-sm font-medium">{s.label ?? fieldKey}</p>
                {s.description && (
                    <p className="text-xs text-muted-foreground">
                        {s.description}
                    </p>
                )}
            </div>
            <Switch checked={bool} onCheckedChange={onChange} />
        </div>
    );
}

function RepeaterField({ fieldKey, schema, value, onChange }: FieldProps) {
    const s = schema as ArraySchemaProperty;
    const items = (value as Record<string, unknown>[] | undefined) ?? [];
    const subProperties = s.items?.properties ?? {};

    const addItem = () => {
        const newItem: Record<string, unknown> = {};
        Object.entries(subProperties).forEach(([k, sub]) => {
            if ('default' in sub && sub.default !== undefined) {
                newItem[k] = sub.default;
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
                    Add item
                </Button>
            </div>

            {items.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No items yet. Click "Add item" to get started.
                </div>
            )}

            {items.map((item, idx) => (
                <div key={idx} className="rounded-lg border bg-muted/20 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Item {idx + 1}
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
                            ([subKey, subSchema]) => (
                                <SchemaField
                                    key={subKey}
                                    fieldKey={`${fieldKey}.${idx}.${subKey}`}
                                    schema={subSchema}
                                    value={item[subKey]}
                                    onChange={(v) => updateItem(idx, subKey, v)}
                                />
                            ),
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function SchemaField({ fieldKey, schema, value, onChange }: FieldProps) {
    switch (schema.type) {
        case 'string':
            return (
                <StringField
                    fieldKey={fieldKey}
                    schema={schema}
                    value={value}
                    onChange={onChange}
                />
            );
        case 'integer':
        case 'number':
            return (
                <NumberField
                    fieldKey={fieldKey}
                    schema={schema}
                    value={value}
                    onChange={onChange}
                />
            );
        case 'boolean':
            return (
                <BooleanField
                    fieldKey={fieldKey}
                    schema={schema}
                    value={value}
                    onChange={onChange}
                />
            );
        case 'array':
            return (
                <RepeaterField
                    fieldKey={fieldKey}
                    schema={schema}
                    value={value}
                    onChange={onChange}
                />
            );
        default:
            return null;
    }
}

// ─── Main component ───────────────────────────────────────────────────────────

type DynamicBlockFormProps = {
    block: Block;
    blockTypeConfig: BlockTypeConfig;
    onUpdateConfig: (config: Record<string, unknown>) => void;
    onUpdateRelations: (relations: Block['relations']) => void;
};

export function DynamicBlockForm({
    block,
    blockTypeConfig,
    onUpdateConfig,
    onUpdateRelations,
}: DynamicBlockFormProps) {
    const schema = blockTypeConfig.schema;
    const properties = schema?.properties ?? {};
    const allowedRelations = blockTypeConfig.allowed_relations ?? {};

    // Separate media relations from non-media (shown differently)
    const mediaRelationKeys = Object.keys(allowedRelations).filter((key) =>
        allowedRelations[key].types.some((t) => t.startsWith('media.')),
    );
    const nonMediaRelationKeys = Object.keys(allowedRelations).filter(
        (key) =>
            !allowedRelations[key].types.some((t) => t.startsWith('media.')),
    );

    // Convert block.relations to BlockRelationManager format
    const relationsData: Record<string, Relation | Relation[]> = {};
    block.relations?.forEach((rel) => {
        const key = rel.relation_key ?? rel.relation_type;
        const relationData: Relation = {
            type: rel.relation_type as Relation['type'],
            id: rel.relation_id,
            metadata: rel.metadata ?? undefined,
        };
        if (!relationsData[key]) {
            relationsData[key] = relationData;
        } else if (Array.isArray(relationsData[key])) {
            (relationsData[key] as Relation[]).push(relationData);
        } else {
            relationsData[key] = [relationsData[key] as Relation, relationData];
        }
    });

    const handleRelationsChange = (
        newRelations: Record<string, Relation | Relation[]>,
    ) => {
        const blockRelations: Block['relations'] = [];
        let position = 0;
        Object.entries(newRelations).forEach(([key, data]) => {
            const items = Array.isArray(data) ? data : [data];
            items.forEach((item) => {
                blockRelations.push({
                    relation_type: item.type,
                    relation_id: item.id,
                    relation_key: key,
                    position: position++,
                    metadata: item.metadata ?? null,
                });
            });
        });
        onUpdateRelations(blockRelations);
    };

    const updateConfigField = (key: string, value: unknown) => {
        onUpdateConfig({ ...block.configuration, [key]: value });
    };

    const hasSchemaFields = Object.keys(properties).length > 0;
    const hasNonMediaRelations = nonMediaRelationKeys.length > 0;

    // Filter allowed relations for media/non-media sections
    const mediaAllowedRelations = Object.fromEntries(
        mediaRelationKeys.map((k) => [k, allowedRelations[k]]),
    );
    const nonMediaAllowedRelations = Object.fromEntries(
        nonMediaRelationKeys.map((k) => [k, allowedRelations[k]]),
    );

    return (
        <div className="space-y-5">
            {/* Schema-driven fields */}
            {hasSchemaFields && (
                <div className="space-y-4">
                    {Object.entries(properties).map(([key, propSchema]) => (
                        <SchemaField
                            key={key}
                            fieldKey={key}
                            schema={propSchema}
                            value={block.configuration[key]}
                            onChange={(v) => updateConfigField(key, v)}
                        />
                    ))}
                </div>
            )}

            {/* Media relations – shown inline after content fields */}
            {mediaRelationKeys.length > 0 && (
                <div className="space-y-2">
                    <div className="border-t pt-4">
                        <p className="mb-3 text-sm font-medium text-foreground">
                            Media
                        </p>
                        <BlockRelationManager
                            blockType={block.type}
                            allowedRelations={
                                mediaAllowedRelations as Record<
                                    string,
                                    BRMRelationConfig
                                >
                            }
                            value={relationsData}
                            onChange={handleRelationsChange}
                        />
                    </div>
                </div>
            )}

            {/* Non-media relations (products, categories, forms…) */}
            {hasNonMediaRelations && (
                <div className="space-y-2">
                    <div className="border-t pt-4">
                        <p className="mb-3 text-sm font-medium text-foreground">
                            Linked Content
                        </p>
                        <BlockRelationManager
                            blockType={block.type}
                            allowedRelations={
                                nonMediaAllowedRelations as Record<
                                    string,
                                    BRMRelationConfig
                                >
                            }
                            value={relationsData}
                            onChange={handleRelationsChange}
                        />
                    </div>
                </div>
            )}

            {!hasSchemaFields && Object.keys(allowedRelations).length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No configurable fields for this block type.
                </div>
            )}
        </div>
    );
}
