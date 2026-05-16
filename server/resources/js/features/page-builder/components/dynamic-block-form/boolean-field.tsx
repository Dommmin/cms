import { Switch } from '@/components/ui/switch';
import type { SchemaProperty } from '../../types';
import type { FieldProps } from '../dynamic-block-form.types';

export function BooleanField({
    fieldKey,
    schema,
    value,
    onChange,
}: FieldProps) {
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
