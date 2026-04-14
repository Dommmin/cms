import { PlusIcon, TrashIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
import type {
    MetafieldDefinitionEntry,
    MetafieldEditorProps,
    MetafieldEntry,
} from './metafield-editor.types';

const FIELD_TYPES = [
    'string',
    'integer',
    'float',
    'boolean',
    'json',
    'date',
    'datetime',
    'url',
    'color',
    'image',
    'rich_text',
] as const;

function MetafieldInput({
    field,
    onChange,
}: {
    field: MetafieldEntry;
    onChange: (value: string | null) => void;
}) {
    const value = field.value ?? '';

    switch (field.type) {
        case 'boolean':
            return (
                <Checkbox
                    checked={value === 'true'}
                    onCheckedChange={(checked) =>
                        onChange(checked ? 'true' : 'false')
                    }
                />
            );
        case 'integer':
            return (
                <Input
                    type="number"
                    step="1"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full"
                />
            );
        case 'float':
            return (
                <Input
                    type="number"
                    step="any"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full"
                />
            );
        case 'date':
            return (
                <Input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full"
                />
            );
        case 'datetime':
            return (
                <Input
                    type="datetime-local"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full"
                />
            );
        case 'color':
            return (
                <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={value || '#000000'}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-9 w-14 cursor-pointer p-1"
                    />
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                    />
                </div>
            );
        case 'url':
            return (
                <Input
                    type="url"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://"
                    className="w-full"
                />
            );
        case 'json':
        case 'rich_text':
            return (
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={4}
                    className="w-full font-mono text-sm"
                    placeholder={
                        field.type === 'json' ? '{"key": "value"}' : ''
                    }
                />
            );
        default:
            return (
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full"
                />
            );
    }
}

export default function MetafieldEditor({
    metafields,
    definitions,
    onChange,
}: MetafieldEditorProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newField, setNewField] = useState<{
        namespace: string;
        key: string;
        type: string;
        value: string;
    }>({
        namespace: '',
        key: '',
        type: 'string',
        value: '',
    });

    const activeMetafields = metafields.filter((mf) => !mf._delete);

    const grouped = useMemo(() => {
        const map: Record<string, MetafieldEntry[]> = {};
        for (const mf of activeMetafields) {
            if (!map[mf.namespace]) {
                map[mf.namespace] = [];
            }
            map[mf.namespace].push(mf);
        }
        return map;
    }, [activeMetafields]);

    const findDefinition = (
        namespace: string,
        key: string,
    ): MetafieldDefinitionEntry | undefined =>
        definitions.find((d) => d.namespace === namespace && d.key === key);

    const handleValueChange = (index: number, value: string | null) => {
        const updated = metafields.map((mf, i) =>
            i === index ? { ...mf, value } : mf,
        );
        onChange(updated);
    };

    const handleDelete = (index: number) => {
        const updated = metafields.map((mf, i) =>
            i === index ? { ...mf, _delete: true } : mf,
        );
        onChange(updated);
    };

    const handleAddField = () => {
        if (!newField.namespace || !newField.key) return;

        const exists = activeMetafields.some(
            (mf) =>
                mf.namespace === newField.namespace &&
                mf.key === newField.key,
        );
        if (exists) return;

        onChange([
            ...metafields,
            {
                namespace: newField.namespace,
                key: newField.key,
                type: newField.type,
                value: newField.value || null,
            },
        ]);

        setNewField({ namespace: '', key: '', type: 'string', value: '' });
        setShowAddForm(false);
    };

    const handleDefinitionSelect = (defKey: string) => {
        const [ns, k] = defKey.split('::');
        const def = definitions.find((d) => d.namespace === ns && d.key === k);
        if (def) {
            setNewField((prev) => ({
                ...prev,
                namespace: def.namespace,
                key: def.key,
                type: def.type,
            }));
        }
    };

    const availableDefinitions = definitions.filter(
        (def) =>
            !activeMetafields.some(
                (mf) =>
                    mf.namespace === def.namespace && mf.key === def.key,
            ),
    );

    const getOriginalIndex = (namespace: string, key: string): number =>
        metafields.findIndex(
            (mf) => mf.namespace === namespace && mf.key === key,
        );

    return (
        <div className="space-y-4">
            {Object.keys(grouped).length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No metafields yet. Click &quot;Add Metafield&quot; to get
                    started.
                </p>
            )}

            {Object.entries(grouped).map(([namespace, fields]) => (
                <div key={namespace} className="rounded-lg border p-4">
                    <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {namespace}
                    </h4>
                    <div className="space-y-4">
                        {fields.map((field) => {
                            const def = findDefinition(
                                field.namespace,
                                field.key,
                            );
                            const originalIndex = getOriginalIndex(
                                field.namespace,
                                field.key,
                            );
                            return (
                                <div
                                    key={`${field.namespace}::${field.key}`}
                                    className="flex items-start gap-3"
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm font-medium">
                                                {def ? def.name : field.key}
                                            </Label>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {field.type}
                                            </Badge>
                                            {!def && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    custom
                                                </Badge>
                                            )}
                                        </div>
                                        {def?.description && (
                                            <p className="text-xs text-muted-foreground">
                                                {def.description}
                                            </p>
                                        )}
                                        <MetafieldInput
                                            field={field}
                                            onChange={(val) =>
                                                handleValueChange(
                                                    originalIndex,
                                                    val,
                                                )
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="mt-5 text-destructive hover:text-destructive"
                                        onClick={() =>
                                            handleDelete(originalIndex)
                                        }
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {showAddForm && (
                <div className="rounded-lg border border-dashed p-4">
                    <h4 className="mb-3 text-sm font-semibold">
                        Add Metafield
                    </h4>
                    <div className="space-y-3">
                        {availableDefinitions.length > 0 && (
                            <div className="grid gap-1">
                                <Label className="text-xs">
                                    From definition (optional)
                                </Label>
                                <Select
                                    onValueChange={handleDefinitionSelect}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a definition..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDefinitions.map((def) => (
                                            <SelectItem
                                                key={`${def.namespace}::${def.key}`}
                                                value={`${def.namespace}::${def.key}`}
                                            >
                                                {def.namespace}.{def.key} —{' '}
                                                {def.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-1">
                                <Label className="text-xs">Namespace *</Label>
                                <Input
                                    value={newField.namespace}
                                    onChange={(e) =>
                                        setNewField((prev) => ({
                                            ...prev,
                                            namespace: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. specs"
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs">Key *</Label>
                                <Input
                                    value={newField.key}
                                    onChange={(e) =>
                                        setNewField((prev) => ({
                                            ...prev,
                                            key: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. weight"
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                        <div className="grid gap-1">
                            <Label className="text-xs">Type</Label>
                            <Select
                                value={newField.type}
                                onValueChange={(val) =>
                                    setNewField((prev) => ({
                                        ...prev,
                                        type: val,
                                    }))
                                }
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FIELD_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1">
                            <Label className="text-xs">
                                Initial value (optional)
                            </Label>
                            <Input
                                value={newField.value}
                                onChange={(e) =>
                                    setNewField((prev) => ({
                                        ...prev,
                                        value: e.target.value,
                                    }))
                                }
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleAddField}
                                disabled={!newField.namespace || !newField.key}
                            >
                                Add
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewField({
                                        namespace: '',
                                        key: '',
                                        type: 'string',
                                        value: '',
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {!showAddForm && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(true)}
                >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Metafield
                </Button>
            )}
        </div>
    );
}
