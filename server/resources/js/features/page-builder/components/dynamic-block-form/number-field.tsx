import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SchemaProperty } from '../../types';
import type { FieldProps } from '../dynamic-block-form.types';

export function NumberField({ fieldKey, schema, value, onChange }: FieldProps) {
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
