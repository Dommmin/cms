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
import { Textarea } from '@/components/ui/textarea';
import type { StringSchemaProperty } from '../../types';
import type { FieldProps } from '../dynamic-block-form.types';

export function StringField({ fieldKey, schema, value, onChange }: FieldProps) {
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
